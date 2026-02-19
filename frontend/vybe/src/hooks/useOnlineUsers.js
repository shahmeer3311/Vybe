import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { socket } from "../api/axiosInstance";

export const useOnlineUsers = () => {
    const queryClient = useQueryClient();

    const { data: onlineData } = useQuery({
        queryKey: ["onlineUsers"],
        // We don't fetch from HTTP; socket will keep this updated.
        // Provide a no-op queryFn to satisfy React Query.
        queryFn: async () => ({ online: [], lastSeen: {} }),
        initialData: { online: [], lastSeen: {} },
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!socket) return;

        // “Whenever Socket sends new online users, overwrite the React Query cache with that data.”
        const handleOnlineUsers = (data) => {
            queryClient.setQueryData(["onlineUsers"], data);
        };

        // Backend emits "getOnlineUsers" in socketio.js
        
        socket.on("getOnlineUsers", handleOnlineUsers);

        return () => {
            socket.off("getOnlineUsers", handleOnlineUsers);
        };
    }, [queryClient]);

    const onlineUserIds = onlineData.online || [];
    const lastSeenMap = onlineData.lastSeen || {};

    return { onlineUserIds, lastSeenMap };
};