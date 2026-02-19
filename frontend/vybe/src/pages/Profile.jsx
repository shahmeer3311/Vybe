import { useQuery } from '@tanstack/react-query';
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUserById } from '../api/userApi';
import { getAllPostsApi } from '../api/postApi';
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useCurrentUser } from '../hooks/useAuth';
import FollowBtn from '../components/FollowBtn';

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const Profile = () => {
    const navigate=useNavigate();
    const {userId}=useParams();

    const {data: currentUser}=useCurrentUser();

    const {data: profileUser, isLoading: profileLoading}=useQuery({
        queryKey: ["profile",userId],
        queryFn:()=>getUserById(userId)
    });
    const {data: posts, isLoading: postsLoading } = useQuery({
        queryKey: ["posts"],
        queryFn: getAllPostsApi,
    })

    if(profileLoading || postsLoading) return <div className='text-white'>Loading...</div>  
    console.log(profileUser.data);
    console.log(posts);

    const profileData=profileUser.data;
    const allPosts=posts?.data || [];
    const myPost=allPosts.filter(p=>p.author._id===profileData._id);
    const isOwner=currentUser?.userName===profileData.userName;
    const isFollowing = currentUser?.following?.includes(profileData._id) || false;

    console.log(myPost);
  return (
    <div className='w-full h-screen bg-black flex flex-col gap-15'>
       <div className="w-full text-white flex items-center justify-center py-5 relative border-b border-gray-800">
        <MdOutlineKeyboardBackspace
          onClick={() => navigate(-1)}
          className="w-7 h-7 text-white absolute left-4 cursor-pointer"
        />
        <h1 className="text-xl text-white font-semibold">{profileData.name}</h1>
      </div>

       <div className="flex items-center justify-center gap-5">
        <img
          src={profileData.profileImg || defaultAvatar}
          className="w-45 h-45 rounded-full object-cover"
        />

        <div className="flex flex-col gap-3 text-white">
          <p className="text-3xl font-extrabold">{profileData.name || "User"}</p>
          <p className="text-xl font-bold">{profileData.profession || "Not specified"}</p>
          <p className="text-[12px] text-gray-500 font-light">
            {profileData.bio || "No bio available."}
          </p>
        </div>
      </div>

       <div className="flex items-center justify-center gap-15 text-white">
        <div className="flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold">{myPost.length || 0}</div>
          <div className="text-gray-400 text-lg">Posts</div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold">
            {profileData.followers.length || 0}
          </div>
          <div className="text-gray-400 text-lg">Followers</div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold">
            {profileData.following.length || 0}
          </div>
          <div className="text-gray-400 text-lg">Following</div>
        </div>
      </div>

       <div className="w-full h-10 flex items-center justify-center">
        {isOwner ? (
          <button
            className="px-2.5 min-w-[150px] py-[5px] h-10 bg-white text-black mt-10 cursor-pointer rounded-2xl"
            onClick={() => navigate("/edit-profile")}
          >
            Edit Profile
          </button>
        ) : (
          <>
            <FollowBtn
              targetUserId={profileData._id}
              isFollowing={isFollowing}
              tailwind="px-2.5 min-w-[150px] py-[5px] h-10 mt-10 cursor-pointer rounded-2xl"
            />
            <button
              className="px-2.5 min-w-[150px] ml-5 py-[5px] h-10 bg-white text-black mt-10 cursor-pointer rounded-2xl"
              onClick={()=> navigate(`/messageArea/user/${profileData._id}`)}
            >
              Message
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default Profile
