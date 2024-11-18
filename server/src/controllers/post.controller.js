import { ApiError, ApiResponse } from "../utils/apiHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import { SavedPosts } from "../models/savedPost.model.js";
import { Like } from "../models/like.model.js";
import { CommentModel } from "../models/comment.model.js";

export async function createPost(req, res) {
  try {
    const { title, description, tags,type } = req.body;

    const filepath = req?.file?.path;

    if (!title || !description || !filepath) {
      return res
        .status(400)
        .json(new ApiResponse(false, "title and description are required"));
    }

    const file = await uploadToCloudinary(filepath);

    const post = await Post.create({
      title,
      description,
      url: file.url,
      owner: req.user._id,
      likesCount: 0,
      commentCount: 0,
      postPublicId: file.public_id,
      tags,
      type
    });

    if (!post) {
      return res
        .status(400)
        .json(new ApiResponse(false, "couldn't create post"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "post created sucessfully"));
  } catch (error) {
    console.log("errro while creating post: ", error);
    return res
      .status(500)
      .json(new ApiError(500, false, "error while creating post"));
  }
}

export async function updatePost(req, res) {
  try {
    const { postId } = req.params;
    const { title, description } = req.body;

    if (!postId) {
      return res
        .status(400)
        .json(new ApiResponse(false, "please provide post id"));
    }

    const post = await Post.findByIdAndUpdate(postId, {
      title,
      description,
    });

    if (!post) {
      return res
        .status(500)
        .json(new ApiResponse(false, "couldn't updated post"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "post updated sucesfully"));
  } catch (error) {
    console.log("error while updating post: ", error);
    return res.status(500).json(new ApiResponse(false, "couldn't update post"));
  }
}

export async function getUserPosts(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json(new ApiResponse(400, "you are not logged in"));
    }

    const posts = await Post.find({ owner: userId });

    if (!posts) {
      return res
        .status(200)
        .json(new ApiResponse(true, "you haven't uploaded any post yet"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "fetched user's posts sucessfully", posts));
  } catch (error) {
    console.log("erro while fetching user's posts", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "couldn't fetch user's posts"));
  }
}

export async function getSinglePost(req, res) {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate(
      "owner",
      "username avatar"
    );

    const comments = await CommentModel.find({ type: "post", postId }).populate(
      "commentedBy",
      "username avatar"
    );

    if (!post) {
      return res.status(400).json(new ApiResponse(false, "no post found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(true, "post fetched succesfully", { post, comments })
      );
  } catch (error) {
    console.log("error while getting post ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while getting post"));
  }
}

export async function savePost(req, res) {
  try {
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json(new ApiResponse(false, "no post id found"));
    }

    const savedPosts = await SavedPosts.findOne({ user: req.user._id });

    if (!savedPosts) {
      const newSavedPosts = await SavedPosts.create({
        user: req.user._id,
        posts: [postId],
      });

      if (!newSavedPosts)
        return res
          .status(500)
          .json(new ApiResponse(false, "couldn't save post"));

      return res
        .status(200)
        .json(new ApiResponse(true, "saved post sucessfully"));
    }

    if (savedPosts.posts.includes(postId)) {
      savedPosts.posts = savedPosts.posts.filter(
        (id) => id.toString() !== postId.toString()
      );

      await savedPosts.save({ validateBeforeSave: false });
      return res
        .status(200)
        .json(new ApiResponse(false, "unsaved post successfully"));
    } else {
      savedPosts.posts.push(postId);
      await savedPosts.save({ validateBeforeSave: false });
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "saved post sucessfully"));
  } catch (error) {
    console.log("error while saving post", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while saving post"));
  }
}

