import express from 'express';
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';
export const app = express();


dotenv.config();
app.use(express.json());
app.use(cookieParser());



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