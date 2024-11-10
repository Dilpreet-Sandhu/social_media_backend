import mongoose,{model, Schema} from 'mongoose';


const postSchema = new Schema({
    url  :{
        type : String,
        required : [true,"url of post is required"]
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : [true,"owner id is required"]
    },
    likesCount : {
        type : Number,
    },
    type : {
        type : String,
        enum : ["video","image"]
    },
    commentCount : {
        type :Number
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String
    },
    postPublicId : {
        type :String
    },
    tags : [
        {
            type : String,
        }
    ]
},{timestamps : true});


export const Post = model("Post",postSchema);