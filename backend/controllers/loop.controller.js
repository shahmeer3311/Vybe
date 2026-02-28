import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { createLoopService, getLoopsService, likeLoopService, commentLoopService } from "../services/loop.service.js";

export const createLoop=asyncHandler(async(req,res)=>{
    const userId=req.userId;
    const {caption,media}=req.body;
    const loop=await createLoopService({
        userId,
        caption,
        media
    });
    return res.status(201).json(new ApiResponse(201,loop,"Loop created successfully"));
});

export const getLoops=asyncHandler(async(req,res)=>{
   const loops=await getLoopsService();
   return res.status(200).json(new ApiResponse(200,loops,"Loops fetched successfully"));
});

export const likeLoop=asyncHandler(async(req,res)=>{
    const userId=req.userId;
    const {loopId}=req.params;
    const loop=await likeLoopService({userId,loopId});
    return res.status(200).json(new ApiResponse(200,loop,"Loop liked successfully"));
});

export const commentLoop=asyncHandler(async(req,res)=>{
    const userId=req.userId;
    const {loopId}=req.params;
    const {comment}=req.body;
    const loop=await commentLoopService({userId,loopId,comment});
    return res.status(200).json(new ApiResponse(200,loop,"Comment added successfully"));
})