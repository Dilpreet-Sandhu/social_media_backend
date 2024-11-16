import {Schema,model} from 'mongoose';

const notificationSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String
    },
    reciever : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    sender : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    type : {
        type : String,
        enum : ["like","follow"]
    }

},{timestamps  :true});


export const NotificationModel = model("NotificationModel",notificationSchema);