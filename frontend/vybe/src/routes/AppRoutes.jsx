import React from 'react'
import { createBrowserRouter } from "react-router-dom";
import {PublicRoute, PrivateRoute} from './RouteWrapper'
import Home from "../pages/Home"
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import Upload from '../pages/Upload';
import Profile from '../pages/Profile';
import EditProfile from '../pages/EditProfile';

const AppRoutes = (user) => 
    createBrowserRouter([
        {
            element:  <PrivateRoute user={user} />,
            children: [
                {
                    index: true,
                    element: <Home user={user} />
                },
                {
                    path: "/upload",
                    element: <Upload />
                },
                {
                    path: "/profile/:userId",
                    element: <Profile />
                },
                {
                    path: "edit-profile",
                    element: <EditProfile />
                }
            ]
        },
        {
            element: <PublicRoute user={user} />,
             children: [
                {
                    path: "/login",
                    element: <Login />
                },{
                    path: "/signup",
                    element: <Signup />
                }
            ]
        }
    ]);

export default AppRoutes
