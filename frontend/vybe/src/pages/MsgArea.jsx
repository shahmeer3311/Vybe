import React, { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserById } from "../api/userApi";
import { useCurrentUser } from "../hooks/useAuth";
import {
  findOrCreateConversationWithUser,
  getGroupById,
  getMessagesApi,
  sendmessage,
} from "../api/msgApi";
import { uploadToImageKit } from "../api/imagekitUpload";
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { MdAddPhotoAlternate } from "react-icons/md";
import { IoSend } from "react-icons/io5";

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const MsgArea = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { type, id } = useParams();

  const [input, setInput] = useState("");
  const [frontImg, setFrontImg] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { data: currentUser } = useCurrentUser();

  const userId = type === "user" ? id : null;
  const groupId = type === "group" ? id : null;

  const { data: selectedEntity, isLoading } = useQuery({
    queryKey: ["selectedEntity", type, id],
    queryFn: async () =>
      type === "user" ? getUserById(userId) : getGroupById(groupId),
    enabled: !!id && !!type,
  });

  const entityData = selectedEntity?.data || {};

  const handleImageUpload = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type.startsWith("image/") || file.type.startsWith("video/"))
    ) {
      setFrontImg(file);
    } else {
      alert("Please select an image or video file.");
    }
  };

  const { data: conversationData, isLoading: conversationLoading } = useQuery({
    queryKey: ["conversation", type, id],
    queryFn: async () =>
      type === "user"
        ? findOrCreateConversationWithUser(userId)
        : getGroupById(groupId),
    enabled: !!id && !!type,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", conversationData?._id],
    queryFn: async () => getMessagesApi(conversationData?._id),
    enabled: !!conversationData?._id,
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Require at least text or media
    if (!input.trim() && !frontImg) return;
    if (!userId && !groupId) return;

    sendMsgMutation.mutate({
      receiverId: type === "user" ? userId : groupId,
      message: input.trim() || "",
      mediaFile: frontImg,
      type: type,
    });
  };

  const sendMsgMutation = useMutation({
    mutationFn: async ({ receiverId, message, mediaFile, type }) => {
      let mediaUrl = "";
      let mediaType = undefined;

      if (mediaFile) {
        const uploaded = await uploadToImageKit(mediaFile, {
          showProgress: false,
        });
        mediaUrl = uploaded.url;
        mediaType = mediaFile.type.startsWith("image/") ? "image" : "video";
      }

      return await sendmessage({
        receiverId,
        message,
        media: mediaUrl || undefined,
        mediaType,
        type,
      });
    },
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", conversationData?._id],
      });

      const previousMessages =
        queryClient.getQueryData(["messages", conversationData?._id]) || [];

      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        conversationId: conversationData._id,
        sender: { _id: currentUser._id }, 
        message: newMessage.message,
        media: newMessage.mediaFile ? URL.createObjectURL(newMessage.mediaFile): undefined,
        mediaType:  newMessage.mediaFile ? (newMessage.mediaFile.type.startsWith("image/") ? "image" : "video") : undefined,
        status: "sent",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["messages", conversationData?._id],
        (oldMessages = []) => {
          return [...oldMessages, optimisticMessage];
        },
      );

      return { previousMessages, optimisticMessage };
    },
    onError: (error, newMessage, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", conversationData?._id],
          context.previousMessages,
        );
      }
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(
        ["messages", conversationData?._id],
        (oldMessages = []) => {
          return oldMessages.map((msg) =>
            msg._id === context?.optimisticMessage?._id ? data : msg,
          );
        },
      );

      setInput("");
      setFrontImg(null);
    },
  });

   const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="-full min-h-screen bg-black flex flex-col text-white">
      <div className="w-full flex items-center justify-center py-5 border-b border-gray-800 fixed top-0 bg-black z-50">
        <MdOutlineKeyboardBackspace
          onClick={() => navigate(-1)}
          className="w-7 h-7 absolute left-4 cursor-pointer"
        />
        <div className="flex gap-3 items-center">
          <img
            src={
              entityData?.profileImg || entityData?.groupImage || defaultAvatar
            }
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border border-gray-700"
          />
          <div>
            <h3 className="text-sm font-bold">
              {type === "user"
                ? entityData?.userName || entityData?.name
                : entityData?.groupName}
            </h3>
            {type === "user" && (
              <p className="text-xs text-gray-400">{entityData?.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 pt-24 pb-32 overflow-auto">
        {messages.map((msg) => {
          const isOwnMessage = msg.sender._id === currentUser._id;
          return (
            <div
              key={msg._id}
              className={`flex mb-2 relative group ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              {!isOwnMessage && (
                <img
                  src={msg.sender.profileImg || defaultAvatar}
                  className="w-8 h-8 rounded-full mr-2 self-end"
                  alt={msg.sender.name}
                />
              )}

              <div
                className={`max-w-[60%] px-4 py-2 rounded-xl flex flex-col gap-1 relative group-hover:bg-gray-700 ${
                  isOwnMessage
                    ? "bg-blue-600 rounded-br-none"
                    : "bg-gray-800 rounded-bl-none"
                }`}
              >
                {type === "group" && !isOwnMessage && (
                  <p className="text-xs text-gray-400">{msg.sender.name}</p>
                )}

                <div
                  className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>

                {msg.media && (
                  <img
                    src={msg.media}
                    className="w-40 h-40 rounded-lg"
                    alt="uploaded"
                  />
                )}
                {msg.media && msg.mediaType === "video" && (
                  <video
                    src={msg.media}
                    controls
                    className="w-40 h-40 rounded-lg"
                  />
                )}

                <div className="flex justify-end items-center gap-1 text-xs mt-1 text-gray-300">
                  <span>{formatTime(msg.createdAt)}</span>
                  {/* {isOwnMessage && getMessageArrow(msg)} */}
                </div>

                {/* <div
                  onClick={() => {
                    setForwardMsg(msg);
                    setShowForward(true);
                  }}
                  className={`absolute top-1 ${isOwnMessage ? "-left-6" : "-right-6"} hidden group-hover:flex bg-black p-1 rounded-full cursor-pointer`}
                >
                  <IoSend className="text-green-400 rotate-45 w-4 h-4" />
                </div> */}
              </div>

              {/* Sender avatar */}
              {isOwnMessage && (
                <img
                  src={currentUser?.profileImg || defaultAvatar}
                  className="w-8 h-8 rounded-full ml-2 self-end"
                  alt={currentUser?.name}
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 w-full bg-black border-t border-gray-800 py-3">
        <form
          onSubmit={handleSendMessage}
          className="w-[90%] max-w-[750px] mx-auto bg-[#111] h-12 rounded-full flex items-center px-4 gap-3 border border-gray-800 relative"
        >
          {frontImg && (
            <div className="absolute -top-28 left-4">
              <img
                src={URL.createObjectURL(frontImg)}
                alt="preview"
                className="w-24 h-24 rounded-lg border border-gray-700"
              />
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          <MdAddPhotoAlternate
            className="w-6 h-6 cursor-pointer"
            onClick={handleImageUpload}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          {(input.trim() || frontImg) && (
            <button type="submit">
              <IoSend className="w-6 h-6 text-blue-500" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default MsgArea;
