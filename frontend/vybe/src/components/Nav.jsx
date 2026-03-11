import React, { useEffect } from 'react'
import { GoHomeFill } from "react-icons/go";
import { FiSearch, FiPlusSquare } from "react-icons/fi";
import { RxVideo } from "react-icons/rx";
import { TbMessageCircle } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import { socket } from '../api/axiosInstance';
import { useLocation } from "react-router-dom";

const Nav = ({user}) => {
  const navigate = useNavigate();
  const [hasNewMessage, setHasNewMessage] = React.useState(false);
  const location = useLocation();

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
      isMessage: true,
    },
  ];

  useEffect(() => {
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }

    console.log("Socket connected in Nav:", socket.connected);

    if (user?._id) {
      socket.emit("registerUser", {
        _id: user._id,
        userName: user.userName,
        name: user.name,
      });
    }

    const handleNewMessageNotification = (msg) => {
      if (msg?.sender !== user?._id && location.pathname !== "/chats") {
        console.log("New message notification received from:", msg.sender);
        setHasNewMessage(true);
      }
    };

    socket.on("newMessageNotification", handleNewMessageNotification);

    return () => {
      socket.off("newMessageNotification", handleNewMessageNotification);
    };
  }, [user?._id, user?.userName, user?.name, location.pathname]);
  
  console.log("hasNewMessage", hasNewMessage);

  return (
    <div className='w-[40%] mx-auto h-16 bg-black text-white flex items-center justify-around fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full text-2xl z-50 px-4 backdrop-blur-md bg-opacity-90 border border-gray-700'>
       {navButtons.map((btn,idx)=>(
        <button
          key={idx}
          onClick={() => {
            if (btn.route === "/chats") {
              setHasNewMessage(false);
            }
            navigate(btn.route);
          }}
          className='relative cursor-pointer'
        >
          {btn.icon}
          {btn.isMessage && hasNewMessage && (
            <span 
            style={{}}
            className="absolute top-1.5 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
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
