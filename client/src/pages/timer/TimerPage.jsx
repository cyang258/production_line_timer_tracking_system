import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TimerUI from "components/Timer/TimerUI.jsx";
import api from "utils/api.js";

const TimerPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  useEffect(() => {
    const fetchSessionData = async (sessionId) => {
      try {
        const response = await api.get("/session/retrieve-session", {
          params: { _id: sessionId },
        });

        setSession(response.data);
      } catch (error) {
        // because when we cannot find coresponding session, that means session is expiried or invalid, so we should go to login page and get a new session
        if (error.response && error.response.status === 404) {
          console.warn("Session not found (404)");
        } else {
          console.error("Fetch error:", error);
        }
        setSession({});
      }
    };
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      navigate("/");
      return;
    }

    fetchSessionData(sessionId);
  }, [navigate]);

  useEffect(() => {
    console.log("session changed");
    console.log(session);
  }, [session]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 40%, #a18cd1 60%, #84fab0 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TimerUI session={session} setSession={setSession} />
    </Box>
  );
};

export default TimerPage;
