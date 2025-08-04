import express from "express";

import { create, getSessionForUserById } from "../controller/sessionController.js";

const sessionRoute = express.Router();

sessionRoute.post("/session/create", create)
sessionRoute.get("/session/retrieve-session", getSessionForUserById)

export default sessionRoute;