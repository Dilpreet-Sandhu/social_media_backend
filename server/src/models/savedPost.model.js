import {Schema,model} from 'mongoose';


const savedPostSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    posts : [
        {
            type  : Schema.Types.ObjectId,
            ref :"Post"
        }
    ]
},{timestamps : true});

export const SavedPosts = model("SavedPosts",savedPostSchema);