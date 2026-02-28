import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createStoryService,
  getAllStoriesService,
  viewStoryService,
  getStoryByUserNameService,
} from "../services/story.service.js";

export const createStory = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { caption, media } = req.body;

  const stories = await createStoryService({
    userId,
    caption,
    media,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, stories, "Stories created successfully"));
});

export const getAllStories = asyncHandler(async(req,res)=>{
  const userId=req.userId;
  const stories = await getAllStoriesService(userId);
  return res
    .status(200)
    .json(new ApiResponse(200, stories, "All stories fetched successfully"));
});

export const viewStory = asyncHandler(async(req,res)=>{
  const {storyId} = req.params;
  const userId = req.userId;

  const story = await viewStoryService({storyId,userId});
  return res
    .status(200)
    .json(new ApiResponse(200, story, "Story viewed successfully"));
});

export const getStoryByUserName = asyncHandler(async(req,res)=>{
   const {userName} = req.params;
 
   const stories = await getStoryByUserNameService(userName);
   return res
    .status(200)
    .json(new ApiResponse(200, stories, "User stories fetched successfully"));
});