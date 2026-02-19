import mongoose from "mongoose";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";

export const getUserByIdService = async (userId) => {
    if (!userId) {
        throw new ApiError(404, "User not found");
    }

    // Prevent CastError when an invalid id like "following" is passed
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const user = await User.findById(userId)
        .select("-password")
        .populate("followers", "name username profileImg")
        .populate("following", "name username profileImg");
    return user;
};

export const editProfileService = async ({
    userId,
    name,
    userName,
    bio,
    profileImg,
    profession,
    gender,
}) => {
    console.log("Editing profile for userId:", userId);
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404,"User not found");
    }
        if (userName) {
            const username = await User.findOne({ userName });
            if (username && username._id.toString() !== userId) {
                throw new ApiError(400, "Username already taken");
            }
        }

        user.name = name ?? user.name;
        user.userName = userName ?? user.userName;
        user.bio = bio ?? user.bio;
        user.profileImg = profileImg ?? user.profileImg;
        user.profession = profession ?? user.profession;

        // Only update gender when a valid non-empty value is provided
        if (gender && ["male", "female", "other"].includes(gender)) {
            user.gender = gender;
        }

        await user.save();
        return user;
}

export const followOrUnfollowService=async(currentUserId,targetUserId)=>{
   if(currentUserId.toString()===targetUserId.toString()){
        throw new ApiError(400,"You cannot follow/unfollow yourself");
    }
    const currentUser=await User.findById(currentUserId);
    const targetUser=await User.findById(targetUserId);

    if(!currentUser || !targetUser){
        throw new ApiError(404,"User not found");
    }
    const isFollowing=currentUser.following.some(id=>id.toString()===targetUserId.toString());
    if(isFollowing){
        currentUser.following=currentUser.following.filter(id=>id.toString()!==targetUserId.toString());
        targetUser.followers=targetUser.followers.filter(id=>id.toString()!==currentUserId.toString());
    }else{
        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);
    }
    await currentUser.save();
    await targetUser.save();
    return { following: currentUser.following, isFollowing: !isFollowing, message: isFollowing ? "User unfollowed successfully" : "User followed successfully" };
};

export const getSuggestedusersService=async(userId)=>{
    console.log("Fetching suggested users for userId:", userId);
   const user=await User.find({_id: {$ne: userId}} ).select("-password").populate("followers","name username profileImg").populate("following","name username profileImg");
   return user;
};

export const getFollowingService=async(userId)=>{
        return await User.findById(userId).select("following -_id").populate("following","name username profileImg");
}