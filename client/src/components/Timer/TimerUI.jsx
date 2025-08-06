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

const TimerUI = ({ session, setSession }) => {
  const navigate = useNavigate();

  const {
    loginId = "",
    buildNumber = "",
    numberOfParts = 0,
    timePerPart = 0,
    startTime,
  } = session || {};

  // duration in seconds
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // for modal display
  const [defects, setDefects] = useState(0);

  // Calculate initial duration based on session info
  const calculateInitialDuration = useCallback(() => {
    const totalDuration = numberOfParts * timePerPart * 60;
    const pauseEvents =
      session.pauseEvents?.filter((event) => event.resumedAt === null) || [];
    const now = pauseEvents.length
      ? new Date(pauseEvents[0].pausedAt).getTime()
      : Date.now();
    const totalPausedTime = session.totalPausedTime || 0;
    const start = new Date(startTime).getTime();
    const elapsed = Math.floor((now - start) / 1000);
    return totalDuration - elapsed + totalPausedTime;
  }, [session, numberOfParts, timePerPart, startTime]);

  // Initialize timer when session changes
  useEffect(() => {
    if (!session) return;
    if (
      Object.keys(session).length === 0 ||
      !Array.isArray(session.pauseEvents)
    ) {
      localStorage.removeItem("sessionId");
      navigate("/");
      return;
    }

    const initialDuration = calculateInitialDuration();
    setDuration(initialDuration);

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

  // Placeholder for next action
  const handleNext = () => {
    // TODO: navigate to next page with session and defects info
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
            duration={duration}
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
            value={defects}
            onChange={(e) => setDefects(Number(e.target.value))}
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
    </Box>
  );
};

export default TimerUI;
