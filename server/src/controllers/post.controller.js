import {ApiError,ApiResponse} from '../utils/apiHandler.js'
import { uploadToCloudinary } from '../utils/cloudinary.js';
import {Post} from '../models/post.model.js';
import {SavedPosts} from '../models/savedPost.model.js';

export async function createPost(req,res) {
    try {

        const {title,description} = req.body;

        const filepath = req?.file?.path;

        if (!title || !description || !filepath) {
            return res.status(400).json(new ApiResponse(false,"title and description are required"));
        }

        const file = await uploadToCloudinary(filepath);

        const post = await Post.create({
            title,
            description,
            url : file.url,
            owner : req.user._id,
            likesCount :0,
            commentCount : 0,
            postPublicId : file.public_id,
        });

        if (!post) {
            return res.status(400).json(new ApiResponse(false,"couldn't create post"))
        }
        
        return res.status(200).json(new ApiResponse(true,"post created sucessfully"));
        
    } catch (error) {
        console.log("errro while creating post: ",error);
        return res.status(500).json(new ApiError(500,false,"error while creating post"));
    }
}

export async function updatePost(req,res) {
    try {

        const {postId} = req.params;
        const {title,description} = req.body;

        if (!postId) {
            return res.status(400).json(new ApiResponse(false,"please provide post id"));
        }

        const post = await Post.findByIdAndUpdate(postId,{
            title,
            description,
        });

        if (!post) {
            return res.status(500).json(new ApiResponse(false,"couldn't updated post"))
        }

        return res.status(200).json(new ApiResponse(true,"post updated sucesfully"))
        
    } catch (error) {
        console.log("error while updating post: ",error);
        return res.status(500).json(new ApiResponse(false,"couldn't update post"));
    }
}

export async function getUserPosts(req,res) {
    try {

        const userId = req.user._id;

        if (!userId) {
            return res.status(400).json(new ApiResponse(400,"you are not logged in"));
        }

        const posts = await Post.find({owner : userId});

        if (!posts) {
            return res.status(200).json(new ApiResponse(true,"you haven't uploaded any post yet"))
        }

        return res.status(200).json(new ApiResponse(true,"fetched user's posts sucessfully",posts));

        
    } catch (error) {
        console.log("erro while fetching user's posts",error);
        return res.status(500).json(new ApiResponse(false,"couldn't fetch user's posts"));
    }
}



export async function savePost(req,res) {

    try {

        const {postId} = req.body;

        if (!postId) {
            return res.status(400).json(new ApiResponse(false,"no post id found"));
        }

        const savedPosts = await SavedPosts.findOne({user : req.user._id});

        if (!savedPosts) {
            const newSavedPosts = await SavedPosts.create({
                user : req.user._id,
                posts : [postId]
            });

            if (!newSavedPosts) return res.status(500).json(new ApiResponse(false,"couldn't save post"));

            return res.status(200).json(new ApiResponse(true,"saved post sucessfully"));
        }

        savedPosts.posts.push(postId);
        await savedPosts.save({validateBeforeSave : false});

        return res.status(200).json(new ApiResponse(true,"saved post sucessfully"))
        
    } catch (error) {
        console.log("error while saving post",error);
        return res.status(500).json(new ApiResponse(false,"error while saving post"));
    }

}


export async function getSavedPosts(req,res) {
    try {

        const userId = req.user._id;

        if (!userId) {
            return res.status(400).json(new ApiResponse(false,"you are not logged in"));
        }

        const savedPosts = await SavedPosts.findOne({user : userId}).populate("posts");

        if (!savedPosts) {
            return res.status(200).json(new ApiResponse(true,"you have not saved any post"));
        }

        return res.status(200).json(new ApiResponse(true,"fetched saved posts succesfully",savedPosts));
        
    } catch (error) {
        console.log("erro while getting saved posts: ",error);
        return res.status(500).json(new ApiResponse(false,"error while getting saved posts"));
    }
}


export async function removeSavedPost(req,res) {
    try {

        const {postId} = req.body;

        if (!postId) {
        return res.status(400).json(new ApiResponse(false,"please provide the post id"));
        }

        const savedPost = await SavedPosts.findOne({user:req.user._id});

        if (savedPost.posts.includes(postId)) {
            savedPost.posts = savedPost.posts.filter((id) => id.toString() !== postId.toString());
            await savedPost.save({validateBeforeSave : false});
        return res.status(200).json(new ApiResponse(true,"sucessfully removed post from saved list"));
        }

        return res.status(200).json(new ApiResponse(false,"post is not in your saved list"));

        
        
    } catch (error) {
        console.log("error while removing the post from saved posts: ",error);
        return res.status(500).json(new ApiResponse(false,"error while removing the post from saved posts"));

    }
}