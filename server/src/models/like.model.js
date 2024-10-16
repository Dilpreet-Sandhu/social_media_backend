import {model, Schema} from "mongoose";


const likeSchema = new Schema({
    type : {
        type : String,
        enum : ["post","comment"]
    },
    postId : {
        type : Schema.Types.ObjectId,
        ref : "Post"
    },
    commentId : {
        type : Schema.Types.ObjectId,
        ref : "Comment"
    },
    likedBy : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : [true,"this field is required"]
    }
});


export const Like = model("Like",likeSchema);