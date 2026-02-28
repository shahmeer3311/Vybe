import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";

// Create a post using media URLs provided from the frontend
export const createPostService = async ({ userId, caption, media }) => {
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

    const post = await Post.create({
        author: userId,
        caption,
        media: normalizedMedia,
    });

    user.posts.push(post._id);
    await user.save();

    return post;
};

export const getAllPostsService=async()=>{
    const posts=await Post.find({})
    .populate("author","name userName profileImg email")
    .populate("comments.author","name userName profileImg")
    .sort({ createdAt: -1 });
    return posts;
}

export const likeUnlikePostService=async(postId,userId)=>{
    const post=await Post.findById(postId).populate("author","_id userName profileImg");
    if(!post) throw new ApiError(404,"Page not found");
    const alreadyLiked=post.likes.some((id)=>id.toString()===userId.toString());
    if(alreadyLiked){
        post.likes=post.likes.filter((id)=>id.toString()!==userId.toString());
    }else{
        post.likes.push(userId);
    }
    await post.save();
    return post;
}

export const commentPostService=async(postId,userId,text)=>{
    const post=await Post.findById(postId).populate("author","_id userName profileImg");
    if(!post) throw new ApiError(404,"Page not found");
    post.comments.push({
        message:text,
        author:userId
    });
    await post.save();
    await post.populate("comments.author","_id userName profileImg");
    return post;
}

export const deletePostService=async(postId)=>{
    return await Post.findByIdAndDelete(postId);
}