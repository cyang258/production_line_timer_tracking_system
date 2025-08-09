import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginUI from "components/Login/LoginUI.jsx";
import BuildDisplay from "components/Login/BuildDisplay.jsx";
import api from "utils/api.js";

export default function LoginPage(props) {
  const [build, setBuild] = useState(null);
  const [loginId, setLoginId] = useState(null);
  const navigate = useNavigate();
  // clear session storage for if user click yes button, it will reset when new session is available
  useEffect(() => {
    sessionStorage.clear();
  }, []);

  // if already signed in user change url to login page, it should redirect them back
  useEffect(() => {
    if (!build || !loginId) {
      const sessionId = localStorage.getItem("sessionId");
      if (!sessionId) return;

      api
        .get("/session/has-active-session-by-cookie", {
          params: { _id: sessionId },
        })
        .then((response) => {
          // If session is valid, navigate to timer page with session info
          navigate("/timer", { replace: true });
        })
        .catch((error) => {
          console.error("Failed to fetch session:", error);
          // Possibly clear invalid session id from localStorage
          localStorage.removeItem("sessionId");
        });
    }
  }, []);

  useEffect(() => {
    if (build && loginId && loginId !== "") {
      // Since loginId and build are valid, check for an active session
      api
        .get("/session/has-active-session-by-info", {
          params: {
            buildNumber: build.buildNumber,
            loginId: loginId,
          },
        })
        .then((response) => {
          if (response.data.active) {
            // This means user already have an active session, redirect to timer page
            // and when it redirect, it should remain the same status as it before
            //   eg. if session was deleted when it pause/active, it should remain pause/active
            localStorage.setItem("sessionId", response.data.id);
            navigate("/timer", { replace: true });
          }
        })
        .catch((error) => {
          // couldn't fetch active session, then we don't care
          console.error("Failed to fetch active session:", error);
        });
    }
  }, [build, loginId]);

  return build ? (
    <BuildDisplay
      build={build}
      loginId={loginId}
      onBack={() => setBuild(null)}
    />
  ) : (
    <LoginUI setBuild={setBuild} loginId={loginId} setLoginId={setLoginId} />
  );
}
