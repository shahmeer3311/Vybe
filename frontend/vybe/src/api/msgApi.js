import { api } from "./axiosInstance";

export const getGroupById = async (groupId) => {
  const { data } = await api.get(`/conversations/group/${groupId}`);
  return data.data;
};

export const sendmessage = async ({ receiverId, message, media, mediaType, type }) => {
  const payload = { message, media, mediaType, type };
  const { data } = await api.post(`/messages/${receiverId}`, payload);
  return data.data;
};

export const getMessagesApi = async (conversationId) => {
  const { data } = await api.get(`/messages/${conversationId}`);
  return data.data;
};

export const findOrCreateConversationWithUser = async (receiverId) => {
  const { data } = await api.post(`/conversations/user/${receiverId}`);
  return data.data;
};

export const getUserConversationsApi = async () => {
  const { data } = await api.get(`/conversations/user`);
  return data.data.conversations;
};