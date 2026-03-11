import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { socket } from "../api/axiosInstance";
import { useCurrentUser } from "./useAuth";

export const useMessageNotifications = () => {
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const { data: unreadCounts = {} } = useQuery({
    queryKey: ["messageNotifications"],
    // No HTTP fetch; this state is driven entirely by socket events.
    queryFn: async () => ({}),
    initialData: {},
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!socket || !user?._id) return;

    const handleNewMessageNotification = (msg) => {
      if (!msg?.conversationId) return;
      // Ignore notifications for messages sent by the current user.
      if (String(msg.sender) === String(user._id)) return;

      const convId = String(msg.conversationId);

      queryClient.setQueryData(["messageNotifications"], (prev = {}) => ({
        ...prev,
        [convId]: (prev[convId] || 0) + 1,
      }));
    };

    const handleMessagesSeenUpdate = ({ conversationId }) => {
      if (!conversationId) return;
      const convId = String(conversationId);

      queryClient.setQueryData(["messageNotifications"], (prev = {}) => {
        if (!prev[convId]) return prev;
        const next = { ...prev };
        delete next[convId];
        return next;
      });
    };

    socket.on("newMessageNotification", handleNewMessageNotification);
    socket.on("messagesSeenUpdate", handleMessagesSeenUpdate);

    return () => {
      socket.off("newMessageNotification", handleNewMessageNotification);
      socket.off("messagesSeenUpdate", handleMessagesSeenUpdate);
    };
  }, [user?._id, queryClient]);

  const clearConversationUnread = (conversationId) => {
    if (!conversationId) return;
    const convId = String(conversationId);

    queryClient.setQueryData(["messageNotifications"], (prev = {}) => {
      if (!prev[convId]) return prev;
      const next = { ...prev };
      delete next[convId];
      return next;
    });
  };

  return { unreadCounts, clearConversationUnread };
};