export async function getSavedPosts(req, res) {
  try {
    const savedPosts = await SavedPosts.findOne({
      user: req.user._id,
    }).populate("posts");

    if (!savedPosts) {
      return res
        .status(200)
        .json(new ApiResponse(true, "you have not saved any post"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(true, "fetched saved posts succesfully", savedPosts)
      );
  } catch (error) {
    console.log("erro while getting saved posts: ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while getting saved posts"));
  }
}

export async function getSavedPostsIds(req, res) {
  try {
    const userId = req?.user?._id;

    const savedPosts = await SavedPosts.findOne({ user: userId });

    const savedPostids = savedPosts.posts.length > 0 && savedPosts.posts.map((id) => id);

    return res
      .status(200)
      .json(new ApiResponse(true, "fetched saved posts ids ", savedPostids));
  } catch (error) {
    console.log("error while getting saved posts", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while getting saved posts"));
  }
}

export async function removeSavedPost(req, res) {
  try {
    const { postId } = req.body;

    if (!postId) {
      return res
        .status(400)
        .json(new ApiResponse(false, "please provide the post id"));
    }

    const savedPost = await SavedPosts.findOne({ user: req.user._id });

    if (savedPost.posts.includes(postId)) {
      savedPost.posts = savedPost.posts.filter(
        (id) => id.toString() !== postId.toString()
      );
      await savedPost.save({ validateBeforeSave: false });
      return res
        .status(200)
        .json(
          new ApiResponse(true, "sucessfully removed post from saved list")
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(false, "post is not in your saved list"));
  } catch (error) {
    console.log("error while removing the post from saved posts: ", error);
    return res
      .status(500)
      .json(
        new ApiResponse(false, "error while removing the post from saved posts")
      );
  }
}

export async function getUserFeed(req, res) {
  try {
    const userId = req.user._id;

    //get posts based on user following list
    const followingPosts = await Post.find({
      owner: { $in: req.user.following },
    })
      .populate("owner", "username avatar")
      .limit(10);

    //based on user interests
    const userReleventPosts = await Post.find({ tags: { $in: req.user.tags } })
      .populate("onwer", "username avatar")
      .limit(10);

    //get posts that user liked
    const likedPosts = await Like.find({ likedBy: userId }, { postId: 1 })
      .populate({
        path: "postId",
        populate: {
          path: "owner",
          model: "User",
        },
      })
      .limit(10);

    //get posts that are most liked
    const mostLikedPosts = await Post.find()
      .sort({ likesCount: -1 })
      .populate("owner", "username avatar")
      .limit(10);

 
   

    const formateedLikesPosts = likedPosts.length > 0 && likedPosts?.map(({ postId }) => {
      return {
        _id: postId._id,
        commentCount: postId.commentCount,
        description: postId.description,
        likesCount: postId.likesCount,
        owner: postId.owner,
        postPublicId: postId.postPublicId,
        tags: postId.tags,
        title: postId.title,
        updatedAt: postId.updatedAt,
        url: postId.url,
      
      };
    });


    const postMap = new Map();

    followingPosts?.forEach((post) => {
      postMap.set(post?._id?.toString(), post);
    });

    userReleventPosts?.forEach((post) => {
      postMap.set(post?._id?.toString(), post);
    });

    formateedLikesPosts.length > 0 && formateedLikesPosts?.forEach((post) => {
      postMap.set(post?._id?.toString(), post);
    });

    mostLikedPosts?.forEach((post) => {
      postMap.set(post?._id?.toString(), post);
    });

    const combinedFeed = Array.from(postMap?.values());



    if (!combinedFeed) {
      return res
        .status(500)
        .json(
          new ApiResponse(
            false,
            "some error occured during fetching combined feed"
          )
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(true, "fetched user's feed succesfully", combinedFeed)
      );
  } catch (error) {
    console.log("error while getting user's feed:  ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while getting user's feed"));
  }
}

export async function getExploreFeed(req, res) {
  try {
    const userReleventPosts = await Post.find({ tags: { $in: req.user.tags } });

    const posts = await Post.find().sort({ likesCount: -1 });

    const postMap = new Map();

    userReleventPosts.forEach((post) => {
      postMap.set(post._id.toString(), post);
    });

    posts.forEach((post) => {
      postMap.set(post._id.toString(), post);
    });

    const combindedPost = Array.from(postMap.values());

    if (!combindedPost) {
      return res
        .status(500)
        .json(
          new ApiResponse(false, "some error occured during fetching posts")
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(true, "fetched explore feed succesfully", combindedPost)
      );
  } catch (error) {
    console.log("error while getting explore field: ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while getting explore field"));
  }
}



export async function getExplorePagePosts(req,res) {

  try {

    const posts = await Post.find({},{url : 1,likesCount : 1,commentCount : 1});

    return res.status(200).json(new ApiResponse(true,'fetched explore page feed succesfully',posts));
    
  } catch (error) {
    console.log("error while getting posts of explore page: ",error);

    return res.status(500).json(new ApiResponse(false,"error while getting posts of explore page"));
  }
}


export async function getReels(req,res) {
  try {

    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const reels = await Post.find({type : "video"}).populate("owner","username avatar").skip(skip).limit(limit);

    const totalDocuments = await Post.countDocuments({type : "video"});


    return res.status(200).json(new ApiResponse(true,"fetched reels sucesfully",{
      reels,
      currentPage : page,
      totalPages : Math.ceil(totalDocuments / limit),
    }))
    

    
  } catch (error) {
    console.log("error while loading reel",error);
    return res.status(500).json(new ApiResponse(false,"error while getting posts of explore page"));
  }
}