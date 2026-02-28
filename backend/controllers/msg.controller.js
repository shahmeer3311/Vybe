import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import Conversation from "../models/conversation.model.js";
import {findOrCreateConversation} from "../services/convo.service.js";
import {createAndEmitMessage, getMessagesService} from "../services/msg.service.js";

export const sendMessage = asyncHandler(async (req, res) => {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;
    const {message, type, media, mediaType} = req.body;

    let conversation;
    if (type === "user") {
        conversation = await findOrCreateConversation({
            senderId,
            receiverIds: [receiverId],
            isGroupChat: false,
        });
    } else if (type === "group") {
        conversation = await Conversation.findById(receiverId);
        if (!conversation || !conversation.isGroupChat) {
            return res.status(404).json({success: false, message: "Group not found"});
        }
    } else {
        return res.status(400).json({success: false, message: "Invalid message type"});
    }

    const newMessage = await createAndEmitMessage({
        conversation,
        senderId,
        message,
        media,
        mediaType,
        status: "sent",
        isForwarded: false,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newMessage, "Message sent successfully"));
});

export const getMessages = asyncHandler(async (req, res) => {
    const {conversationId} = req.params;
    if (!conversationId) {
        return res
            .status(400)
            .json({success: false, message: "Conversation ID is required"});
    }

    const messages = await getMessagesService(conversationId);

    return res
        .status(200)
        .json(new ApiResponse(200, messages, "Messages retrieved successfully"));
});