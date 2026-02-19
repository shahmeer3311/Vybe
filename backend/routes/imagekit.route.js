import express from "express";
import { getImageKitAuth } from "../controllers/imagekit.controller.js";
import { isAuth } from "../middlewares/auth.js";

const imagekitRouter = express.Router();

// Authenticated route to generate ImageKit authentication parameters
imagekitRouter.get("/auth", isAuth, getImageKitAuth);

export default imagekitRouter;
