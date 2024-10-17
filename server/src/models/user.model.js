import mongoose, { model, Schema } from "mongoose";
import jwt from 'jsonwebtoken';


const userSchema = new Schema({
    username : {
        type : String,
        required : [true,"username is required"],
        unique: true,
    },
    email : {
        type : String,
        required : [true,"email is required"]
    },
    password : {
        type : String,
        required : [true,"password is required"]
    },
    avatar : {
        type : String,
    },
    followers : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    following : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    blockedUsers : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    avatarPublicId : {
        type : String,
    },
    isPrivate : {
        type : Boolean,
        deafult : false
    },
    tags : [
        {
            type : String
        }
    ]
},{timestamps : true});


userSchema.methods.generateToken = function() {

    return jwt.sign({
        _id : this._id,
        username : this.username,
    },process.env.TOKEN_SECRET_KEY,{
        expiresIn : "10d"
    })

};

export const User = model("User",userSchema);