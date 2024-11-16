import { ApiResponse } from "../utils/apiHandler.js";
import {Like} from '../models/like.model.js';
import { Post } from "../models/post.model.js";
import { CommentModel } from "../models/comment.model.js";
import {NotificationModel} from '../models/notification.model.js';

export async function likePost(req,res) {
    try {

        const {postId} = req.body;

        if(!postId) {
            return res.status(400).json(new ApiResponse(false,"post id is required"));
        }
        
        const like = await Like.findOne({type : "post",postId,likedBy : req.user._id});
        const post = await Post.findById(postId);

        if (like) {
            await Like.deleteOne({type : "post",postId,likedBy:req.user._id});
            if (post.likesCount > 0) {
                post.likesCount--;
                await post.save({validateBeforeSave : false});
            }
            return res.status(200).json(new ApiResponse(true,"sucesfully disLiked the post"));
        }else{

            const newLike = await Like.create({
                type : "post",
                postId,
                likedBy : req.user._id,
            });

             post.likesCount++;
            await post.save({validateBeforeSave : false});

            const newNotification = await NotificationModel.create({
                title : `${req.user.username} liked your post`,
                description : `your post have been liked ${post.likesCount}`,
                sender : req.user._id,
                reciever : post.owner,
                type : "like"
            });
    
            if (!newLike) { 
                return res.status(500).json(new ApiResponse(false,"couldn't like the post"));
            }
            
            return res.status(200).json(new ApiResponse(true,"sucesfully liked the post"));
        }

        
    } catch (error) {
        console.log('error while liking the post: ',error);
        return res.status(400).json(new ApiResponse(false,"error while liking the post"));
    }
}

 

export async function likeComment(req,res) {
    try {

        const {commentId,postId} = req.body;

        if (!commentId) {
            return res.status(400).json(new ApiResponse(false,"no comment id found"));
        }

        const like = await Like.findOne({type : "comment",commentId,likedBy : req.user._id});
        const comment = await CommentModel.findById(commentId);

        if (like) {
            await Like.deleteOne({type : "comment",commentId,likedBy:req.user._id,postId});
            if (comment.likesCount > 0) {
                comment.likesCount--;
                await comment.save({validateBeforeSave : false});
            }
            return res.status(200).json(new ApiResponse(true,"sucesfully disLiked the comment"));
        }else{

            const newLike = await Like.create({
                type : "comment",
                postId,
                likedBy : req.user._id,
            });

           await NotificationModel.create({
                title  : `${req.user.username} liked your comment`,
                reciever : comment.commentedBy,
                sender : req.user._id,
                type : "like"
            });

             comment.likesCount++;
            await comment.save({validateBeforeSave : false});
    
            if (!newLike) { 
                return res.status(500).json(new ApiResponse(false,"couldn't like the comment"));
            }
            
            return res.status(200).json(new ApiResponse(true,"sucesfully liked the comment"));
        }


        
    } catch (error) {
        console.log("error while liking a comment",error);
        return res.status(500).json(new ApiResponse(false,"couldn't like a comment"));
    }
}

export async function getAllUsersWhoLikedaPost(req,res) {
    try {

        const {postId} = req.body;

        const likes = await Like.find({postId}).populate("likedBy","username avatar");


        if (!likes) {
            return res.status(400).json(new ApiResponse(false,"no users found"));
        }

        return res.status(200).json(new ApiResponse(true,"fetched users successfully",likes));

        
    } catch (error) {
        console.log("error while getting users: ",error);
        return res.status(500).json(new ApiResponse(false,"error while getting users"));
    }
}

export async function getAllLikedPostsId(req,res) {

    try {

        const userId = req.user?._id;

        const likedPosts = await Like.find({likedBy : userId,type : "post"}).populate("postId","_id");

        const likedPostIds = likedPosts.map(({postId}) => postId?._id);

        return res.status(200).json(new ApiResponse(true,"fetched liked posts",likedPostIds));
        
    } catch (error) {
        console.log('error while fetching liked posts id',error);

        return res.status(500).json(new ApiResponse(false,"error while fetching liked posts id"));
    }
    
}