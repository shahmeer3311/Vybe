import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createPostService, getAllPostsService, likeUnlikePostService, commentPostService, deletePostService } from "../services/post.service.js";

export const createPost = asyncHandler(async (req, res) => {
    const userId = req.userId;
    console.log("Creating post for userId:", userId);
    const { caption, media } = req.body;

    const post = await createPostService({
        userId,
        caption,
        media,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, post, "Post created successfully"));
});

export const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await getAllPostsService();
    return res
        .status(200)
        .json(new ApiResponse(200, posts, "Posts fetched successfully"));
});

export const likeUnlikePost=asyncHandler(async(req,res)=>{
   const userId=req.userId;
    const {postId}=req.params;
    const post=await likeUnlikePostService(postId,userId);
    return res
    .status(200)
    .json(new ApiResponse(200, post, "Post liked/unliked successfully"));
});

export const commentPost=asyncHandler(async(req,res)=>{
  const userId=req.userId;
  const {postId}=req.params;
  const {text}=req.body;
  const post=await commentPostService(postId,userId,text);
  return res
    .status(200)
    .json(new ApiResponse(200, post, "Comment added successfully"));
});

export const deletePost=asyncHandler(async(req,res)=>{
    const {postId}=req.params;
    const post=await deletePostService(postId);
    return res
    .status(200)
    .json(new ApiResponse(200, post, "Post deleted successfully"));
})