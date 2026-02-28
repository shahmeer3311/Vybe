import express from "express";
import { createPost, getAllPosts, likeUnlikePost, commentPost, deletePost } from "../controllers/post.controller.js";
import { isAuth } from "../middlewares/auth.js";

const postRouter = express.Router();

// Create post with caption + media URLs only (no file uploads)
postRouter.post("/create", isAuth, createPost);
postRouter.get("/get", isAuth, getAllPosts);
postRouter.put('/like/:postId',isAuth,likeUnlikePost);
postRouter.post('/comments/:postId',isAuth,commentPost);
postRouter.delete('/:postId',isAuth,deletePost);

export default postRouter;