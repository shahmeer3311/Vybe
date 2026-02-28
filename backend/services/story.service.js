import User from "../models/user.model.js";
import Story from "../models/story.model.js";
import { ApiError } from "../utils/apiError.js";

// Create a story using media URLs provided from the frontend (same pattern as posts)
export const createStoryService = async ({ userId, caption, media }) => {
    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    if (!caption || caption.length > 2200) {
        throw new ApiError(400, "Caption exceeds maximum length of 2200 characters");
    }

    if (!Array.isArray(media) || media.length === 0) {
        throw new ApiError(400, "No media provided");
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    console.log("Creating story for user:", userId, "with media:", media);

    const normalizedMedia = media.map((item) => {
        if (!item?.url || !item?.type) {
            throw new ApiError(400, "Each media item must include url and type");
        }
        if (!["image", "video"].includes(item.type)) {
            throw new ApiError(400, "Media type must be 'image' or 'video'");
        }
        return {
            url: item.url,
            type: item.type,
        };
    });

    const story = await Story.create({
        author: userId,
        caption,
        media: normalizedMedia,
    });

    user.stories.push(story._id);
    await user.save();

    return story;
};

export const getAllStoriesService = async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const followingIDs = user.following;

    const stories = await Story.find({
        // Match any value inside the given array.
        author: { $in: followingIDs },
    })
        .populate("author", "userName profileImg")
        .sort({ createdAt: -1 });

    return stories;
};

export const viewStoryService = async ({ storyId, userId }) => {
    if (!storyId) {
        throw new ApiError(400, "Story ID is required");
    }

    if (!userId) {
        throw new ApiError(401, "Unauthorized");
    }

    const story = await Story.findOneAndUpdate(
        { _id: storyId },
        { $addToSet: { viewers: userId } }, // Add userId to viewers array if not already present
        { new: true }
    )
        .populate("author", "userName profileImg")
        .populate("viewers", "userName profileImg");

    if (!story) throw new ApiError(404, "Story not found");

    return story;
};

export const getStoryByUserNameService=async(userName)=>{
    if(!userName) throw new ApiError(400,"Username is required");

    const user=await User.findOne({userName})
    console.log("getStoryByUserNameService - Found user:", user);
    if(!user) throw new ApiError(404,"User not found");

    const stories=await Story.find({author:user._id})
    .populate("author","userName profileImg")
    .populate("viewers","userName profileImg")
    .sort({createdAt:-1});

    console.log("UserName Stories:",stories);

    if(!stories.length){
        throw new ApiError(404,"No active stories found for this user");
     }

     return stories;
}