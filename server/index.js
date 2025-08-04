import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

import sessionRoute from "./routes/sessionRoute.js";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 7000;
const MONGOURL = process.env.MONGO_URL;

mongoose.connect(MONGOURL).then(() => {
    console.log("DB connected successfully");
    app.listen(PORT, () => {
        console.log(`Server is ruuning on port: ${PORT}`);
    })
}).catch((error) => {
    console.log(error)
})

app.use("/api", sessionRoute);