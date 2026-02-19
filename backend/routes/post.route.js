import express from "express";
import { createPost, getAllPosts } from "../controllers/post.controller.js";
import { isAuth } from "../middlewares/auth.js";

const postRouter = express.Router();

// Create post with caption + media URLs only (no file uploads)
postRouter.post("/create", isAuth, createPost);
postRouter.get("/get", isAuth, getAllPosts);

export default postRouter;