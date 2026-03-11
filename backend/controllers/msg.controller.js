import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import {findOrCreateConversation} from "../services/convo.service.js";
import {createAndEmitMessage, getMessagesService, forwardMessageService} from "../services/msg.service.js";
import { getIo, getSocketId } from "../socketio.js";

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

    const io = getIo();
    const roomId = conversation._id.toString();
    io.to(roomId).emit("newMessage", newMessage);

    // For 1:1 chats, immediately mark as delivered if the receiver is online,
    // even if their MsgArea page is not currently open. Also emit a
    // per-user notification event so other parts of the UI (like Nav)
    // can react without joining every conversation room.
    if (!conversation.isGroupChat && receiverId) {
        const receiverSockets = getSocketId(receiverId);

        if (receiverSockets && receiverSockets.length > 0) {
            try {
                newMessage.status = "delivered";
                newMessage.deliveredAt = new Date();
                await newMessage.save();

                io.to(roomId).emit("messageStatusUpdated", {
                    messageId: newMessage._id.toString(),
                    status: "delivered",
                });
                // Send a lightweight notification directly to all of the
                // receiver's active sockets.
                receiverSockets.forEach((socketId) => {
                    io.to(socketId).emit("newMessageNotification", newMessage);
                });
            } catch (error) {
                console.error("Error setting message as delivered or notifying receiver:", error);
            }
        }
    }

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

export const forwardMessage = asyncHandler(async (req, res) => {
    const senderId = req.userId;
    const { messageId, conversationId } = req.body;
    const forwardedMessage = await forwardMessageService({ senderId, messageId, conversationId });

    const io = getIo();
    io.to(conversationId.toString()).emit("newMessage", forwardedMessage);

    return res
        .status(200)
        .json(new ApiResponse(200, forwardedMessage, "Message forwarded successfully"));
});