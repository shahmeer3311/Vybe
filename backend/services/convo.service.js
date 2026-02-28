import Conversation from "../models/conversation.model.js";

export const findOrCreateConversation = async ({
  senderId,
  receiverIds,
  isGroupChat = false,
  groupName,
}) => {
  try {
    let conversation;

    const senderIdStr = senderId.toString();
    const receiverIdsStr = receiverIds.map((id) => id.toString());

    if (!isGroupChat) {
      conversation = await Conversation.findOne({
        isGroupChat: false,
        participants: { $size: 2, $all: [senderIdStr, ...receiverIdsStr] },
      });
      console.log("Existing 1-to-1 conversation found:", conversation);
    }

    if (!conversation) {
      const participants = [senderIdStr, ...receiverIdsStr];

      const payload = {
        participants,
        isGroupChat,
      };

      if (isGroupChat) {
        payload.groupName = groupName;
        payload.groupAdmin = senderIdStr;
      }

      conversation = await Conversation.create(payload);
      console.log("New conversation created:", conversation);
    }

    return conversation;
  } catch (error) {
    console.error("Error in findOrCreateConversation:", error);
    throw error;
  }
};

export const getGroupByIdService = async (groupId) => {
  try {
    const group = await Conversation.findById(groupId);
    return group;
  } catch (error) {
    throw error;
  }
};

export const findOrCreateConversationWithUserService = async (
  userId,
  receiverId,
) => {
  try {
    const conversation = await Conversation.findOne({
      isGroupChat: false,
      participants: { $size: 2, $all: [userId.toString(), receiverId.toString()] },
    });

    if (conversation) {
      return conversation;
    }

    const newConversation = await Conversation.create({
      participants: [userId.toString(), receiverId.toString()],
      isGroupChat: false,
    });

    return newConversation;
  } catch (error) {
    console.error("Error in findOrCreateConversationWithUserService:", error);
    throw error;
  }
};

export const getUserConversationsService=async(userId)=>{
 try {
  const conversations=await Conversation.find({
    participants: userId,
  })
  .populate("participants","name profileImg email")
  .populate("lastMessage")
  .sort({ updatedAt: -1 });
  return conversations;
 } catch (error) {
  throw error;
 }
};