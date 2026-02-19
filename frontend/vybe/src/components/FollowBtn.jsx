import { useMutation } from '@tanstack/react-query';
import { followOrUnfollowApi } from '../api/userApi';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react'

const FollowBtn = ({targetUserId, isFollowing, tailwind}) => {
  console.log("FollowBtn Target fol :", isFollowing);

    const queryClient = useQueryClient();

    const mutation=useMutation({
        mutationFn: async()=>{
            await followOrUnfollowApi(targetUserId);
        },
        onSuccess: ()=>{
            queryClient.setQueryData(["followingList"],(oldData)=>({
                ...oldData,
                following: isFollowing
                ? oldData.following.filter((u)=>u._id !== targetUserId)
                : [...oldData.following, {_id: targetUserId}]
            }))
        },
        onError: (err)=>{
            console.error("Error in follow/unfollow:", err);
        }
    })
  return (
   <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isLoading}
      className={`px-3 py-1.5 text-sm font-medium transition-all
        ${
          isFollowing
            ? "bg-gray-500 text-black hover:bg-gray-300"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }
        ${tailwind}`}
    >
      {mutation.isLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
    </button>
  )
}

export default FollowBtn
