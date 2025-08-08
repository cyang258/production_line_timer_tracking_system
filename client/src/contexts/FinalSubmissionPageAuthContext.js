import React, { createContext, useContext, useState } from "react";

const FinalSubmissionPageAuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [yesButtonClicked, setYesButtonClicked] = useState(false);
  const [nextButtonClicked, setNextButtonClicked] = useState(false);

  const toggleYesButton = (value) => setYesButtonClicked(value);
  const toggleNextButton = (value) => setNextButtonClicked(value);
  const isAuthenticated = yesButtonClicked || nextButtonClicked;

  return (
    <FinalSubmissionPageAuthContext.Provider value={{ toggleYesButton, toggleNextButton, isAuthenticated }}>
      {children}
    </FinalSubmissionPageAuthContext.Provider>
  );
};

export const useAuth = () => useContext(FinalSubmissionPageAuthContext);
