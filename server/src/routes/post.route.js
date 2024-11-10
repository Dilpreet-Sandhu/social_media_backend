import { Router } from "express";
import {
  createPost,
  getExploreFeed,
  getSavedPosts,
  getUserFeed,
  getUserPosts,
  removeSavedPost,
  savePost,
  updatePost,
  getSavedPostsIds,
  getSinglePost,
  getExplorePagePosts,
  getReels
} from "../controllers/post.controller.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";

export const postRouter = Router();

postRouter.use(verfiyJWT);
postRouter.route("/create").post(upload.single("file"), createPost);
postRouter.route("/get/feed/reels").get(getReels);
postRouter.route("/get/p/:postId").get(getSinglePost);
postRouter.route("/get/:userId").get(getUserPosts);
postRouter.route("/save").post(savePost);
postRouter.route("/rem/saved").put(removeSavedPost);
postRouter.route("/get/user/saved").get(verfiyJWT,getSavedPosts);
postRouter.route("/get/user/saved/ids").get(verfiyJWT,getSavedPostsIds);
postRouter.route("/get/u/feed").get(getUserFeed);
postRouter.route("/get/feed").get(getExploreFeed);
postRouter.route("/update/:postId").put(updatePost);
postRouter.route("/get/explore/feed").get(getExplorePagePosts);