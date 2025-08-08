import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Box, Typography, Button, Stack } from "@mui/material";
import AlarmIcon from "@mui/icons-material/Alarm";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import CountDownTimerUI from "components/CountDownTimer/CountDownTimerUI";
import api from "utils/api.js";

const TimeExceededModal = ({
  open,
  onSwitchModal,
  nextPopup = 600000,
  decideDuration = 600,
  handleContinue,
  handleStop,
  reschedulePopupShow,
  remainingTimeToPopup,
}) => {
  const [duration, setDuration] = useState(decideDuration);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("%c next popup updated in modal", "color: red;");
    console.log("%c next popup:" + remainingTimeToPopup, "color: red;");
    if (remainingTimeToPopup) {
      clearTimeout();
      setTimeout(async () => {
        console.log("%c reschedule happen", "color: red;");
        await reschedulePopupShow();
        // TODO: there should be a function to popup interaction pause the main timer
      }, remainingTimeToPopup);
    }
  }, [remainingTimeToPopup, reschedulePopupShow]);

  useEffect(() => {
    const handleIgnoreResponse = async () => {
      // Auto submit, then clear the session id and navigate to home page
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) {
        navigate("/");
        return;
      }
      const res = await api.patch("/session/auto-submit", {
        sessionId: sessionId,
      });
      if (res.data.success) {
        localStorage.removeItem("sessionId");
        navigate("/");
        return;
      } else {
        // TODO: error handling
        console.log(res.data.message);
      }
    };
    if (duration === 0) {
      handleIgnoreResponse();
    }
  }, [duration, navigate]);

  useEffect(() => {
    console.log("triggered");
    console.log("modal is open: ", open);
    console.log("decide duration is: ", decideDuration);
    setIsRunning(open);
    setDuration(decideDuration);
  }, [open, decideDuration]);

  const scheduleNextPopup = () => {
    // Schedule next popup
    console.log("%c next popup is:" + nextPopup, "color: red;");
    sessionStorage.setItem("nextPopupTimestamp", nextPopup);
    clearTimeout();
    setTimeout(async () => {
      console.log("%c reschedule happen", "color: red;");
      await reschedulePopupShow();
      // TODO: there should be a function to popup interaction pause the main timer
    }, nextPopup);
  };

  const handleContinueResponse = async () => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      navigate("/");
      return;
    }
    // update popup interaction pause and get updated sesssion
    const res = await api.patch("/session/continue-to-work", {
      sessionId: sessionId,
    });
    if (res.data.success) {
      const session = res.data.data;
      handleContinue(session);
      scheduleNextPopup();
      setIsRunning(false);
      onSwitchModal(false);
    }
  };

  const handleStopResponse = async () => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      navigate("/");
      return;
    }
    // update popup interaction pause and get updated sesssion
    const res = await api.patch("/session/reject-to-work", {
      sessionId: sessionId,
    });
    if (res.data.success) {
      const session = res.data.data;
      handleStop(session);
      scheduleNextPopup();
      setIsRunning(false);
      onSwitchModal(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => onSwitchModal(false)}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 450,
          bgcolor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 4,
          boxShadow: 6,
          p: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold" color="error" mb={1}>
          <AlarmIcon /> Time is up
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Do you wish to continue?
        </Typography>

        <CountDownTimerUI
          duration={duration}
          setDuration={setDuration}
          isRunning={isRunning}
        />

        <Stack direction="row" justifyContent="center" spacing={2} mt={4}>
          <Button
            variant="contained"
            color="success"
            onClick={handleContinueResponse}
          >
            <CheckIcon /> Yes
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleStopResponse}
          >
            <CloseIcon /> No
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default TimeExceededModal;
