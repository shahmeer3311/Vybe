import React from "react";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import { useQuery } from "@tanstack/react-query";
import { FiMessageCircle, FiSearch } from "react-icons/fi";
import { getFollowingListApi } from "../api/userApi";
import { getUserConversationsApi } from "../api/msgApi";
import { useNavigate } from "react-router-dom";
import GroupAvatar from "./GroupAvatar";
import { useMessageNotifications } from "../hooks/useMessageNotifications";

const RightHome = ({ user }) => {
  const navigate=useNavigate();
  const { onlineUserIds, lastSeenMap } = useOnlineUsers();
  const { unreadCounts, clearConversationUnread } = useMessageNotifications();

  // Subscribe to the same following list query so this component
  // updates as soon as the data is fetched or changes.
  const { data: followingListData } = useQuery({
    queryKey: ["followingList"],
    queryFn: async () => {
      const response = await getFollowingListApi();
      return response.data;
    },
  });

  const followingUsersRaw = followingListData?.following || [];

  const allUsers = Array.isArray(followingUsersRaw) ? followingUsersRaw : [];

  // Only show users as online if they are both followed and currently online
  const onlineUsers = allUsers.filter((u) =>
    onlineUserIds.includes(String(u._id))
  );
  const offlineUsers = allUsers.filter((u) =>
    !onlineUserIds.includes(String(u._id))
  );

  const formatLastSeen = (userId) => {
    const ts = lastSeenMap?.[String(userId)];
    if (!ts) return "Offline";
    const d = new Date(ts);
    return `Last seen ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const {data: messageHistory}=useQuery({
    queryKey:["messageHistory"],
    queryFn: async()=> await getUserConversationsApi(),
    enabled: !!user, // Only run this query if the user is logged in
  });

  console.log("Message History:", messageHistory);

  return (
    <div className="w-[25%] hidden lg:flex flex-col min-h-screen bg-black fixed top-0 right-0 border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-20 border-b border-gray-700 bg-black/90">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 tracking-wide">Inbox</span>
          <span className="text-xl font-semibold text-white flex items-center gap-2">
            Messages <FiMessageCircle className="text-blue-500" />
          </span>
        </div>
        {user && (
          <img
            src={
              user.profileImg ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="You"
            className="w-10 h-10 rounded-full object-cover border border-gray-700"
          />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Online now */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Online now
            </span>
            <span className="text-xs text-gray-500">
              {onlineUsers.length} online
            </span>
          </div>

          {onlineUsers.length === 0 ? (
            <p className="text-xs text-gray-500">No friends online right now.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {onlineUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between bg-gray-900/60 hover:bg-gray-900 rounded-2xl px-3 py-2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={
                          u.profileImg ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                        }
                        alt={u.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {u.userName}
                      </p>
                      <p className="text-xs text-gray-400 truncate max-w-[130px]">
                        {u.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-400">
                    Online
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent contacts */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
              Recent Online Contacts
            </span>
            <span className="text-xs text-gray-500">
              {offlineUsers.length} offline
            </span>
          </div>

          {offlineUsers.length === 0 ? (
            <p className="text-xs text-gray-500">No recent contacts yet.</p>
          ) : (
            <div className="flex flex-col gap-3 border-b border-gray-800 pt-3 h-30 overflow-y-auto">
              {offlineUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center justify-between bg-black hover:bg-gray-900/70 rounded-2xl px-3 py-2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u.profileImg ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={u.userName}
                      className="w-9 h-9 rounded-full object-cover opacity-80"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {u.userName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {formatLastSeen(u._id)}
                      </p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-gray-500" />
                </div>
              ))}
            </div>
          )}
        </div>     
      </div>

       <div className="px-5 py-3  bg-gradient-to-b from-black to-gray-950 absolute top-75 w-full">
        <div className="relative">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations"
            className="w-full bg-gray-900 text-sm text-gray-200 rounded-full pl-9 pr-3 py-2 outline-none border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-gray-500"
          />
        </div>
        <div className="mt-5 text-xs text-gray-500">
           <h1 className="text-white text-2xl italic font-bold">Message History</h1>
           {messageHistory && messageHistory.length > 0 ? (
             <ul className="mt-3 space-y-2">
               {messageHistory.map((conv) => {
                 const participants = Array.isArray(conv.participants)
                   ? conv.participants
                   : [];

                 const otherParticipant = participants.find(
                   (p) => String(p._id) !== String(user?._id),
                 ) || participants[0];

                 if (!otherParticipant) return null;

                 const unread = unreadCounts?.[conv._id] || 0;

                 return (
                   <li
                     key={conv._id}
                     onClick={() => {
                       clearConversationUnread(conv._id);
                       navigate(`/messageArea/user/${otherParticipant._id}`);
                     }}
                     className="flex items-center gap-3 bg-gray-900/60 rounded-lg px-4 py-4 cursor-pointer hover:bg-gray-900 transition-colors"
                   >
                    {
                      conv.isGroupChat ? 
                      (
                        <GroupAvatar
                         participants={participants}
                         currentUserId={user?._id}
                       />
                      )
                      :
                      (
                        <img
                         src={
                           otherParticipant.profileImg ||
                           "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                         }
                         alt={otherParticipant.userName}
                         className="w-10 h-10 rounded-full object-cover"
                       />
                      )
                    }
                     <div className="flex items-center justify-between w-full pl-3">
                       <div>
                         <p className="text-sm font-medium text-white">
                           {otherParticipant.name}
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
                           <span className="min-w-[16px] h-[16px] px-1.5 rounded-full bg-red-600 text-[10px] flex items-center justify-center text-white">
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
    </div>
  );
};

export default RightHome;
