import React from "react";
import { GiCrossMark } from "react-icons/gi";
import { MdGroupAdd } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../hooks/useAuth";
import { createGroupConversationApi, getUserConversationsApi } from "../api/msgApi";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [groupName, setGroupName] = React.useState("");

  const { data: messageHistory = [] } = useQuery({
    queryKey: ["messageHistory"],
    queryFn: async () => await getUserConversationsApi(),
    enabled: !!user,
  });

  console.log("User's conversations for group creation:", messageHistory);

  const [selectedParticipantIds, setSelectedParticipantIds] = React.useState([]);

  if (!isOpen) return null;

  const toggleParticipant = (participantId) => {
    setSelectedParticipantIds((prev) =>
      prev.includes(participantId)
        ? prev.filter((id) => id !== participantId)
        : [...prev, participantId]
    );
  };

  const handleClose = () => {
    setSelectedParticipantIds([]);
    setGroupName("");
    onClose?.();
  };

  const groupMutation = useMutation({
    mutationFn: createGroupConversationApi,
    onSuccess: (data) => {
      // refresh conversations list so new group appears
      queryClient.invalidateQueries({ queryKey: ["messageHistory"] });
      handleClose();
      // Optionally, navigate to the newly created group chat
      // navigate(`/chats/${data._id}`);
    },
  })

  const handleCreateGroup=()=>{
    if (selectedParticipantIds.length < 2 || groupMutation.isLoading) return;
    groupMutation.mutate({
        groupName: groupName || "New Group",
        participantIds: selectedParticipantIds,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#111] p-5 w-[520px] max-w-full rounded-2xl border border-gray-800 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold tracking-wide">Create New Group</h3>
            <p className="text-gray-400 text-xs mt-1">
              Select friends to add to your new group chat.
            </p>
          </div>
          <GiCrossMark
            onClick={handleClose}
            className="hover:text-red-500 cursor-pointer transition"
            size={22}
          />
        </div>

        <div className="text-xs text-gray-400 mb-2 flex items-center justify-between">
          <span>
            {selectedParticipantIds.length === 0
              ? "No participants selected yet."
              : `${selectedParticipantIds.length} participant${
                  selectedParticipantIds.length > 1 ? "s" : ""
                } selected`}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
          {messageHistory.filter((conv) => !conv.isGroupChat).map((conv) => {
            const otherUser = conv.participants?.find((p) => p._id !== user?._id);
            if (!otherUser) return null;

            const isSelected = selectedParticipantIds.includes(otherUser._id);

            return (
              <div
                key={conv._id}
                onClick={() => toggleParticipant(otherUser._id)}
                className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl cursor-pointer transition border text-center ${
                  isSelected
                    ? "bg-gray-900 border-green-500 shadow-[0_0_0_1px_rgba(34,197,94,0.6)]"
                    : "bg-[#181818] border-transparent hover:bg-gray-900 hover:border-gray-700"
                }`}
              >
                <div className="relative">
                  <img
                    src={
                      otherUser.profileImg ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={otherUser.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-800"
                  />
                  {isSelected && (
                    <MdGroupAdd
                      size={22}
                      className="text-green-500 absolute bottom-12 -right-2 bg-black rounded-full p-[2px] shadow-lg"
                    />
                  )}
                </div>

                <p className="font-medium text-xs text-center truncate w-full">
                  {otherUser.name}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <input 
          type="text"
          value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group Name......"
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gray-700"
          />
          <button
          onClick={handleCreateGroup}
            disabled={
              selectedParticipantIds.length < 2 || groupMutation.isLoading
            }
            className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
              selectedParticipantIds.length < 2 || groupMutation.isLoading
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-500 text-white shadow-md shadow-green-500/20"
            }`}
          >
            {groupMutation.isLoading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
