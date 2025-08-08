import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Modal from "@mui/material/Modal";
import Grid from "@mui/material/Grid";

import PauseIcon from "@mui/icons-material/Pause";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import CountdownTimerUI from "components/CountDownTimer/CountDownTimerUI";
import api from "utils/api.js";

import "./TimerUI.css";
import TimeExceededModal from "components/Modal/TimeExceededModal";
import { useAuth } from "contexts/FinalSubmissionPageAuthContext";
import { useGlobalState } from "contexts/GlobalStateContext";

const TimerUI = ({ session, setSession }) => {
  const { toggleNextButton } = useAuth();
  const { defects, setDefects } = useGlobalState();
  const navigate = useNavigate();

  const {
    loginId = "",
    buildNumber = "",
    numberOfParts = 0,
    timePerPart = 0,
    startTime,
  } = session || {};

  // duration in seconds
  const [duration, setDuration] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // for modal display

  // Control overtime popup
  const [shouldExceedPopupShow, setShouldExceedPopupShow] = useState(false);
  const [popupInteractionDuration, setPopupInteractionDuration] = useState(600);

  const [nextPopupTime, setNextPopupTime] = useState(null);

  const onSwitchPopupModal = (shouldShow = true) => {
    setShouldExceedPopupShow(shouldShow);
  };

  const continueCountDownFromPopupInteraction = (session) => {
    setSession(session);
    setPopupInteractionDuration(600);
    setIsRunning(true);
  };

  const pauseCountDownFromPopupInteraction = (session) => {
    setSession(session);
    setPopupInteractionDuration(600);
    setIsRunning(true);
  };

  // Calculate initial duration based on session info
  const calculateInitialDuration = useCallback(() => {
    if (!session || !startTime) return 0;

    const totalDuration = numberOfParts * timePerPart * 60;

    const pauseEvents =
      session.pauseEvents?.filter((event) => !event.resumedAt) || [];

    const now = pauseEvents.length
      ? new Date(pauseEvents[0].pausedAt).getTime()
      : Date.now();

    const totalPausedTime = session.totalPausedTime || 0;

    const start = new Date(startTime).getTime();
    const elapsed = Math.floor((now - start) / 1000);

    const totalPopupInteractionDuration =
      session.popupInteractions?.reduce((acc, interaction) => {
        if (interaction.popupShownAt && interaction.respondedAt) {
          const diff =
            new Date(interaction.respondedAt).getTime() -
            new Date(interaction.popupShownAt).getTime();
          return acc + diff / 1000;
        }
        return acc;
      }, 0) || 0;

    return Math.floor(
      totalDuration - elapsed + totalPausedTime + totalPopupInteractionDuration
    );
  }, [session, numberOfParts, timePerPart, startTime]);

  // Initialize timer when session changes
  useEffect(() => {
    if (!session) {
      navigate("/");
      return;
    }

    const initialDuration = calculateInitialDuration();
    setDuration(initialDuration);
    // if user is recover a popup interaction session
    const popupInteractions = session.popupInteractions || [];
    const isOnAfterPopupInteractionSession =
      popupInteractions.length > 0 &&
      popupInteractions.every(
        (i) => i.response !== "N/A" && i.respondedAt && i.response !== "Auto"
      );
    const isOnPopupInteractionSession = popupInteractions.some(
      (i) => i.response === "N/A" && !i.respondedAt
    );

    if (isOnPopupInteractionSession) {
      // if it is on a popup session, we need to calculate what is the remaining of popup decide time
      const now = Date.now();
      const activePopupInteraction = popupInteractions.find(
        (i) => i.response === "N/A" && !i.respondedAt
      );
      const start = new Date(activePopupInteraction.popupShownAt).getTime();
      const elapsed = Math.floor((now - start) / 1000);
      const remainingDecideDuration = 600 - elapsed;
      if (remainingDecideDuration <= 0) {
        // if we don't even have decide duration, then we consider this as auto submit
        // submit the session
        api
          .patch("/session/auto-submit", {
            sessionId: session._id,
          })
          .then((res) => {
            if (res.data.success) {
              localStorage.removeItem("sessionId");
              navigate("/");
            } else {
              // TODO: error handling
              console.log(res.data.message);
            }
          });
        return;
      }
      // it is not paused, but countdown stop running
      setIsRunning(false);
      setPopupInteractionDuration(remainingDecideDuration);
      setShouldExceedPopupShow(true);
      return;
    } else if (
      !isOnPopupInteractionSession &&
      !isOnAfterPopupInteractionSession &&
      initialDuration < 0
    ) {
      // if user is recover from overtime countdown and didn't get popupinteraction
      if (initialDuration <= -600) {
        // if it is even over 10 mins, just auto-submit it
        api
          .patch("/session/auto-submit", {
            sessionId: session._id,
          })
          .then((res) => {
            if (res.data.success) {
              localStorage.removeItem("sessionId");
              navigate("/");
            } else {
              // TODO: error handling
              console.log(res.data.message);
            }
          });
      } else {
        // if it has time to popup, then create popup event
        api
          .patch("/session/recover-session-from-countdown", {
            sessionId: session._id,
          })
          .then((res) => {
            if (res.data.success) {
              setSession(res.data.data);
              return;
            } else {
              // TODO: error handling
              console.log(res.data.message);
            }
          });
      }
      return;
    } else if (isOnAfterPopupInteractionSession) {
      // if it is after I clicked popup interaction yes, and in its working session
      // retrieve lastest popup interaction
      const latestInteraction = popupInteractions.reduce((latest, current) => {
        return new Date(current.popupShownAt) > new Date(latest.popupShownAt)
          ? current
          : latest;
      });
      if (latestInteraction) {
        const now = Date.now();
        const respondedAt = new Date(latestInteraction.respondedAt).getTime();
        const timeSinceLastPopup = now - respondedAt;
        console.log(
          "%c timesincelastpopup: " + timeSinceLastPopup,
          "color: red;"
        );
        // if we are within 10 mins, we choose continue to work, then we need to retrieve when for next popup as well
        // next popup is 10 mins after previous popup interaction button being clicked
        const remainingTimeToPopup = 10 * 60 * 1000 - timeSinceLastPopup;
        setNextPopupTime(remainingTimeToPopup);
        // if it is over 10 mins from last popup, then its a new popup session
        const isNewPopupSession =
          timeSinceLastPopup > 10 * 60 * 1000 &&
          timeSinceLastPopup < 20 * 60 * 1000; // over 10 mins
        // if it is over 20 mins from last popup, then it is auto close
        const isAutoClosed = timeSinceLastPopup >= 20 * 60 * 1000; // over 20 mins
        if (isAutoClosed) {
          api
            .patch("/session/auto-submit", {
              sessionId: session._id,
            })
            .then((res) => {
              if (res.data.success) {
                localStorage.removeItem("sessionId");
                navigate("/");
              } else {
                // TODO: error handling
                console.log(res.data.message);
              }
              return;
            });
        } else if (isNewPopupSession) {
          api
            .patch("/session/recover-session-from-after-interact-popup", {
              sessionId: session._id,
            })
            .then((res) => {
              if (res.data.success) {
                setSession(res.data.data);
              } else {
                // TODO: error handling
                console.log(res.data.message);
              }
              return;
            });
        }
      }
    }

    // Determine if paused from pauseEvents
    const paused = session.pauseEvents?.some(
      (event) => event.resumedAt === null
    );
    setIsPaused(paused);
    setIsRunning(!paused);
  }, [
    calculateInitialDuration,
    session,
    numberOfParts,
    timePerPart,
    startTime,
    navigate,
    setSession,
  ]);

  // Pause timer and update backend
  const handlePause = async () => {
    try {
      setIsRunning(false);
      setIsPaused(true);
      await api.patch("/session/pause", {
        sessionId: session._id,
      });
    } catch (error) {
      console.error("Failed to pause session:", error);
      // clear session id and go to login
      localStorage.removeItem("sessionId");
      navigate("/");
    }
  };

  // Resume timer and update backend
  const handleResume = async () => {
    try {
      await api.patch("/session/resume", {
        sessionId: session._id,
      });
      setIsPaused(false);
      setIsRunning(true);
    } catch (error) {
      console.error("Failed to resume session:", error);
      // clear session id and go to login
      localStorage.removeItem("sessionId");
      navigate("/");
    }
  };

  // Popup Interaction logic
  const popupInteractionPause = useCallback(async () => {
    try {
      setIsRunning(false);
      setShouldExceedPopupShow(true);

      await api.patch("/session/timeout-popup-show", {
        sessionId: session._id,
      });
    } catch (error) {
      console.error("Failed to pause session:", error);
      localStorage.removeItem("sessionId");
      navigate("/");
    }
  }, [session?._id, navigate]);

  // useEffect to trigger when duration hits 0 - Initial trigger
  useEffect(() => {
    if (duration === 0 && session?.popupInteractions?.length === 0) {
      popupInteractionPause();
    }
  }, [duration, session?.popupInteractions?.length, popupInteractionPause]);

  // Placeholder for next action
  const handleNext = () => {
    // give page access permission
    toggleNextButton(true);
    // navigate to next page
    navigate("/submission");
  };

  return (
    <Box
      sx={{
        padding: 4,
        margin: "0 auto",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Grid container spacing={6} alignItems="center" justifyContent="center">
        {/* Left Side Panel: Title + Timer */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{ textAlign: { xs: "center", md: "left" } }}
        >
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              color: "#7441f9",
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            Timer & Work Tracking
          </Typography>

          {/* Timer block */}
          <CountdownTimerUI
            duration={duration || 0}
            showNegativeSign
            setDuration={setDuration}
            isRunning={isRunning}
          />
        </Grid>

        {/* Right Side: Info + Controls */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: { xs: "center", md: "flex-start" },
            }}
          >
            <Box
              sx={{
                textAlign: "left",
                maxWidth: "350px",
                width: "100%",
                display: "grid",
                gridTemplateColumns: "120px auto",
                rowGap: 1.5,
                columnGap: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "#6A1B9A",
                  borderBottom: "1px solid #ccc",
                }}
              >
                Login ID:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Roboto, sans-serif",
                  color: "white",
                  borderBottom: "1px solid #ccc",
                }}
              >
                {loginId}
              </Typography>

              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "#6A1B9A",
                  borderBottom: "1px solid #ccc",
                }}
              >
                Build No:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Roboto, sans-serif",
                  color: "white",
                  borderBottom: "1px solid #ccc",
                }}
              >
                {buildNumber}
              </Typography>

              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "#6A1B9A",
                  borderBottom: "1px solid #ccc",
                }}
              >
                Parts:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Roboto, sans-serif",
                  color: "white",
                  borderBottom: "1px solid #ccc",
                }}
              >
                {numberOfParts}
              </Typography>

              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "#6A1B9A",
                  borderBottom: "1px solid #ccc",
                }}
              >
                Time/Part:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Roboto, sans-serif",
                  color: "white",
                  borderBottom: "1px solid #ccc",
                }}
              >
                {timePerPart} min
              </Typography>
            </Box>
          </Box>

          <TextField
            label="Defects Encountered"
            type="number"
            value={defects.toString()}
            onChange={(e) => {
              const val = e.target.value === "" ? "0" : e.target.value;
              if (Number(val) >= 0) {
                setDefects(Number(val));
              }
            }}
            sx={{
              mb: 3,
              mt: 3,
              width: "100%",
              "& .MuiInputBase-input": {
                color: "6A1B9A",
                textAlign: "center",
              },
              "& label": {
                color: "#6A1B9A",
              },
              "& label.Mui-focused": {
                color: "white",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#6A1B9A",
                },
                "&:hover fieldset": {
                  borderColor: "#6A1B9A",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },
              },
            }}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              color="warning"
              onClick={handlePause}
              disabled={isPaused}
              startIcon={<PauseIcon />}
            >
              Pause
            </Button>

            <Button
              variant="outlined"
              onClick={handleNext}
              endIcon={<ArrowForwardIosIcon />}
              sx={{
                color: "#FFF",
                borderColor: "#FFF",
                "&:hover": {
                  backgroundColor: "#4CAF50",
                  borderColor: "#4CAF50",
                  color: "#FFF",
                },
              }}
            >
              Next
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Pause Modal */}
      <Modal open={isPaused}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            p: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 300,
            textAlign: "center",
            animation: "fadeInScale 0.3s ease-in-out",
          }}
        >
          <PauseCircleOutlineIcon
            sx={{ fontSize: "4rem", color: "#ffffff", mb: 2 }}
          />

          <Typography
            variant="h5"
            sx={{
              color: "#ffffff",
              mb: 3,
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            Paused
          </Typography>

          <Button
            variant="contained"
            onClick={handleResume}
            endIcon={<PlayArrowIcon />}
            sx={{
              bgcolor: "#4caf50",
              color: "white",
              px: 4,
              py: 1,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "#388e3c",
              },
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            Resume
          </Button>
        </Box>
      </Modal>

      {/* Overtime Popup Modal */}
      <TimeExceededModal
        open={shouldExceedPopupShow}
        onSwitchModal={onSwitchPopupModal}
        decideDuration={popupInteractionDuration || 600}
        handleContinue={continueCountDownFromPopupInteraction}
        handleStop={pauseCountDownFromPopupInteraction}
        reschedulePopupShow={popupInteractionPause}
        remainingTimeToPopup={nextPopupTime}
      />
    </Box>
  );
};

export default TimerUI;
