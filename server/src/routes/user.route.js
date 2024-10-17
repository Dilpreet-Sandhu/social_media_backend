import {Router} from 'express';
import {upload} from '../middlewares/multer.js'
import { blockUser, getBlockedUsers, getMyProfile, getUserFollowingAndFollowerList, getUserProfile, logIn, logOut, makeAccountPrivate, sendFollowRequest, sendUnfollowRequest, signUp } from '../controllers/user.controller.js';
import { verfiyJWT } from '../middlewares/auth.middleware.js';

export const userRouter = Router();


userRouter.route("/sign-up").post(upload.single("avatar"),signUp);
userRouter.route("/sign-in").post(logIn);
userRouter.route('/logout').get(verfiyJWT,logOut);
userRouter.route("/p/get").get(verfiyJWT,getMyProfile);
userRouter.route("/follow").put(verfiyJWT,sendFollowRequest);
userRouter.route("/blocked").get(verfiyJWT,getBlockedUsers);
userRouter.route("/unfollow").put(verfiyJWT,sendUnfollowRequest);
userRouter.route("/m/private").put(verfiyJWT,makeAccountPrivate);
userRouter.route("/get/:userId").get(verfiyJWT,getUserProfile);
userRouter.route("/get/follow/:userId").get(verfiyJWT,getUserFollowingAndFollowerList);
userRouter.route("/block").put(verfiyJWT,blockUser);