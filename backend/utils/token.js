import jwt from "jsonwebtoken";

export const generateToken=(userId,type)=>{
    const secret=type==="access"?process.env.ACCESS_TOKEN_SECRET:process.env.REFRESH_TOKEN_SECRET;
    const expiresIn=type==="access"?"15m":"7d";
    return jwt.sign({userId},secret,{expiresIn});
}