import { Story } from '../models/story.model.js';
import {ApiResponse} from '../utils/apiHandler.js';
import {uploadToCloudinary} from '../utils/cloudinary.js';
import { getFileType } from '../utils/getFileType.js';
import {getVideoDurationInSeconds} from 'get-video-duration';
import {getUserStories, useGetFollowingStories} from './aggregations.js';
import {emitEvent} from '../socket/socket.js';
import { NEW_STORY, NEW_STORY_USER } from '../constants/constants.js';

export async function createStoy(req,res) {

    try {

        const filePath = req?.file?.path;
       

        if (!filePath) {
            return res.status(400).json(new ApiResponse(false,"can't find file path"));
        }

        const fileType = getFileType(filePath);

        let duration;

        if (fileType == "video") {
            duration = await getVideoDurationInSeconds(filePath);
        }
        
        const contentUrl = await uploadToCloudinary(filePath);

        const newStory = await Story.create({
            contentUrl : contentUrl.url,
            owner : req.user?._id,
            views : [],
            likedBy : [],
            publicId  :contentUrl.public_id,
            duration : duration ? duration * 1000 : 4000,
            type : fileType,
        });

        const storyForSocket = {
            _id : newStory._id,
            user : {
                _id : req.user?._id,
                username : req.user?.username,
                avatar : req.user?.avatar,
            },
            stories : [{
                contentUrl : newStory.contentUrl,
                duration : newStory.duration,
                type : newStory.type
            }]
        }

        const userUploadedStory = {
            _id : req.user?._id,
            username : req.user?.username,
            avatar : req.user?.avatar
        }

        if (!newStory) {
            return res.status(400).json(new ApiResponse(false,"couldn't create story"));
        }
        // emitEvent(req,NEW_STORY_USER,req.user?.followers,userUploadedStory);
        // emitEvent(req,NEW_STORY,req.users?.followers,storyForSocket);

        return res.status(200).json(new ApiResponse(true,"created story sucesfully"));

        
    } catch (error) {
        console.log("erorr while creating new story",error);
    }
}

export async function fetchMyStories(req,res) {


    try {

        const {userId} = req.params;

  

        const stories = await getUserStories(userId);


        if (!stories) {
            return res.status(200).json(new ApiResponse(true,"you have posted no stories"));
        }

        return res.status(200).json(new ApiResponse(true,"fetched stories succesfully",stories[0]));
        
    } catch (error) {
        console.log("error while fetching my stories ",error);
        return res.status(500).json(new ApiResponse(false,"some error occured while fetching stories"));
    }

}


export async function checkHasStories(req,res) {
    try {

        const userId = req.user?._id;

        const hasStories = await Story.findOne({owner : userId});

        if (hasStories) {
            return res.status(200).json(new ApiResponse(true,"user has stories",{stories : true}))
        }else {
            return res.status(200).json(new ApiResponse(true,"user has stories",{stories : false}))
            
        }
        
    } catch (err) {
        console.log('errrow while fetching has stories',err);
        return res.status(500).json(new ApiResponse(false,"error while fetching has stories"));
    }
}

export async function getFollowingStories(req,res) {

    try {

        const userFollowing = req.user?.following;

        const stories = await useGetFollowingStories(userFollowing);

      
        return res.status(200).json(new ApiResponse(true,"fetched stories succesfujlly",stories));
        
    } catch (error) {
        console.log("error while fetching user following stories",error);
        return res.status(500).json(new ApiResponse(false,"error while fetching user following stories"));
    }
}


export async function userHavingStories(req,res) {

    try {

        const userFollowing = req?.user?.following;

        const stories = await Story.aggregate([
            {
                $match : {
                    owner : {

                        $in : userFollowing
                    }
                }
            },
            {
                $lookup : {
                    from : "users",
                    localField : "owner",
                    foreignField : "_id",
                    as : "userInfo"
                }
            },
            {
                $unwind : "$userInfo"
            },{
                $group : {
                    _id : "$owner",
                    username : {$first : "$userInfo.username"},
                    avatar : {$first : "$userInfo.avatar"}
                }
            },
            {
                $project : {
                    _id : 1,
                    username : 1,
                    avatar : 1,
                }
            }
        ]);

      

        return res.status(200).json(new ApiResponse(true,"fetched userinfo succesfully",stories));

        
    } catch (error) {
        console.log('error while getting info of users having stories',error);
        return res.status(500).json(new ApiResponse(false,"error while getting user"));
    }
}