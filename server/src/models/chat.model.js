import {Schema,model} from 'mongoose';



const chatSchema = new Schema({
    members : [
        {
            type : Schema.Types.ObjectId,
            ref :"User"
        }
    ],
    creator : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    isApproved : {
        type : Boolean,
    },
    groupChat : {
        type : Boolean
    },
    name : {
        type :String,
    }
},{timestamps :true});


export const Chat = model("Chat",chatSchema);