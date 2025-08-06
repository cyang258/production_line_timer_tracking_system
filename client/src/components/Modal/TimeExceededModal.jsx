import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button, Stack, Backdrop } from "@mui/material";
import AlarmIcon from "@mui/icons-material/Alarm";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import CountDownTimerUI from "components/CountDownTimer/CountDownTimerUI";

const TimeExceededModal = ({ open, onSwitchModal }) => {
  const [duration, setDuration] = useState(600); // 10 minutes in seconds
  const [isRunning, setIsRunning] = useState(open);

  const handleContinueResponse = () => {
    onSwitchModal(false);
    setDuration(600); // reset countdown
    setIsRunning(false);

    // Schedule next popup in 10 minutes
    setTimeout(() => {
      setIsRunning(true);
      onSwitchModal();
    }, 600000);
  };

  const handleStopResponse = () => {
    onSwitchModal(false);
    setDuration(600); // reset countdown
    setIsRunning(false);

    // Schedule next popup in 10 minutes
    // TODO: from parent component, create a time counter
    //    NOTE: this count down only related to click "Yes"/"No" event, should not mix with main countdown
  };

  const handleIgnoreResponse = () => {
    // TODO: auto submit, then clear the session id and navigate to home page
    //    function should come from parent
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
