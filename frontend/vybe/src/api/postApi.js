import { api } from "./axiosInstance";

// Create a post by sending caption and media URL array as JSON
export const createPostApi = async (payload) => {
  const { data } = await api.post("/posts/create", payload);
  return data;
};

export const getAllPostsApi=async()=>{
    const {data}=await api.get("/posts/get")
    return data;
}

export const deletePostApi = async (postId) => {
  const { data } = await api.delete(`/posts/${postId}`);
  return data;
};


export const likePostApi=async(postId)=>{
  const {data}=await api.put(`/posts/like/${postId}`);
  return data;
}

export const commentPostApi=async({postId,text})=>{
  const {data}=await api.post(`/posts/comments/${postId}`,{text});
  return data;
}