import {Router} from 'express';
import { createPost, getSavedPosts, getUserPosts, removeSavedPost, savePost, updatePost } from '../controllers/post.controller.js';
import {verfiyJWT} from '../middlewares/auth.middleware.js'
import { upload } from '../middlewares/multer.js';

export const postRouter = Router();

postRouter.use(verfiyJWT);
postRouter.route("/create").post(upload.single("file"),createPost);
postRouter.route("/get").get(getUserPosts);
postRouter.route("/save").post(savePost);
postRouter.route("/rem/saved").put(removeSavedPost);
postRouter.route("/get/saved").get(getSavedPosts);
postRouter.route("/update/:postId").put(updatePost);