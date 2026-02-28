import Message from "../models/message.model.js";

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