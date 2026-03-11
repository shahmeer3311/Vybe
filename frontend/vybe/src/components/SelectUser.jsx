import React from 'react'
import { GiCrossMark } from "react-icons/gi";
import { getUserConversationsApi, forwardMessageApi } from '../api/msgApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '../hooks/useAuth';
import { MdOutlineForwardToInbox } from "react-icons/md";

const SelectUser = ({ setForwardMsg, forwardMsg, setShowForward, setSelectedConvId, selectedConvId }) => {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: messageHistory = [] } = useQuery({
    queryKey: ["messageHistory"],
    queryFn: async () => await getUserConversationsApi(),
    enabled: !!user,
  });

  const forwardMutation = useMutation({
    mutationFn: forwardMessageApi,
    onSuccess: () => {
      setShowForward(false);
      setForwardMsg(null);
      setSelectedConvId(null);
      if (selectedConvId) {
        queryClient.invalidateQueries(["messages", selectedConvId]);
      }
    },
  });

  const handleClose = () => {
    setShowForward(false);
    setSelectedConvId(null);
    setForwardMsg(null);
  };

  const handleForward = () => {
    if (!forwardMsg || !selectedConvId) return;
    forwardMutation.mutate({
      messageId: forwardMsg._id,
      conversationId: selectedConvId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#111] p-4 w-[450px] max-w-full rounded-lg border border-gray-800 shadow-lg">
        <div className="flex items-center justify-between mb-3 relative">
          <h3 className="text-lg font-semibold">Forward Message</h3>
          <GiCrossMark
            onClick={handleClose}
            className="hover:text-red-500 cursor-pointer"
            size={20}
          />
        </div>
        <p className="text-gray-400 text-sm">Select a user to forward the message:</p>

        <div className="mt-4 grid grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
          {messageHistory.map((conv) => {
            const otherUser = conv.participants.find((p) => p._id !== user._id);
            if (!otherUser) return null;

            const isSelected = selectedConvId === conv._id;

            return (
              <div
                key={conv._id}
                onClick={() => setSelectedConvId(conv._id)}
                className={`relative flex flex-col items-center gap-2 px-2 py-4 rounded-md cursor-pointer transition border ${
                  isSelected
                    ? 'bg-gray-800 border-green-500'
                    : 'bg-[#181818] border-transparent hover:bg-gray-800'
                }`}
              >
                <img
                  src={otherUser.profileImg}
                  alt={otherUser.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <p className="font-medium text-xs text-center truncate w-full">
                  {otherUser.name}
                </p>
                {isSelected && (
                  <MdOutlineForwardToInbox
                    size={22}
                    className="text-green-500 absolute -top-2 -right-2 bg-black rounded-full"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded border border-gray-700 text-sm hover:bg-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleForward}
            disabled={!selectedConvId || !forwardMsg || forwardMutation.isLoading}
            className={`px-4 py-2 rounded text-sm transition flex items-center justify-center ${
              !selectedConvId || !forwardMsg || forwardMutation.isLoading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            {forwardMutation.isLoading ? 'Forwarding...' : 'Forward'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectUser
