import React from "react";
import { FaHeart, FaRegCommentDots, FaFlag, FaShareAlt, FaBookmark } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useCurrentUser } from "../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeLoopApi, commentLoopApi } from "../api/loopApi";
import { useState } from "react";
import { FaCircleArrowUp } from "react-icons/fa6";
import { formatDistanceToNow } from "date-fns";

const LoopVideo = ({ loop }) => {
  console.log("Rendering LoopVideo for loop:", loop);
  const queryClient = useQueryClient();
  const [openComments, setOpenComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = React.useRef(null);
  const [heartAnimation, setHeartAnimation] = useState(false);
  const [progress, setProgress] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const { data: currentUser } = useCurrentUser();

  const isLiked = loop.likes.includes(currentUser?._id);

  const likeMutation = useMutation({
    mutationFn: (loopId) => likeLoopApi(loopId),

    onMutate: async (loopId) => {
      console.log("Liking loop with ID:", loopId);

      await queryClient.cancelQueries({ queryKey: ["loops"] });

      const previousLoops = queryClient.getQueryData(["loops"]);

      queryClient.setQueryData(["loops"], (oldData) => {
        console.log("Old loops data before like mutation:", oldData);

        if (!oldData) return oldData;

        return {
          ...oldData,
          data: oldData.data.map((l) => {
            if (l._id === loopId) {
              const isAlreadyLiked = l.likes.includes(currentUser._id);

              return {
                ...l,
                likes: isAlreadyLiked
                  ? l.likes.filter((id) => id !== currentUser._id)
                  : [...l.likes, currentUser._id],
              };
            }
            return l;
          }),
        };
      });

      return { previousLoops };
    },

    onError: (err, variables, context) => {
      console.error("Error liking loop:", err);
      queryClient.setQueryData(["loops"], context.previousLoops);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["loops"] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ loopId, comment }) => commentLoopApi({ loopId, comment }),
    onMutate: async ({ loopId, comment }) => {
      await queryClient.cancelQueries({ queryKey: ["loops"] });

      const previousLoops = queryClient.getQueryData(["loops"]);
      queryClient.setQueryData(["loops"], (oldData) => {
        console.log("Old loops data before comment mutation:", oldData);
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((l)=>{
            if(l._id===loopId){
              return {
                ...l,
                comments: [
                  ...l.comments,
                  {
                    _id: `temp-id-${Date.now()}`,
                    author: currentUser,
                    text: comment,
                  }
                ]
              }
            }
            return l;
          })
        }
      });
      return { previousLoops };
    },
    onError: (err, variables, context) => {
      console.error("Error adding comment:", err);
      queryClient.setQueryData(["loops"], context.previousLoops);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["loops"] });
      setCommentText("");
    }
  });

  const handleAnimation = () => {
    if(!isLiked){
      setHeartAnimation(true);
      setTimeout(() => setHeartAnimation(false), 1000);
      isLiked ? likeMutation.mutate(loop._id) : likeMutation.mutate(loop._id);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if(videoRef.current.paused){
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if(videoRef.current){
      const currentTIme=videoRef.current.currentTime;
      const duration=videoRef.current.duration || 1;
      setProgress((currentTIme/duration)*100);
    }
  }

  return (
    <div className="w-full h-full relative">
      <video
        src={loop.mediaUrl}
        ref={videoRef}
        autoPlay
        loop
        playsInline
        muted={isMuted}
        onClick={handleTogglePlay}
        onDoubleClick={handleAnimation}
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-cover"
      />

      {heartAnimation && (
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <FaHeart className="text-white text-6xl animate-ping" />
        </div>
      )}

      <div className="absolute right-4 top-50 flex flex-col items-center gap-4 text-white">
        <button
          onClick={() => likeMutation.mutate(loop._id)}
          className="flex flex-col items-center"
        >
          <FaHeart
            className={`w-6 h-6 ${isLiked ? "text-red-500" : "text-white"}`}
          />
          <p className="text-xs mt-2">{loop.likes.length}</p>
        </button>

        <button
          onClick={() => setOpenComments(!openComments)}
          className="flex flex-col items-center"
        >
          <FaRegCommentDots className="w-6 h-6" />
          <p className="text-xs mt-2">{loop?.comments.length || 0}</p>
        </button>

        <button
          onClick={() => console.log("Send clicked")}
          className="flex flex-col items-center"
        >
          <IoSend className="w-6 h-6" />
          <p className="text-xs mt-2">Send</p>
        </button>

        <button
          onClick={() => console.log("More options")}
          className="flex flex-col items-center"
        >
          <BsThreeDotsVertical
          onClick={()=>setOverlayVisible((prev)=>!prev)}
          className="w-6 h-6" />
        </button>
      </div>

      {overlayVisible && (
        <div className="absolute right-4 bottom-30 w-44 bg-linear-to-b from-gray-800/90 via-gray-900/95 to-black/95 text-white rounded-2xl shadow-xl p-2 border border-white/10 backdrop-blur-md z-20">
          <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors text-sm">
            <FaFlag className="w-4 h-4 text-red-400" />
            <span>Report</span>
          </button>
          <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors text-sm">
            <FaShareAlt className="w-4 h-4 text-blue-400" />
            <span>Share</span>
          </button>
          <button className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors text-sm">
            <FaBookmark className="w-4 h-4 text-yellow-300" />
            <span>Save</span>
          </button>
        </div>
      )}

      <div className="w-full absolute bottom-10 left-4 text-white px-2 py-1 rounded flex flex-col gap-4">
        <div>
          {loop.author?.profileImg && (
            <img
              src={loop.author.profileImg}
              alt="Author"
              className="w-10 h-10 rounded-full inline-block mr-2"
            />
          )}
          {loop.author?.userName || "Unknown"}
        </div>

        <div className="w-full flex items-center justify-between">
          <p>{loop?.title || "No caption"}</p>

          <div className="mr-5">
            <img
              src={loop?.author?.profileImg}
              className="w-10 h-10 rounded-xl"
            />
          </div>
        </div>
      </div>

      <div className="w-full h-1 absolute bg-gray-500 bottom-0">
        <div className="w-full h-1 bg-red-500" 
        style={{ width: `${progress}%` }}></div>
      </div>

      {openComments && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpenComments(false)}
          ></div>
          <div
            className={`absolute bottom-0 left-0 w-full h-[55vh] bg-black bg-opacity-80 text-white p-4 rounded-t-2xl z-20
  transform transition-transform duration-300 ease-in-out
  ${openComments ? "translate-y-0" : "translate-y-full"}`}
          >
            <div className="text-center w-full">
              <p className="bg-blue-500 w-8 h-1 rounded-full inline-block mr-2"></p>
              <h2 className="text-lg font-semibold mb-4">Comments</h2>
            </div>
            {loop.comments.length === 0 ? (
              <p>No comments yet. Be the first to comment!</p>
            ) : (
              <div className="max-h-[60%] overflow-y-auto mb-4">
                {loop.comments.map((comment) => (
                  <div key={comment._id} className="mb-4 px-3">
                    <div className="flex items-center mb-2">
                      {comment.author?.profileImg && (
                        <img
                          src={comment.author.profileImg}
                          alt="Comment Author"
                          className="w-9 h-9 rounded-full inline-block mr-2"
                        />
                      )}
                      <span className="font-semibold">
                        {comment.author?.userName || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 bg-gray-800 p-3 rounded-xl">
                      <p>{comment.text}</p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mb-4 mx-2.5 absolute bottom-4 left-0 w-full px-4">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-2 py-3 rounded-xl bg-gray-800 text-white focus:outline-none"
              />
              <FaCircleArrowUp
                className="w-8 h-8 absolute right-6 top-1/2 transform -translate-y-1/2 text-blue-500 cursor-pointer"
                onClick={() =>
                  commentMutation.mutate({
                    loopId: loop._id,
                    comment: commentText,
                  })
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoopVideo;
