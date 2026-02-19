import axios from "axios";
import {io} from "socket.io-client";

export const socket=io("http://localhost:3001",{
    withCredentials:true,
    autoConnect:false
});
export const api=axios.create({
    baseURL:"http://localhost:3001/api",
    withCredentials:true
});

let accessToken=null;

export const setAccessToken=(token)=>{
    accessToken=token;
}

api.interceptors.request.use((config)=>{
    if(accessToken) config.headers["Authorization"]=`Bearer ${accessToken}`;
    return config;
})