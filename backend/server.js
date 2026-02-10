import express from "express";
import authRouter from "./routes/auth.route.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cookieParser());

app.use(express.json());
app.use("/api/auth",authRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});