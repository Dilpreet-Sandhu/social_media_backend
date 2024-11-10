import { ApiResponse } from "../utils/apiHandler.js";
import {CommentModel} from '../models/comment.model.js';


export async function createComment(req,res) {
    try {

        const {content,postId,commentId,type} = req.body;

        if (!content ) {
            return res.status(400).json(new ApiResponse(false,"content  is required"));
        }

        const comment = await CommentModel.create({
            content,
            postId,
            type,
            commentId,
            commentedBy : req.user._id,
        });

        if (!comment) {
            return res.status(400).json(new ApiResponse(false,"couldn't create comment"));
        }

        return res.status(200).json(new ApiResponse(true,"commented sucesfully"));
        
    } catch (error) {
        console.log("error while creating comment: ",error);
        return res.status(500).json(new ApiResponse(false,"error while creating comment"));
    }
}


export async function getCommentsOnPost(req,res) {
    try {

        const {postId} = req.params;
        
        if (!postId) {
            return res.status(400).json(new ApiResponse(false,"no post id found"));
        }

        const comment = await CommentModel.find({postId,type:"post"}).populate("commentedBy","username avatar");

        

        if (!comment) {
            return res.status(400).json(new ApiResponse(400,"no comments found on the given post"));
        }

        return res.status(200).json(new ApiResponse(true,"fetched comments successfully",comment));

        
    } catch (error) {
        console.log('erorr while fetching comments on a post: ',error);
        return res.status(500).json(new ApiResponse(false,"error while fetching comments on a post"));
    }
}

export async function getCommentOnACommnet(req,res) {
    try {
        
        const {userId,postId} =  req.body;

        if (!userId || !postId) {
            return res.status(400).json(new ApiResponse(false,"no user id found"));
        }

        const comments = await CommentModel.find({type : "comment",commentId:userId,postId}).populate("commentedBy","avatar username");

        if (!comments) {
            return res.status(500).json(new ApiResponse(false,"no comments found for the user"));
        }

        return res.status(200).json(new ApiResponse(true,"fetched comments successfully",comments));
        
    } catch (error) {
        console.log("error while fetching comments: ",error);
        return res.status(500).json(new ApiResponse(false,"error while fetching comments"));
    }
}


export async function EditComment(req,res) {

    try {

        const {commentId,content} = req.body;

        if (!commentId) {
        return res.status(500).json(new ApiResponse(false,"comment id is required"));
        }
        const comment = await CommentModel.findById(commentId);

        if (comment.commentedBy.toString() !== req.user._id.toString()) {
            return res.status(400).json(new ApiResponse(false,"you cannot edit this comment"));
        }

        comment.content = content;
        await comment.save({validateBeforeSave: false});

        return res.status(200).json(new ApiResponse(true,"sucessfully edited the comment"));
        
    } catch (error) {
        console.log("error while editing a comment: ",error);
        return res.status(500).json(new ApiResponse(false,"error while editing a comment"));
    }
}


