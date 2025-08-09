import React from "react";
import ReactDOM from "react-dom/client";
import { StyledEngineProvider } from "@mui/material/styles";
import { NotificationProvider } from "contexts/NotificationContext";
import App from "App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StyledEngineProvider injectFirst>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </StyledEngineProvider>
);
