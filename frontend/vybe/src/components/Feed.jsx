import React from 'react'
import Nav from './Nav'
import { getAllPostsApi } from '../api/postApi'
import { useQuery } from '@tanstack/react-query'
import PostCard from './PostCard'

const Feed = ({user}) => {

   const {data: posts, isLoading: postLaoding}=useQuery({
    queryKey: ["posts"],
    queryFn: getAllPostsApi,
    // staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
   });

  if(postLaoding){
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin'></div>
      </div>
      )
  }

  return (
    <div className='w-full bg-black md:w-[50%] mx-auto h-screen border-gray-600 z-100 overflow-y-auto'>
      <Nav user={user} />
      <div className='w-full h-[20%] flex items-center justify-center text-gray-500 text-2xl font-bold'>
        <h1>Feed Coming Soon...</h1>
      </div>

      <div className='w-full min-h-screen bg-white rounded-t-[60px] flex flex-col items-center
      gap-5 px-6.5 pt-10 pb-30 shadow-lg'>
        {posts?.data?.length === 0 ?
      (<>
        <div className='w-full h-[20%] flex items-center justify-center text-gray-500 text-2xl font-bold'>
          <h1>No posts available</h1>
        </div>
      </>)
      :
      (<>
      {posts?.data?.map((post)=>(
        <PostCard key={post._id} post={post} />
      ))}
      </>)  
      }
      </div>
    </div>
  )
}

export default Feed
