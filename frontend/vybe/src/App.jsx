import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { RouterProvider } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "./api/authApi";
import { socket } from "./api/axiosInstance";
import { useEffect } from "react";

const App = () => {
  const { data: user, isLoading, isFetching } = useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(()=>{
    if(!user?._id) return;
    socket.connect();
    socket.emit("registerUser",user._id);
    return ()=>{
        socket.disconnect();
    }
  },[user]);

  if (isLoading || isFetching) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  console.log("Current User in App.jsx:", user);

  const router = AppRoutes(user);
  return <RouterProvider router={router} />;
};

export default App;