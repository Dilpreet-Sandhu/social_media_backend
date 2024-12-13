import {Schema,model} from 'mongoose';

const storySchema = new Schema({
    contentUrl : {
        type : String,
        required : true
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    views : [
        {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    likedBy : [{
        type : Schema.Types.ObjectId,
        ref : "User"
    }],
    publicId : String,
    createdAt : {
        type : Date,
        default : Date.now(),
        expires : "24h"
    },
    duration : {
        type : Number,
    },
    type : {
        type : String,
        enum : ["video","image"]
    }
},{timestamps : true});


export const Story = model("Story",storySchema);