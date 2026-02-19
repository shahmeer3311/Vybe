import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const uploadStory=asyncHandler(async(req,res)=>{
   const userId=req.userId;
   const files=req.files || [];
   console.log("Story", userId, files);
   const { title, description } = req.body;
   // Call the service to handle story upload logic
   const stories = await uploadStoryService({
    userId,
    files,
    title,
    description
  });
  return res
    .status(201)
    .json(new ApiResponse(201, stories, "Stories uploaded successfully"));
})