import { api, setAccessToken } from "./axiosInstance";

export const loginApi=(data)=>api.post("/auth/login",data);

export const signupApi=(data)=>api.post("/auth/signup",data);

export const logoutApi=()=>api.post("/auth/logout");

export const fetchUser=async()=>{
    try {
        console.log("Fetching user...");
        const {data}=await api.get("/auth/refresh");
        console.log("Fetch User",data);
        setAccessToken(data.data.accessToken);
        console.log("Fetch User Access Token:", data.data.accessToken);
        console.log("Fetch User",data.data);
         if (!data.data) return null;
        return data.data.user ?? null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}