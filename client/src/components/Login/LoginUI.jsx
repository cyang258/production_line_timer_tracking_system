import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { ThemeProvider, CssBaseline } from "@mui/material";
import darkTheme from "theme/theme.js";
import LoginIcon from "components/Icons/loginIcon.js";
import Card from "components/Login/Card.jsx";
import LoginContainer from "components/Login/LoginContainer.jsx";
import api from "utils/api.js";

const LoginUI = ({ setBuild, setLoginId, loginId }) => {
  const [loginIdError, setLoginIdError] = useState(false);
  const [loginIdErrorMessage, setLoginIdErrorMessage] = useState("");
  const [buildNumberError, setBuildNumberError] = useState(false);
  const [buildNumberErrorMessage, setBuildNumberErrorMessage] = useState("");
  const [buildNumber, setBuildNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await validateInputs();
  };

  const validateInputs = async () => {
    let isValid = true;

    // Frontend input validation
    if (!loginId) {
      setLoginIdError(true);
      setLoginIdErrorMessage("Please enter a valid Login ID.");
      isValid = false;
    } else {
      setLoginIdError(false);
      setLoginIdErrorMessage("");
    }

    if (!buildNumber) {
      setBuildNumberError(true);
      setBuildNumberErrorMessage("Build Number must not be empty.");
      isValid = false;
    } else {
      setBuildNumberError(false);
      setBuildNumberErrorMessage("");
    }

    // Skip API validation if frontend inputs are invalid
    if (!isValid) return false;

    try {
      // Validate Login ID exists
      const loginIdResponse = await api.post("/login-id/validate-id", {
        loginId: loginId,
      });

      if (!loginIdResponse.data.valid) {
        setLoginIdError(true);
        setLoginIdErrorMessage("Login ID does not exist.");
        isValid = false;
      } else {
        setLoginIdError(false);
        setLoginIdErrorMessage("");
      }
    } catch (error) {
      setLoginIdError(true);
      setLoginIdErrorMessage("Failed to validate Login ID.");
      isValid = false;
    }

    try {
      // Validate Build Number exists
      const buildResponse = await api.get("/build/get-build", {
        params: { buildNumber },
      });
      if (!buildResponse.status === 200) {
        setBuildNumberError(true);
        setBuildNumberErrorMessage("Build Number does not exist.");
        isValid = false;
      } else {
        setBuildNumberError(false);
        setBuildNumberErrorMessage("");
        if (isValid) {
          setBuild(buildResponse.data);
        }
      }
    } catch (error) {
      setBuildNumberError(true);
      setBuildNumberErrorMessage("Failed to validate Build Number.");
      isValid = false;
    }

    return isValid;
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />
      <LoginContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 3,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="loginid">Login ID</FormLabel>
              <TextField
                error={loginIdError}
                helperText={loginIdErrorMessage}
                id="loginid"
                name="loginid"
                placeholder="XXXXXX"
                autoFocus
                required
                fullWidth
                variant="outlined"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                color={loginIdError ? "error" : "primary"}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="buildnumber">Build Number</FormLabel>
              <TextField
                error={buildNumberError}
                helperText={buildNumberErrorMessage}
                id="buildnumber"
                name="buildnumber"
                placeholder="XXXXXX"
                required
                fullWidth
                variant="outlined"
                value={buildNumber}
                onChange={(e) => setBuildNumber(e.target.value)}
                color={buildNumberError ? "error" : "primary"}
              />
            </FormControl>

            <Button
              sx={{ mt: 2 }}
              type="submit"
              fullWidth
              variant="contained"
              onClick={handleSubmit}
            >
              Sign in
            </Button>
          </Box>
        </Card>
      </LoginContainer>
    </ThemeProvider>
  );
};

export default LoginUI;
