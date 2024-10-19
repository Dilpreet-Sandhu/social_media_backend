import {Schema,model} from 'mongoose';


const messageSchema = new Schema({
    content : {
        type : String,
    },
    sender : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    chatId : {
        type : Schema.Types.ObjectId,
        ref : "Chat"
    },
    attachments : [
        {
            url :{
                type : String,
            }
        }
    ]
},{timestamps : true});


export const Message = model("Message",messageSchema);