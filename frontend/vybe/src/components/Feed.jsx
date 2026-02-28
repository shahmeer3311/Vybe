import React from 'react'
import Nav from './Nav'
import { getAllPostsApi } from '../api/postApi'
import { getAllStoriesApi } from '../api/storyApi'
import { useQuery } from '@tanstack/react-query'
import PostCard from './PostCard'
import StoryCard from './StoryCard'

const Feed = ({user}) => {
   console.log("User in Feed.jsx", user);
   const {data: posts, isLoading: postLaoding}=useQuery({
    queryKey: ["posts"],
    queryFn: getAllPostsApi,
    // staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
   });

   const {data: stories, isLoading: storyLoading}=useQuery({
    queryKey: ["stories"],
    queryFn: getAllStoriesApi,
    // staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
   })

   console.log("Stories in Feed.jsx",stories);

  if(postLaoding || storyLoading){
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin'></div>
      </div>
      )
  }

  return (
    <div className='w-full bg-black md:w-[50%] mx-auto h-screen border-gray-600 z-100 overflow-y-auto'>
      <Nav user={user} />
      <div className='w-full h-[20%] flex items-center gap-5 overflow-x-auto p-5 no-scrollbar'>
        <StoryCard 
        userName={user?.userName}
        profileImage={user?.profileImg}
        storyId={user?.stories?.length > 0 ? user.stories[user.stories.length - 1] : null}
        hasViewed={true} // own story is always viewed
        />
        {stories?.data?.map((story)=>(
          <StoryCard 
          key={story._id}
          userName={story?.author?.userName}
          profileImage={story?.author?.profileImg}
          storyId={story._id}
          hasViewed={story?.viewers?.includes(user._id)}
          />
        ))}
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
