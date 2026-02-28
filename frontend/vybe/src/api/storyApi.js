import { api } from "./axiosInstance";

export const createStoryApi=async(payload)=>{
   const {data}=await api.post("/stories/create",payload);
   return data;
}

export const getAllStoriesApi=async()=>{
    const {data}=await api.get("/stories/all");
    return data;
}

export const viewStoryApi=async(storyId)=>{
    const {data}=await api.get(`/stories/${storyId}/view`);
    return data;
}

export const getStoryByUserNameApi=async(userName)=>{
    const {data}=await api.get(`/stories/${userName}/stories`);
   console.log("getStoryByUserNameApi - Received data:", data);
    return data;
}