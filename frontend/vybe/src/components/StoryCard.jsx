import React from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const StoryCard = ({ userName, profileImage, storyId, hasViewed }) => {
  console.log("StoryCard props:", { userName, profileImage, storyId, hasViewed });
  const navigate = useNavigate();

  const defaultAvatar =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const handleClick = () => {
    if (!storyId) {
      navigate("/upload");
    } else {
      navigate(`/story/${userName}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-20">
      <div
        className={`relative w-20 h-20 rounded-full flex justify-center items-center
        ${
          storyId
            ? hasViewed
              ? "bg-gray-500"
              : "bg-linear-to-b from-pink-500 via-pink-600 to-blue-950"
            : "bg-gray-700"
        }`}
      >
        <div
          onClick={handleClick}
          className="w-[70px] h-[70px] border-2 border-black rounded-full overflow-hidden cursor-pointer"
        >
          <img
            src={profileImage || defaultAvatar}
            alt="story"
            className="w-full h-full object-cover"
          />
        </div>

        {!storyId && (
          <div className="absolute bottom-1 right-1 bg-blue-600 w-6 h-6 rounded-full text-white flex justify-center items-center border-2 border-black">
            <FaPlus />
          </div>
        )}
      </div>

      <p className="text-white text-center text-xs mt-2 truncate w-[70px]">
        {userName || "Unknown"}
      </p>
    </div>
  );
};

export default StoryCard;
