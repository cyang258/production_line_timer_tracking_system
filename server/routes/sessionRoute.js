import express from "express";

import { create, getSessionForUserById } from "../controller/sessionController.js";

const sessionRoute = express.Router();

sessionRoute.post("/create", create)
sessionRoute.get("/retrieve-session", getSessionForUserById)

export default sessionRoute;