import Loop from "../models/loop.model.js"
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";

export const createLoopService=async({userId,caption,media})=>{
    if(!caption && media.length===0 || caption.length>1000){
        throw new ApiError(400,"Caption is required and must be less than 1000 characters");
    }
    if(!userId){
        throw new ApiError(401,"Unauthorized");
    }
     if (!Array.isArray(media) || media.length === 0) {
        throw new ApiError(400, "No media provided");
    }
     if (media.length > 1) {
        throw new ApiError(400, "Only one media item is allowed for a loop");
    }
   const user=await User.findById(userId)
    if(!user){
        throw new ApiError(404,"User not found");
    }
   const loop=await Loop.create({
        author:userId,
        title:caption,
        mediaUrl:media[0],
    });
    return loop;
};

export const getLoopsService=async()=>{
    const loops=await Loop.find({})
    .populate("author","name userName profileImg email")
    .populate("comments.author","name userName profileImg")
    .sort({ createdAt: -1 });
    return loops;
}

export const likeLoopService=async({userId,loopId})=>{
    console.log("Liking loop with ID:", loopId, "by user ID:", userId);
    try {
        if(!userId){
            throw new ApiError(401,"Unauthorized");
        }
        const loop=await Loop.findById(loopId);
        if(!loop){
            throw new ApiError(404,"Loop not found");
        }
        const isLiked=loop.likes.includes(userId);
        if(isLiked){
            loop.likes=loop.likes.filter((id)=>id.toString()!==userId);
        } else {
            loop.likes.push(userId);
        }
        await loop.save();
        return loop;
    } catch (error) {
        throw error;
    }
}

export const commentLoopService=async({userId,loopId,comment})=>{
    try {
        if(!userId || !comment || comment.length>500){
            throw new ApiError(401,"Unauthorized");
        }
        const loop=await Loop.findById(loopId);
        if(!loop){
            throw new ApiError(404,"Loop not found");
        }
        loop.comments.push({
            author:userId,
            text:comment
        });
        await loop.save();
        return loop;
    } catch (error) {
        throw error;
    }
}