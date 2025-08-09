// contexts/AppProviders.jsx
import React from "react";
import { AuthProvider } from "./FinalSubmissionPageAuthContext.jsx";
import { GlobalStateProvider } from "./GlobalStateContext.jsx";

const AppProviders = ({ children }) => (
  <AuthProvider>
    <GlobalStateProvider>{children}</GlobalStateProvider>
  </AuthProvider>
);

export default AppProviders;
