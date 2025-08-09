import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import { useGlobalState } from "contexts/GlobalStateContext";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import api from "utils/api.js";

export default function FinalSubmissionPage() {
  const { defects, resetGlobalStateAfterSubmit } = useGlobalState();
  const [totalParts, setTotalParts] = useState(0);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/timer", { replace: true }); // back to Page 2
  };

  const handleSubmit = async () => {
    if (!totalParts || totalParts < 0 || !defects || defects < 0) {
      alert("Please enter a valid total parts number and defects number");
      return;
    }
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      navigate("/", { replace: true });
    }
    // Save session data to the database
    await api
      .patch("/session/manual-submit", {
        sessionId,
        defects,
        totalParts,
      })
      .then((res) => {
        if (res.data.success) {
          localStorage.removeItem("sessionId");
          resetGlobalStateAfterSubmit();
          navigate("/", { replace: true });
        } else {
          // TODO: error handling
          console.log(res.data.message);
        }
      });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 40%, #a18cd1 60%, #84fab0 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
            color: "black",
          }}
        >
          <Typography variant="h5" sx={{ mb: 1 }}>
            Enter Total Parts
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
            Please enter the total number of parts before submitting your
            session.
          </Typography>

          <TextField
            type="number"
            fullWidth
            value={totalParts.toString()}
            onChange={(e) => {
              const val = e.target.value === "" ? "0" : e.target.value;
              if (Number(val) >= 0) {
                setTotalParts(Number(val));
              }
            }}
            placeholder="0"
            variant="outlined"
            sx={{
              mb: 3,
              backgroundColor: "white",
              borderRadius: 1,
            }}
          />

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<ArrowBackIosIcon />}
              sx={{
                color: "#000", // white text initially
                borderColor: "#000", // white border initially
                backgroundColor: "transparent", // no background initially
                "&:hover": {
                  backgroundColor: "#000", // solid black background on hover
                  color: "#fff", // keep white text on hover
                  borderColor: "#000", // match border to background
                },
              }}
            >
              Back
            </Button>

            <Button
              variant="outlined"
              onClick={handleSubmit}
              endIcon={<SendIcon />}
              sx={{
                color: "#8d0d87ff", // white text initially
                borderColor: "#8d0d87ff", // white border initially
                backgroundColor: "transparent", // no background initially
                "&:hover": {
                  backgroundColor: "#8d0d87ff", // solid black background on hover
                  color: "#fff", // keep white text on hover
                  borderColor: "#8d0d87ff", // match border to background
                },
              }}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
