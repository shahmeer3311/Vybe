import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getGroupByIdService, findOrCreateConversationWithUserService, getUserConversationsService, createGroupConversationService } from "../services/convo.service.js";

export const getGroupById= asyncHandler( async(req,res)=>{
    const {groupId} = req.params;

    const group = await getGroupByIdService(groupId);
    if(!group){
        return res.status(404).json(new ApiResponse(false,null,"Group not found"));
    }
    res.status(200).json(new ApiResponse(true,group,"Group details fetched successfully"));
})

export const findOrCreateConversationWithUser=asyncHandler(async(req,res)=>{
    const userId=req.userId;
    const {receiverId}=req.params;

    const conversation = await findOrCreateConversationWithUserService(userId,receiverId);
    res.status(200).json(new ApiResponse(200,conversation,"Conversation fetched/created successfully"));
});

export const createGroupConversation=asyncHandler(async(req,res)=>{
   const adminId=req.userId;
   const {groupName,participantIds}=req.body;

    if(!groupName || !participantIds || participantIds.length<2){
     return res.status(400).json(new ApiResponse(false,null,"Group name and at least 2 participants are required"));
    }
    const uniqueparticipants= [...new Set([adminId,...participantIds])];

    const conversation=await createGroupConversationService(adminId, groupName, uniqueparticipants);
    res.status(201).json(new ApiResponse(true,conversation,"Group conversation created successfully"));
});

export const getUserConversations=asyncHandler(async(req,res)=>{
   const userId=req.userId;

   const conversations=await getUserConversationsService(userId);
   console.log("Fetched conversations for user:", { userId, conversations });
    res.status(200).json(new ApiResponse(true,{conversations},"User conversations fetched successfully"));
});