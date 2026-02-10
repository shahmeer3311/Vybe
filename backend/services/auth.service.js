import { ApiError } from "../utils/apiError.js";
import User from "../models/user.model.js";
import { generateToken } from "../utils/token.js";

export const signUpService=async({name,userName,email,password})=>{
    if(!name || !userName || !email || !password){
       throw new ApiError(400,"All fields are required");
    }
    if(password.length<6){
        throw new ApiError(400,"Password must be at least 6 characters");
    }
    const existedUsername=await User.findOne({userName});
    if(existedUsername){
        throw new ApiError(400,"Username already exists");
    }
    const existedEmail=await User.findOne({email});
    if(existedEmail){
        throw new ApiError(400,"Email already exists");
    }
    const user=await User.create({name,userName,email,password});
    const accessToken=generateToken(user._id,"access");
    const refreshToken=generateToken(user._id,"refresh");
    return {user,accessToken,refreshToken};
}

export const loginService=async({email,password})=>{
    if(!email || !password){
        throw new ApiError(400,"Email and password are required");
    }  
    if(password.length<6){
        throw new ApiError(400,"Password must be at least 6 characters");
    }
    const user=await User.findOne({email}).select("+password");
    if(!user){
        throw new ApiError(400,"Invalid email or password");
    }
    const isMatch=await user.comparePassword(password);
    if(!isMatch){
        throw new ApiError(400,"Invalid email or password");
    }
    const accessToken=generateToken(user._id,"access");
    const refreshToken=generateToken(user._id,"refresh");
    return {user,accessToken,refreshToken};
};