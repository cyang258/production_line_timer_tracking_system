import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { ThemeProvider, CssBaseline } from "@mui/material";
import darkTheme from "../../theme/theme.js";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

import LoginIcon from "components/Icons/loginIcon.js";
import LoginContainer from "components/Login/LoginContainer.jsx";
import Card from "components/Login/Card.jsx";
import api from "utils/api.js";
import { useNotification } from "contexts/NotificationContext.jsx";

const BuildDisplay = ({ build, loginId, onBack }) => {
  const [startTime, setStartTime] = useState(null);

  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const handleStart = async () => {
    try {
      // since start button will disable if the login id and build number not exist, we make sure the data source is valid
      const response = await api.post("/session/create", {
        buildNumber: build.buildNumber,
        loginId,
      });
      const session = response.data;
      setStartTime(new Date(session.startTime));
      // Add session persistence
      localStorage.setItem("sessionId", session._id);

      navigate("/timer", { replace: true });
    } catch (error) {
      showNotification(error.message, "error");
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />
      <LoginContainer direction="column" justifyContent="space-between">
        <Card variant="outlined" sx={{ position: "relative", paddingTop: 4 }}>
          <Button
            onClick={onBack}
            startIcon={<KeyboardDoubleArrowLeftIcon />}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              minWidth: "auto",
              padding: "6px 8px",
              borderRadius: 1,
              color: "white",
            }}
            size="small"
          >
            Back
          </Button>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LoginIcon style={{ width: 40, height: 40 }} />
            <Typography
              component="h5"
              variant="h4"
              sx={{ fontSize: "clamp(1.5rem, 6vw, 1.8rem)" }}
            >
              Timer Tracking System
            </Typography>
          </Box>

          <Box sx={{ mt: 4, mb: 2, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Build Details
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                color: "text.secondary",
                fontSize: "0.9rem",
                mt: 0.5,
                alignItems: "center",
              }}
            >
              <Typography>Login ID: {loginId}</Typography>
              <Typography>|</Typography>
              <Typography>Build Number: {build.buildNumber}</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              gap: 2,
              mt: 2,
            }}
          >
            <Typography variant="body1">
              <strong>Number of Parts:</strong> {build.numberOfParts}
            </Typography>
            <Typography variant="body1">
              <strong>Time per Part:</strong> {build.timePerPart} minutes
            </Typography>

            {startTime ? (
              <Typography sx={{ mt: 2 }} color="success.main">
                Started at: {startTime.toLocaleTimeString()}
              </Typography>
            ) : (
              <Button
                sx={{ mt: 2 }}
                fullWidth
                variant="contained"
                disabled={!build?.buildNumber || !loginId}
                onClick={async () => await handleStart()}
              >
                Start
              </Button>
            )}
          </Box>
        </Card>
      </LoginContainer>
    </ThemeProvider>
  );
};

export default BuildDisplay;
