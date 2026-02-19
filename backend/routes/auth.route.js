import express from 'express';
import { login, signup, logout, refreshToken } from '../controllers/auth.controller.js';

const authRouter=express.Router();

authRouter.post("/signup",signup);
authRouter.post("/login",login);
authRouter.post("/logout",logout);
authRouter.get("/refresh",refreshToken);

export default authRouter;