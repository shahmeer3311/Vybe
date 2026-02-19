import React from 'react'
import { GoHomeFill } from "react-icons/go";
import { FiSearch, FiPlusSquare } from "react-icons/fi";
import { RxVideo } from "react-icons/rx";
import { TbMessageCircle } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';

const Nav = ({user}) => {
  const navigate = useNavigate();
  const navButtons = [
  {
    icon: <GoHomeFill />,
    route: "/",
  },
  {
    icon: <FiSearch />,
    route: "/search",
  },
  {
    icon: <FiPlusSquare />,
    route: "/upload",
  },
  {
    icon: <RxVideo />,
    route: "/loop",
  },
  {
    icon: <TbMessageCircle />,
    route: "/chats",
  },
];
  return (
    <div className='w-[40%] mx-auto h-16 bg-black text-white flex items-center justify-around fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full text-2xl z-50 px-4 backdrop-blur-md bg-opacity-90 border border-gray-700'>
       {navButtons.map((btn,idx)=>(
        <button
          key={idx}
          onClick={() => navigate(btn.route)}
          className='cursor-pointer'
        >
          {btn.icon}
        </button>
       ))}

       <button onClick={() => navigate(`/profile/${user?._id}`)}>
        <img
          src={user?.profileImg || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
          className="w-8 h-8 rounded-full object-cover cursor-pointer"
          alt="Profile"
        />
      </button>
    </div>
  )
}

export default Nav
