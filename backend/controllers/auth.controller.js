import { asyncHandler } from "../utils/asyncHandler.js";
import { signUpService, loginService } from "../services/auth.service.js";
import  RefreshToken  from "../models/RefreshToken.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/token.js";
import User from "../models/user.model.js";

export const signup=asyncHandler(async(req,res)=>{
    const {name,userName,email,password}=req.body;
    const {user,accessToken,refreshToken}=await signUpService({name,userName,email,password});
    
    await RefreshToken.deleteMany({userId: user._id});

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        device: req.headers["user-agent"] || "unknown",
        ip: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken",refreshToken,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json(
        new ApiResponse(201,{user: {_id: user._id, name: user.name, email: user.email, userName: user.userName}, accessToken},"User registered successfully")
    )
});

export const login=asyncHandler(async(req,res)=>{
  const {email,password}=req.body;
  const {user,accessToken,refreshToken}=await loginService({email,password});

    await RefreshToken.deleteMany({userId: user._id});

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        device: req.headers["user-agent"] || "unknown",
        ip: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken",refreshToken,{
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7*24*60*60*1000
    });
    return res.status(200).json(
        new ApiResponse(200,{user: {_id: user._id, name: user.name, email: user.email, userName: user.userName}, accessToken},"User logged in successfully")
    )
});

export const logout=asyncHandler(async(req,res)=>{
    const refreshToken=req.cookies.refreshToken;
    console.log("Logout request received. Refresh token:", refreshToken);
    if(refreshToken){
        await RefreshToken.deleteOne({token: refreshToken});
        res.clearCookie("refreshToken");
        return res.status(200).json(new ApiResponse(200,null,"User logged out successfully"));
    }
});

export const refreshToken=asyncHandler(async(req,res)=>{
    const oldRefreshToken=req.cookies.refreshToken;
    console.log("oldRefreshToken",oldRefreshToken)
    if(!oldRefreshToken){
        return res.status(401).json(new ApiResponse(401,null,"No refresh token provided"));
    }
    let decoded;
    try {
        decoded=jwt.verify(oldRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        return res.status(401).json(new ApiResponse(401,null,"Invalid refresh token"));
    }
    console.log(decoded);
    const storedToken=await RefreshToken.findOne({token: oldRefreshToken});
    if(!storedToken){
        return res.status(401).json(new ApiResponse(401,null,"Refresh token not found"));
    }
    const userId=decoded.userId;
    const user=await User.findOne({_id: userId});
    console.log("User found for refresh token:", user);
    if(!user){
        return res.status(401).json(new ApiResponse(401,null,"User not found"));
    }
    const newAccessToken=generateToken(user._id,"access");
    console.log("newAccessToken",newAccessToken);  
    return res.status(200).json(new ApiResponse(200,{accessToken: newAccessToken, 
        user: {_id: user._id, name: user.name, email: user.email, userName: user.userName, profileImg: user.profileImg, bio: user.bio, profession: user.profession, gender: user.gender,}
    }, "Access token refreshed successfully"));
})