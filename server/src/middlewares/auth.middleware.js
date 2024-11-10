import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiHandler.js";
import jwt from 'jsonwebtoken';

export async function verfiyJWT(req,res,next) {
    try {

        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ","");

   

        if (!token) {
            return res.status(200).json(new ApiError(400,false,"no token found"));
        }

        const decodedToken = jwt.verify(token,process.env.TOKEN_SECRET_KEY);

        if (!decodedToken) {
            return res.status(500).json(new ApiError(500,false,"couldn't decode token"));
        }

        const user = await User.findById(decodedToken._id);

        if (!user) {
            return res.status(500).json(new ApiError(500,false,"no user found"));
        }

        req.user = user;
        next();
        
    } catch (error) {
        console.log("error while running auth middleware: ",error);
        throw new Error(error);
    }
}