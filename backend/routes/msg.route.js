import express from 'express';
import { getMessages, sendMessage } from '../controllers/msg.controller.js';
import { isAuth } from '../middlewares/auth.js';

const msgRouter = express.Router();

// Send a message (user or group)
msgRouter.post('/:receiverId', isAuth, sendMessage);

// Get messages for a conversation
msgRouter.get('/:conversationId', isAuth, getMessages);

export default msgRouter;