import express from "express";

import { validateLoginId } from "../controller/loginIdController.js";

const loginIdRoute = express.Router();

loginIdRoute.post("/validate-id", validateLoginId);

export default loginIdRoute;