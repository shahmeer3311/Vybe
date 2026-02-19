import jwt from "jsonwebtoken";

export const isAuth=(req,res,next)=>{
    try {
        const authHeader=req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({message: "Authorization token missing"});
        }
        const token=authHeader.split(" ")[1];
        // Verify using the same secret that was used to sign access tokens
        const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        req.userId=decoded.userId;
        console.log("User is Authenticated, userId:", req.userId);
        next();
    } catch (error) {
        return res.status(401).json({message: "Invalid or expired token"});
    }
}