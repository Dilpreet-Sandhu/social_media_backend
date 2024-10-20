import {v2 as cloudinary} from 'cloudinary';
import { ApiError } from './apiHandler.js';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: 'dbwjxpydg', 
    api_key: '883758154927837', 
    api_secret: process.env.CLOUDINARY_API_SECRET || "CuW8x_9SVM6uIFxtnaPhErlljZs" // Click 'View API Keys' above to copy your API secret
})

export async function uploadToCloudinary(filePath) {
    try {

        const upload = await cloudinary.uploader.upload(filePath,{
            resource_type : "auto"
        });

        if (!upload) {
            throw new ApiError(400,"couldn't upload to cloudinary");
        }

        fs.unlink(filePath,(err) => {if (err)console.log(err)});
        return upload;
        
        
    } catch (error) {
        fs.unlink(filePath);
        console.log("error while uploading to cloudinary: ",error);
    }
}

export async function deleteFromCloudinary(publicId) {
    try {

        const deletedFile = await cloudinary.uploader.destroy(publicId);

        if (!deletedFile) {
            throw new Error("couldn't delete the error")
        }

        
        
    } catch (error) {
        console.log("error while deleting file from cloudinary; ",error);
    }
}


export async function uploadMultipleFiles(files) {

    const urls = [];
    
    new Promise((resolve,reject) => {
        files.map(async (file) => {
            const url = await uploadToCloudinary(file);
            urls.push(url);
        })
        resolve(urls);
    })

    return urls;
}