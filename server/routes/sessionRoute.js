import express from "express";

import { create, getSessionForUserById, isActiveSessionById, isActiveSessionForUserByLoginIdAndBuildNumber, pauseSession, resumeSession } from "../controller/sessionController.js";

const sessionRoute = express.Router();

sessionRoute.post("/create", create)
sessionRoute.get("/has-active-session-by-cookie", isActiveSessionById)
sessionRoute.get("/has-active-session-by-info", isActiveSessionForUserByLoginIdAndBuildNumber)
sessionRoute.get("/retrieve-session", getSessionForUserById)
sessionRoute.patch("/pause", pauseSession)
sessionRoute.patch("/resume", resumeSession)

export default sessionRoute;