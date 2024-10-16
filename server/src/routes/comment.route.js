import { Router } from "express";
import { createComment, EditComment, getCommentOnACommnet, getCommentsOnPost } from "../controllers/comment.controller.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";


export const commentRouter = Router();

commentRouter.use(verfiyJWT);
commentRouter.route("/new").post(createComment);
commentRouter.route("/get").get(getCommentOnACommnet);
commentRouter.route("/edit").put(EditComment);
commentRouter.route("/get/:postId").get(getCommentsOnPost);