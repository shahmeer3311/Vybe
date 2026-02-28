import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { commentLoop, createLoop, getLoops, likeLoop } from "../controllers/loop.controller.js";

const loopRouter = express.Router();

loopRouter.post("/create", isAuth, createLoop);
loopRouter.get("/get", isAuth, getLoops);

loopRouter.post("/like/:loopId", isAuth, likeLoop);
loopRouter.post("/comment/:loopId", isAuth, commentLoop);

export default loopRouter;