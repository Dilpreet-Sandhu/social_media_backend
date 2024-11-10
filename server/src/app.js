import express from 'express';
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';
import cors from 'cors';
export const app = express();


dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin : ["http://localhost:3000","http://localhost:5173"],
    credentials : true
}));



//route imports
import {userRouter} from './routes/user.route.js';
import {postRouter} from './routes/post.route.js';
import {likeRouter} from './routes/like.route.js';
import {commentRouter} from './routes/comment.route.js';
import {chatRouter} from './routes/chat.route.js';

app.use("/api/users",userRouter);
app.use("/api/post",postRouter);
app.use("/api/like",likeRouter);
app.use("/api/comment",commentRouter);
app.use("/api/chat",chatRouter);