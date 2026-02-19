import express from "express";
import authRouter from "./routes/auth.route.js";
import postRouter from "./routes/post.route.js";
import userRouter from "./routes/user.route.js";
import imagekitRouter from "./routes/imagekit.route.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.js";
import { initSocket } from "./socketio.js";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5174",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/users", userRouter);
app.use("/api/imagekit", imagekitRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server=initSocket(app);

server.listen(PORT,()=>{
    connectDB();
    console.log(`Server and SocketIO is running on port ${PORT}`);
});