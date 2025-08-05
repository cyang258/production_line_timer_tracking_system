import express from "express";

import { getBuildByBuildNumber } from "../controller/buildController.js";

const buildRoute = express.Router();

buildRoute.get("/get-build", getBuildByBuildNumber)

export default buildRoute;