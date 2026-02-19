import React from 'react'
import MainLogo from "../assets/MainLogo.png";
import { FaRegHeart, FaSignOutAlt } from "react-icons/fa";
import { logoutApi } from '../api/authApi';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { setAccessToken } from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { getSuggestedUsersApi } from '../api/userApi';
import FollowBtn from './FollowBtn';
import { getFollowingListApi } from '../api/userApi';

const LeftHome = ({user}) => {
  const navigate=useNavigate();
    const queryClient = useQueryClient();
    const logoutMutation = useMutation({
        mutationFn: async()=>{
            await logoutApi();
        },
        onSuccess: ()=>{
            setAccessToken(null);
            queryClient.setQueryData(["currentUser"], null);
            api.defaults.headers.common["Authorization"] = "";
            navigate("/login");
        }
    });

    const {data: suggestedUsers}=useQuery({
        queryKey: ["suggestedUsers"],
        queryFn: async()=>{
            const response=await getSuggestedUsersApi();
            return response.data;
        }
    });

    const {data: followingList}=useQuery({
        queryKey: ["followingList"],
        queryFn: async()=>{
            const response=await getFollowingListApi();
            return response.data;
        }
    })

    console.log("Suggested Users:", suggestedUsers);
    console.log("Following List:", followingList);
  if(!user) return <div className='text-white'>Loading...</div>
  return (
     <div className="w-[25%] h-screen hidden lg:block fixed top-0 left-0 bg-black border-r border-gray-600 z-100 ">
       <div className="flex flex-col gap-5 px-6 py-4">

         <div className="w-full h-25 flex items-center justify-between">
          <img src={MainLogo} className="w-22" alt="Logo" />
          <div
            className="relative cursor-pointer">
            <FaRegHeart className="text-white w-6.25 h-6.25" />
          </div>
        </div>
         <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <img
              src={user.profileImg || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              className="w-12 h-12 rounded-full"
              alt="User"
            />
            <div className="text-white text-[13px]">
              <p className="font-bold">{user.userName}</p>
              <p className="text-gray-500">{user.name}</p>
            </div>
          </div>

          <FaSignOutAlt
            onClick={() => logoutMutation.mutate()}
            className="text-gray-400 hover:text-red-500 cursor-pointer"
            size={20}
          />
        </div>

          <div className='flex flex-col w-full min-h-screen overflow-y-auto gap-5 mt-10'>
           <h1 className="text-white text-xl italic font-bold  py-2">Suggested Users</h1>
         {suggestedUsers && suggestedUsers.map((user) => (
        <div key={user._id} className='flex items-center justify-between pb-2  border-b border-gray-600'>
          <div className="flex items-center gap-3 ">
              <img
                src={user.profileImg || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                className="w-13 h-13 rounded-full object-cover cursor-pointer"
                onClick={()=>navigate(`/profile/${user._id}`)}
                alt="User"
              />
              <div className="text-white text-[15px]">
                <p className="font-bold">{user.userName}</p>
                <p className="text-gray-500">{user.name}</p>
              </div>
            </div>
              <FollowBtn targetUserId={user._id} 
              isFollowing={followingList ? followingList.following.some((u) => u._id === user._id) : false}
              tailwind="bg-blue-500 hover:bg-blue-700 text-white px-3.5 py-2 cursor-pointer rounded-xl"
              />
            </div>
          ))}
       </div>
       </div>
    </div>
  )
}

export default LeftHome
