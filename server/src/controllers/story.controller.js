import { Story } from '../models/story.model.js';
import {ApiResponse} from '../utils/apiHandler.js';
import {uploadToCloudinary} from '../utils/cloudinary.js';

export async function createStoy(req,res) {

    try {

        const filePath = req?.file?.path;
        console.log(filePath);

        if (!filePath) {
            return res.status(400).json(new ApiResponse(false,"can't find file path"));
        }

        const contentUrl = await uploadToCloudinary(filePath);

        const newStory = Story.create({
            contentUrl : contentUrl.url,
            owner : req.user?._id,
            views : [],
            likedBy : [],
            publicId  :contentUrl.public_id
        });

        if (!newStory) {
            return res.status(400).json(new ApiResponse(false,"couldn't create story"));
        }

        return res.status(200).json(new ApiResponse(true,"created story sucesfully",newStory));

        
    } catch (error) {
        console.log("erorr while creating new story",error);
    }
}