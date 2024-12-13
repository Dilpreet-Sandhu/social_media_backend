import mongoose from 'mongoose';
import {Story} from '../models/story.model.js';

export const getUserStories  = async (userId) => {

    const stories = await Story.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        }
        ,
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
        }
        ,
        {
            $group : {
                _id : "$owner",
                user : {
                    $first : {
                        _id : "$userInfo._id",
                        username : "$userInfo.username",
                        avatar : "$userInfo.avatar"
                    }
                },
                stories : {
                    $push :{
                        contentUrl : "$contentUrl",
                        duration : "$duration",
                        type : "$type"
                    }
                }
            }
        }
        ,
        {
            $project : {
                _id : 1,
                user : 1,
                stories : 1,

            }
        }
    ]);

    return stories;
}
export const useGetFollowingStories  = async (ids) => {

    const stories = await Story.aggregate([
        {
            $match : {
                owner : {
                    $in : ids
                }
            }
        }
        ,
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
        }
        ,
        {
            $group : {
                _id : "$owner",
                user : {
                    $first : {
                        _id : "$userInfo._id",
                        username : "$userInfo.username",
                        avatar : "$userInfo.avatar"
                    }
                },
                stories : {
                    $push :{
                        contentUrl : "$contentUrl",
                        duration : "$duration",
                        type : "$type"
                    }
                }
            }
        }
        ,
        {
            $project : {
                _id : 1,
                user : 1,
                stories : 1,

            }
        }
    ]);

    return stories;
}