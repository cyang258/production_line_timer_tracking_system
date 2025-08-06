import React, { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const CountDownTimerUI = ({
  duration,
  setDuration,
  isRunning,
  showNegativeSign = false,
}) => {
  // Timer count down logic
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setDuration((prev) => {
        if (!showNegativeSign && prev <= 0) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, setDuration, showNegativeSign]);
  const isOverTime = duration < 0;
  const absDuration = Math.abs(duration);
  const hours = String(Math.floor(absDuration / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((absDuration % 3600) / 60)).padStart(
    2,
    "0"
  );
  const seconds = String(absDuration % 60).padStart(2, "0");

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: { xs: "center", md: "flex-start" },
        alignItems: "center",
        gap: 1,
      }}
    >
      {/* Negative sign box */}
      <Box sx={{ width: 60, textAlign: "center" }}>
        <Typography variant="caption" sx={{ mb: 0.5, visibility: "hidden" }}>
          -
        </Typography>
        <Typography
          sx={{
            fontSize: "4rem",
            fontFamily: "monospace",
            color: "error.main",
            fontWeight: "bold",
            visibility: showNegativeSign && isOverTime ? "visible" : "hidden",
          }}
        >
          -
        </Typography>
      </Box>

      {/* Hours */}
      <Box sx={{ textAlign: "center", minWidth: 60 }}>
        <Typography
          variant="caption"
          sx={{ mb: 0.5, fontWeight: "bold", fontSize: "0.8rem" }}
        >
          Hours
        </Typography>
        <Typography
          sx={{
            fontSize: "4rem",
            fontFamily: "monospace",
            color: isOverTime ? "error.main" : "text.primary",
          }}
        >
          {hours}
        </Typography>
      </Box>

      <Typography
        variant="h2"
        sx={{
          color: isOverTime ? "error.main" : "text.primary",
          userSelect: "none",
          lineHeight: 1,
          fontWeight: "bold",
        }}
      >
        :
      </Typography>

      {/* Minutes */}
      <Box sx={{ textAlign: "center", minWidth: 60 }}>
        <Typography
          variant="caption"
          sx={{ mb: 0.5, fontWeight: "bold", fontSize: "0.8rem" }}
        >
          Minutes
        </Typography>
        <Typography
          sx={{
            fontSize: "4rem",
            fontFamily: "monospace",
            color: isOverTime ? "error.main" : "text.primary",
          }}
        >
          {minutes}
        </Typography>
      </Box>

      <Typography
        variant="h2"
        sx={{
          color: isOverTime ? "error.main" : "text.primary",
          userSelect: "none",
          lineHeight: 1,
          fontWeight: "bold",
        }}
      >
        :
      </Typography>

      {/* Seconds */}
      <Box sx={{ textAlign: "center", minWidth: 60 }}>
        <Typography
          variant="caption"
          sx={{ mb: 0.5, fontWeight: "bold", fontSize: "0.8rem" }}
        >
          Seconds
        </Typography>
        <Typography
          sx={{
            fontSize: "4rem",
            fontFamily: "monospace",
            color: isOverTime ? "error.main" : "text.primary",
          }}
        >
          {seconds}
        </Typography>
      </Box>
    </Box>
  );
};

export default CountDownTimerUI;
