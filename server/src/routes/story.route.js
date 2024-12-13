import { Router } from "express";
import { verfiyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import { checkHasStories, createStoy, fetchMyStories, getFollowingStories, userHavingStories } from "../controllers/story.controller.js";

export const storyRouter = Router();

storyRouter.use(verfiyJWT);
storyRouter.route("/new").post(upload.single("file"),createStoy);
storyRouter.route("/get/my/:userId").get(fetchMyStories);
storyRouter.route("/user/has/stories").get(checkHasStories);
storyRouter.route("/user/get/following").get(getFollowingStories);
storyRouter.route("/users/having/stories").get(userHavingStories);