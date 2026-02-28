import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useQuery } from '@tanstack/react-query';
import LoopVideo from '../components/LoopVideo';
import { getLoopsApi } from '../api/loopApi';

const LoopPage = () => {
  const navigate=useNavigate();

   const {data: loops, isLoading, error}=useQuery({
      queryKey:["loops"],
      queryFn: async()=> getLoopsApi(),
   });

   if(isLoading) return <div>Loading...</div>;
   if(error) return <div>Error loading loops.</div>;

  return (
    <div className='w-full h-screen bg-black flex flex-col'>
           <div className="w-full text-white flex items-center justify-center py-5 relative border-b border-gray-800">
            <MdOutlineKeyboardBackspace
              onClick={() => navigate(-1)}
              className="w-7 h-7 text-white absolute left-4 cursor-pointer"
            />
            <h1 className="text-xl text-white font-semibold">Loop Page</h1>
          </div>
          <div className='w-full flex-1 snap-y snap-mandatory overflow-y-auto scrollbar-hide mt-3 mb-4'>
            {loops?.data.length > 0 ? (
              loops.data.map((loop) => (
                <div
                  key={loop._id}
                  className="snap-start w-full h-full flex items-center justify-center py-4"
                >
                  <div className="w-full h-[calc(100%-0.5rem)] max-w-md rounded-2xl overflow-hidden bg-black">
                    <LoopVideo loop={loop} />
                  </div>
                </div>
              ))
            ) : (
              <div className='w-full h-full flex items-center justify-center text-white text-lg'>
                No loops available.
              </div>
            )}
          </div>
    </div>
  )
}

export default LoopPage
