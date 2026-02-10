import React from 'react'
import { createBrowserRouter } from "react-router-dom";
import {PublicRoute, PrivateRoute} from './RouteWrapper'
import Home from "../pages/Home"
import Login from '../pages/Login'
import Signup from '../pages/Signup'

const AppRoutes = (user) => 
    createBrowserRouter([
        {
            element:  <PrivateRoute user={user} />,
            children: [
                {
                    index: true,
                    element: <Home  />
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
