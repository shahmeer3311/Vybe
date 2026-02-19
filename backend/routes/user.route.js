import express from "express";
import { EditProfile, getUserById, followOrUnfollowUserController, getSuggestedUsers, getFollowingList } from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.get("/suggested", isAuth, getSuggestedUsers);
userRouter.get("/following", isAuth, getFollowingList);

userRouter.get("/:userId", isAuth, getUserById);

userRouter.post("/edit", isAuth, EditProfile);
userRouter.post("/follow/:targetUserId", isAuth, followOrUnfollowUserController);

export default userRouter;