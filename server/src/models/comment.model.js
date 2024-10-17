import {Schema,model} from 'mongoose';


const commentSchema = new Schema({
    type : {
        type : String,
        enum : ["post","comment"]
    },
    postId  :{
        type : Schema.Types.ObjectId,
        ref : "Post"
    },
    commentId : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    content : {
        type : String,
        required : [true,"contnet is required"]
    },
    commentedBy  :{
        type : Schema.Types.ObjectId,
        ref : "User",
        required : [true,"this field is required"]
    },
    likesCount : {
        type : Number,
    }
},{timestamps : true});


export const CommentModel = model("CommentModel",commentSchema);