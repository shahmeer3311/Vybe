import { getUserByIdService } from "../services/user.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { editProfileService, getSuggestedusersService, getFollowingService, followOrUnfollowService} from "../services/user.service.js";

export const getUserById=asyncHandler(async(req,res)=>{
    const {userId}=req.params;
    const user=await getUserByIdService(userId);
    return res.status(200).json(
        new ApiResponse(200,user,"User fetched successfully")
    )
});

export const EditProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const { name, userName, bio, profileImg, profession, gender } = req.body;

    const updateduser = await editProfileService({
        userId,
        name,
        userName,
        bio,
        profileImg,
        profession,
        gender,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, updateduser, "User profile updated successfully"),
        );
});

export const followOrUnfollowUserController = asyncHandler(async (req, res) => {
    const currentUserId=req.userId;
    const targetUserId=req.params.targetUserId;
    const result=await followOrUnfollowService(currentUserId,targetUserId);
    return res.status(200).json(
        new ApiResponse(200,{
            following: result.following,
            isFollowing: result.isFollowing,
        },
        result.message)
    )
});

export const getSuggestedUsers=asyncHandler(async(req,res)=>{
    const userId=req.userId;
    const suggestedUsers=await getSuggestedusersService(userId);
    return res.status(200).json(
        new ApiResponse(200,suggestedUsers,"Suggested users fetched successfully")
    )
});

export const getFollowingList=asyncHandler(async(req,res)=>{
   const userId=req.userId;
   const followingList=await getFollowingService(userId);
   console.log("Following List in Controller:", followingList);
   return res.status(200).json(
    new ApiResponse(200,followingList,"Following list fetched successfully")
   )
});