import express from 'express';
import { getGroupById } from '../controllers/convo.controller.js';
import { isAuth } from '../middlewares/auth.js';
import { findOrCreateConversationWithUser,getUserConversations } from '../controllers/convo.controller.js';

const convoRouter = express.Router();

convoRouter.get("/user",isAuth, getUserConversations);
convoRouter.get('/group/:groupId',isAuth, getGroupById);
convoRouter.post("/user/:receiverId",isAuth, findOrCreateConversationWithUser);

export default convoRouter;