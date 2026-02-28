import { api } from "./axiosInstance";

export const createLoopApi=async({caption,media})=>{
    const {data}=await api.post("/loop/create",{caption,media});
    return data;
};

export const getLoopsApi=async()=>{
    const {data}=await api.get("/loop/get");
    return data;
};

export const likeLoopApi=async(loopId)=>{
    const {data}=await api.post(`/loop/like/${loopId}`);
    return data;
}

export const commentLoopApi=async({loopId,comment})=>{
    const {data}=await api.post(`/loop/comment/${loopId}`,{comment});
    return data;
}