import express from "express";

import {
  create,
  getSessionForUserById,
  isActiveSessionById,
  isActiveSessionForUserByLoginId,
  pauseSession,
  resumeSession,
  popupInteractionPause,
  autoSubmit,
  manualSubmit,
  recoverPopupInteractionSessionFromCountDownSession,
  recoverSessionFromAfterInteractWithPopupSession,
  resumePopupInteractionAccept,
  resumePopupInteractionReject,
} from "../controller/sessionController.js";

const sessionRoute = express.Router();

sessionRoute.post("/create", create);
sessionRoute.get("/has-active-session-by-cookie", isActiveSessionById);
sessionRoute.get(
  "/has-active-session-by-info",
  isActiveSessionForUserByLoginId
);
sessionRoute.get("/retrieve-session", getSessionForUserById);
sessionRoute.patch("/pause", pauseSession);
sessionRoute.patch("/resume", resumeSession);
sessionRoute.patch("/timeout-popup-show", popupInteractionPause);
sessionRoute.patch("/manual-submit", manualSubmit);
sessionRoute.patch("/auto-submit", autoSubmit);
sessionRoute.patch("/recover-session-from-countdown", recoverPopupInteractionSessionFromCountDownSession);
sessionRoute.patch("/recover-session-from-after-interact-popup", recoverSessionFromAfterInteractWithPopupSession);
sessionRoute.patch("/continue-to-work", resumePopupInteractionAccept);
sessionRoute.patch("/reject-to-work", resumePopupInteractionReject);

export default sessionRoute;
