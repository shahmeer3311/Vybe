import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

export const createAndEmitMessage = async ({
    conversation,
    senderId,
    message,
    media,
    mediaType,
    status = "sent",
    isForwarded = false,
}) => {
    try {
        const newMessage = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            message,
            media,
            mediaType,
            status,
            isForwarded,
        });

        conversation.lastMessage = newMessage._id;
        await conversation.save();

        const populatedMessage = await newMessage.populate("sender", "name profileImg");
        return populatedMessage;
    } catch (error) {
        throw error;
    }
};

export const getMessagesService = async (conversationId) => {
    try {
        const messages = await Message.find({ conversationId })
            .populate("sender", "name profileImg")
            .sort({ createdAt: 1 });
        return messages;
    } catch (error) {
        throw error;
    }
};

export const forwardMessageService =async({senderId,messageId,conversationId})=>{
    try {
        const originalMessage=await Message.findById(messageId);
        if(!originalMessage){
            throw new Error("Original message not found");
        }
        const newMessage=await Message.create({
            sender: senderId,
            conversationId,
            message: originalMessage.message,
            media: originalMessage.media,
            mediaType: originalMessage.mediaType,
            isForwarded: true,
            status: "sent",
        });

        await Conversation.findByIdAndUpdate(conversationId,{
            lastMessage: newMessage._id,
        });
        return newMessage;
    } catch (error) {
        throw error;
    }
}