import React from "react";
import { useCurrentUser } from "../hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getFollowingListApi, followOrUnfollowApi } from "../api/userApi";
import { deletePostApi } from "../api/postApi";
import {
  FiMoreHorizontal,
  FiTrash2,
  FiEdit2,
  FiUserPlus,
  FiUserCheck,
  FiFlag,
} from "react-icons/fi";
import { FaRegHeart, FaHeart, FaRegComment } from "react-icons/fa";
import { MdSaveAlt } from "react-icons/md";
import { IoIosSend } from "react-icons/io";

const PostCard = ({ post }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: followingList } = useQuery({
    queryKey: ["followingList"],
    queryFn: async () => {
      const response = await getFollowingListApi();
      return response.data;
    },
  });

  const isFollowing =
    followingList?.following?.some((u) => u._id === post?.author?._id) || false;

  const isOwner = post?.author?._id === currentUser?._id;

  const followMutation = useMutation({
    mutationFn: async () => {
      return await followOrUnfollowApi(post?.author?._id);
    },
    onSuccess: () => {
      queryClient.setQueryData(["followingList"], (oldData) => {
        if (!oldData) return oldData;

        const already = oldData.following?.some(
          (u) => u._id === post?.author?._id
        );

        return {
          ...oldData,
          following: already
            ? oldData.following.filter((u) => u._id !== post?.author?._id)
            : [...(oldData.following || []), { _id: post?.author?._id }],
        };
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await deletePostApi(post?._id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <div className="w-full flex flex-col gap-5 p-6 border border-gray-300 bg-white rounded-2xl shadow-md mb-6">
      
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        
        {/* Author Info */}
        <div className="flex gap-3 items-center">
          <img
            src={
              post?.author?.profileImg ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="profile"
            className="w-12 h-12 rounded-full object-cover"
          />

          <div>
            <h3 className="text-black font-semibold">
              {post?.author?.name || "Unknown User"}
            </h3>
            <p className="text-gray-500 text-sm">
              {post?.author?.email || "No email available"}
            </p>
          </div>
        </div>

        {/* 3 Dot Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <FiMoreHorizontal className="w-5 h-5 text-gray-700" />
          </button>

          {menuOpen && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />

              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl z-20 py-2 text-sm">
                <div className="px-4 pb-1">
                  <p className="text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                    Post options
                  </p>
                </div>
                <div className="h-px bg-gray-100 mb-1" />

                {isOwner ? (
                  <>
                    <button
                      onClick={() => {
                        console.log("Edit post clicked", post?._id);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-800 hover:bg-gray-50 transition"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </span>
                      <span>Edit post</span>
                    </button>

                    <button
                      onClick={() => {
                        deleteMutation.mutate();
                        setMenuOpen(false);
                      }}
                      disabled={deleteMutation.isLoading}
                      className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </span>
                      <span>
                        {deleteMutation.isLoading ? "Deleting..." : "Delete"}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        followMutation.mutate();
                        setMenuOpen(false);
                      }}
                      disabled={followMutation.isLoading}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-800 hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span
                        className={`flex items-center justify-center w-6 h-6 rounded-full ${
                          isFollowing
                            ? "bg-gray-200 text-gray-700"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {isFollowing ? (
                          <FiUserCheck className="w-3.5 h-3.5" />
                        ) : (
                          <FiUserPlus className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span>
                        {followMutation.isLoading
                          ? "..."
                          : isFollowing
                          ? "Unfollow"
                          : "Follow"}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        console.log("Report post", post?._id);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                    >
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-500">
                        <FiFlag className="w-3.5 h-3.5" />
                      </span>
                      <span>Report</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Media Section */}
      {post?.media?.length > 0 && (
        <div className="w-full mt-5">
          <div className="border border-gray-300 rounded-lg overflow-hidden relative max-h-150">

            {/* Current Media */}
            {post.media[currentIndex]?.type === "image" ? (
              <img
                src={post.media[currentIndex]?.url}
                alt={`media-${currentIndex}`}
                className="w-full h-full object-cover"
              />
            ) : post.media[currentIndex]?.type === "video" ? (
              <video
                src={post.media[currentIndex]?.url}
                controls
                className="w-full h-full object-cover"
              />
            ) : null}

            {/* Dots */}
            {post.media.length > 1 && (
              <div className="flex justify-center gap-2 absolute bottom-3 left-1/2 transform -translate-x-1/2">
                {post.media.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentIndex === index
                        ? "bg-blue-500 scale-110"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

        <div className="flex items-center justify-between gap-5 px-3">
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              type="button"
               className={`flex items-center gap-1 transition-all text-gray-600 hover:text-red-500`}
            //   onClick={() => likeMutation.mutate(post._id)}
            //   className={`flex items-center gap-1 transition-all ${
            //     hasLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
            //   }`}
            >
              {/* {hasLiked ? <FaHeart /> : <FaRegHeart />} */}
              <FaRegHeart className="w-5 h-5" />
              {post.likes?.length || 0}
            </button>

            {/* Comment */}
            <button
              type="button"
            //   onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-all"
            >
              <FaRegComment className="w-5 h-5" /> {post.comments?.length || 0}
            </button>
             <button
              type="button"
              className="flex items-center gap-1 text-gray-600 hover:text-blue-500 transition-all"
            >
              <IoIosSend className="w-6 h-6"  />
            </button>
          </div>

          {/* Save */}
          <button type="button">
            <MdSaveAlt className="w-6 h-6 text-blue-500" />
          </button>
        </div>
    </div>
  );
};

export default PostCard;