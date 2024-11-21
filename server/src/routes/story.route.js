import { Router } from "express";
import { verfiyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import { createStoy } from "../controllers/story.controller.js";

export const storyRouter = Router();

storyRouter.use(verfiyJWT);
storyRouter.route("/new").post(upload.single("file"),createStoy);