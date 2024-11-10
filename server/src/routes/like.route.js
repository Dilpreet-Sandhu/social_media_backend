import {Router} from 'express';
import { getAllLikedPostsId, getAllUsersWhoLikedaPost, likePost } from '../controllers/like.controller.js';
import { verfiyJWT } from '../middlewares/auth.middleware.js';

export const likeRouter = Router();

likeRouter.use(verfiyJWT);
likeRouter.route("/new").post(likePost);
likeRouter.route("/get/u").get(getAllUsersWhoLikedaPost);
likeRouter.route("/get/liked/postids").get(getAllLikedPostsId);