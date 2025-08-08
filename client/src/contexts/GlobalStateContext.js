import React, { createContext, useContext, useState } from "react";

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const [defects, setDefects] = useState(0);

  const resetGlobalStateAfterSubmit = () => {
    setDefects(0)
  }

  return (
    <GlobalStateContext.Provider
      value={{ defects, setDefects, resetGlobalStateAfterSubmit }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
