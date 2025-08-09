import React, { createContext, useContext, useEffect, useState } from "react";

const FinalSubmissionPageAuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [nextButtonClicked, setNextButtonClicked] = useState(false);
  const [session, setSession] = useState(null);

  // check if last popup interaction was response "Yes"
  useEffect(() => {
    if (session) {
      const latestPopup = session.popupInteractions?.reduce((latest, popup) => {
        return !latest || popup.popupShownAt > latest.popupShownAt
          ? popup
          : latest;
      }, null);

      if (latestPopup) {
        // if user last popup click yes
        if (latestPopup.response === "Yes") {
          sessionStorage.setItem("isResponseAccept", true);
        } else {
          sessionStorage.setItem("isResponseAccept", false);
        }
      }
    }
  }, [session]);

  const hasResponseAccept = sessionStorage.getItem("isResponseAccept");
  const toggleNextButton = (value) => setNextButtonClicked(value);
  const isAuthenticated = (JSON.parse(hasResponseAccept) ?? false) || nextButtonClicked;

  return (
    <FinalSubmissionPageAuthContext.Provider
      value={{ toggleNextButton, isAuthenticated, session, setSession }}
    >
      {children}
    </FinalSubmissionPageAuthContext.Provider>
  );
};

export const useAuth = () => useContext(FinalSubmissionPageAuthContext);
