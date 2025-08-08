// contexts/AppProviders.jsx
import React from "react";
import { AuthProvider } from "./FinalSubmissionPageAuthContext";
import { GlobalStateProvider } from "./GlobalStateContext";

const AppProviders = ({ children }) => (
  <AuthProvider>
    <GlobalStateProvider>{children}</GlobalStateProvider>
  </AuthProvider>
);

export default AppProviders;
