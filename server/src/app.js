import express from 'express';
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv';
import cors from 'cors';
import {createServer} from 'node:http';
import {Server} from 'socket.io';


export const app = express();
export const server = createServer(app);
export const io = new Server(server,{
    cors : {
        origin : ["http://localhost:3000","http://localhost:5173"],
        credentials : true
    },
    pingInterval : 10000,
    pingTimeout : 5000
})


dotenv.config();
app.set("io",io);
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
import { verifySocket } from './middlewares/auth.middleware.js';
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from './constants/constants.js';
import {  getMySocket, getSocket } from './utils/helper.js';
import { Message } from './models/message.model.js';

app.use("/api/users",userRouter);
app.use("/api/post",postRouter);
app.use("/api/like",likeRouter);
app.use("/api/comment",commentRouter);
app.use("/api/chat",chatRouter);






//socket io implementation

export const userSocketIds = new Map();
const onLineUsers = new Set();


io.use((socket,next) => {
    cookieParser()(socket.request,socket.request.res,async (err) => {
        return verifySocket(err,socket,next);
    })
});


io.on("connection",(socket) => {

    console.log(socket.id);
    const user = socket.user;



        userSocketIds.set(user?._id.toString(),socket.id);
    


    socket.on(NEW_MESSAGE,async ({chatId,members,message}) => {

        

        const messageForRealTime = {
            _id : crypto.randomUUID(),
            content : message,
            sender : {
                _id : user?._id,
                name : user?.username,
                avatar : user?.avatar,
            },
            attachments : [],
            chatId : chatId,
            createdAt : new Date().toISOString()
        };

        const messageForDb = {
            content : message,
            sender : user?._id,
            chatId : chatId,
            attachments : []
        };

     

        const userSockets = getSocket(members);
        const mySocket = getMySocket(user?._id);
       

        io.to(userSockets).emit(NEW_MESSAGE,{
            chatId,
            message : messageForRealTime
        });
        io.to(userSockets).except([mySocket]).emit(NEW_MESSAGE_ALERT,{chatId});

        await Message.create(messageForDb);

    })

})

