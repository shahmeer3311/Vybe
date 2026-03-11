import React from "react";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getUserConversationsApi } from "../api/msgApi";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import { FiSearch } from "react-icons/fi";
import SelectUser from "../components/SelectUser";
import CreateGroupModal from "../components/CreateGroupModal";
import GroupAvatar from "../components/GroupAvatar";
import { useMessageNotifications } from "../hooks/useMessageNotifications";

const Chats = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const [showUserList, setShowUserList] = React.useState(false);

  const { onlineUserIds, lastSeenMap } = useOnlineUsers();

  const { unreadCounts, clearConversationUnread } = useMessageNotifications();

  const { data: messageHistory = [] } = useQuery({
    queryKey: ["messageHistory"],
    queryFn: async () => await getUserConversationsApi(),
    enabled: !!user,
  });

  console.log("Message history:", messageHistory);

  const individualChats =
    messageHistory?.filter((conv) => conv.isGroupChat === false) || [];

  const OnlineUsers = individualChats.filter((chat) =>
    onlineUserIds.includes(
      chat.participants.find((p) => p._id !== user._id)?._id
    )
  );

  const groupChats = messageHistory.filter((c) => c.isGroupChat);

  const OfflineUsers = individualChats.filter(
    (chat) =>
      !onlineUserIds.includes(
        chat.participants.find((p) => p._id !== user._id)?._id
      )
  );

  const formatLastSeen = (userId) => {
    const ts = lastSeenMap?.[String(userId)];
    if (!ts) return "Offline";

    const d = new Date(ts);
    return `Last seen ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const getOtherUser = (chat) =>
    chat.participants.find((p) => p._id !== user._id);

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-black to-gray-950 text-white">

      {/* HEADER */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-800 fixed w-full top-0 bg-black/80 backdrop-blur z-50">
        <MdOutlineKeyboardBackspace
          onClick={() => navigate(-1)}
          className="w-7 h-7 cursor-pointer hover:text-gray-300 transition"
        />
        <h1 className="text-lg font-semibold tracking-wide">
          {user?.userName}
        </h1>
      </div>

      <div className="pt-24 px-6 space-y-8">

        {/* ONLINE */}
        <div>
          <h2 className="text-sm uppercase tracking-widest text-green-400 mb-3">
            Online
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {OnlineUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No friends online right now.
              </p>
            ) : (
              OnlineUsers.map((chat) => {
                const other = getOtherUser(chat);

                return (
                  <div
                    key={chat._id}
                    className="min-w-[110px] bg-gray-900/70 border border-gray-800 rounded-2xl p-4 flex flex-col items-center hover:bg-gray-900 transition"
                  >
                    <img
                      src={
                        other?.profileImg ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="user"
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-green-500"
                    />

                    <p className="text-sm mt-2 text-center font-medium">
                      {other?.name || "Unknown"}
                    </p>

                    <span className="text-[11px] text-green-400">
                      Online
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* OFFLINE */}
        <div>
          <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-3">
            Offline
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {OfflineUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Everyone is online.
              </p>
            ) : (
              OfflineUsers.map((chat) => {
                const other = getOtherUser(chat);

                return (
                  <div
                    key={chat._id}
                    className="min-w-[110px] bg-gray-900/70 border border-gray-800 rounded-2xl p-4 flex flex-col items-center hover:bg-gray-900 transition"
                  >
                    <img
                      src={
                        other?.profileImg ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="user"
                      className="w-14 h-14 rounded-full object-cover opacity-80"
                    />

                    <p className="text-sm mt-2 text-center font-medium">
                      {other?.name || "Unknown"}
                    </p>

                    <span className="text-[11px] text-gray-400 text-center">
                      {formatLastSeen(other?._id)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* SEARCH */}
        <div className="space-y-2">
          <h1 className="text-sm uppercase tracking-widest text-gray-500">
            Search Chats
          </h1>

        <div className="w-full flex items-center justify-between">
        <div className="relative w-full">
            <FiSearch className="absolute left-4 top-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-1/2 pl-11 pr-4 py-4 rounded-xl bg-gray-900 border border-gray-800 text-sm text-white focus:outline-none focus:ring-1 focus:ring-gray-700"
            />
            <button className="absolute top-2 left-[calc(50%-5.5rem)] px-4 py-2 bg-blue-600 text-sm rounded-lg hover:bg-blue-700 transition">Search</button>
          </div>  
          <div className="text-xs text-white-500">
          <button 
          onClick={() => setShowUserList(true)}
          className="px-4 py-2 bg-green-600 cursor-pointer text-sm rounded-xl hover:bg-green-700 transition mr-3 w-40"
          >Create Group</button>
          </div> 
        </div>  
        </div>

        {/* CHATS LIST */}
        <div className="mt-4">
           {messageHistory && messageHistory.length > 0 ? (
             <ul className="mt-3 pb-5 space-y-2">
               {messageHistory.map((conv) => {
                 const participants = Array.isArray(conv.participants)
                   ? conv.participants
                   : [];

                 const otherParticipant =
                   participants.find(
                     (p) => String(p._id) !== String(user?._id),
                   ) || participants[0];

                 console.log("Conversation participants:", participants);
                 console.log("Other participant:", otherParticipant);

                 if (!otherParticipant && !conv.isGroupChat) return null;

                 const unread = unreadCounts?.[conv._id] || 0;

                 return (
                   <li
                     key={conv._id}
                     onClick={() => {
                       clearConversationUnread(conv._id);
                       if (conv.isGroupChat) {
                         navigate(`/messageArea/group/${conv._id}`);
                       } else {
                         navigate(`/messageArea/user/${otherParticipant._id}`);
                       }
                     }}
                     className="flex items-center gap-3 bg-gray-900/60 rounded-lg px-4 py-4 cursor-pointer hover:bg-gray-900 transition-colors relative"
                   >
                     {conv.isGroupChat || !otherParticipant ? (
                       <GroupAvatar
                         participants={participants}
                         currentUserId={user?._id}
                       />
                     ) : (
                       <img
                         src={
                           otherParticipant.profileImg ||
                           "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                         }
                         alt={otherParticipant.userName}
                         className="w-10 h-10 rounded-full object-cover"
                       />
                     )}
                     <div className="flex items-center justify-between w-full ml-3">
                       <div>
                         <p className="text-sm font-medium text-white">
                           {conv.isGroupChat
                             ? conv.groupName || "Unnamed Group"
                             : otherParticipant?.name || "Unknown User"}
                         </p>
                         <p className="text-xs text-gray-400 truncate max-w-[150px]">
                           {conv.lastMessage?.message || "No messages yet"}
                         </p>
                       </div>
                       <div className="flex flex-col items-end gap-1">
                         <p className="text-[10px] text-gray-500">
                           {conv.createdAt
                             ? new Date(conv.createdAt).toLocaleTimeString(
                                 [],
                                 { hour: "2-digit", minute: "2-digit" },
                               )
                             : "No messages yet"}
                         </p>
                         {unread > 0 && (
                           <span className="min-w-[18px] h-[18px] px-2 rounded-full bg-red-600 text-[10px] flex items-center justify-center text-white">
                             {unread > 9 ? "9+" : unread}
                           </span>
                         )}
                       </div>
                     </div>
                   </li>
                 );
               })}
             </ul>
           ) : (
              <p className="text-xs text-gray-500 mt-2">No conversations found.</p>
            )}
        </div>
      </div>
      {showUserList && (
        <CreateGroupModal
          isOpen={showUserList}
          onClose={() => setShowUserList(false)}
        />
      )}
    </div>
  );
};

export default Chats;