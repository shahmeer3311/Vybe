import { api } from "./axiosInstance"

export const getUserById=async(userId)=>{
    const {data}=await api.get(`/users/${userId}`);
    return data;
}

export const updateUserProfile=async(profileData)=>{
    const {data}=await api.post("/users/edit",profileData);
    return data;
}

export const followOrUnfollowApi=async(targetUserId)=>{
    const {data}=await api.post(`/users/follow/${targetUserId}`);
    return data;
}

export const getSuggestedUsersApi=async()=>{
    const {data}=await api.get("/users/suggested");
    return data;
}

export const getFollowingListApi=async()=>{
    const {data}=await api.get("/users/following");
    return data;
}