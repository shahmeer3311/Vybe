import { Navigate,Outlet } from "react-router-dom";

export const PrivateRoute=({user})=>{
    if(!user) return <Navigate to="/login" />
    return <Outlet />
}

export const PublicRoute=({user})=>{
    if(user) return <Navigate to="/" />
    return <Outlet />
}