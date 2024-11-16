import { Router } from "express";
import {
  addMember,
  createGroupChat,
  createNewChat,
  deleteGroup,
  deleteMessages,
  getChatDetails,
  getMessages,
  getMyChats,
  leaveGroup,
  removeMember,
  renameGroup,
  sendAttachments,
} from "../controllers/chat.controller.js";
import { verfiyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
export const chatRouter = Router();

chatRouter.use(verfiyJWT);
chatRouter.route("/group/create").post(createGroupChat);
chatRouter.route("/ng/create").post(createNewChat);
chatRouter.route("/grp/add").put(addMember);
chatRouter.route("/grp/rem").put(removeMember);
chatRouter.route("/grp/leave").put(leaveGroup);
chatRouter.route("/get/:chatId").get(getChatDetails);
chatRouter.route("/grp/n/change").put(renameGroup);
chatRouter.route("/grp/del").delete(deleteGroup);
chatRouter.route("/get/message/:chatId").get(getMessages);
chatRouter.route("/new/attach").post(
  upload.fields([
    {
      name: "file",
      maxCount: 4,
    },
  ]),
  sendAttachments
);
chatRouter.route("/c/get").get(getMyChats);
chatRouter.route("/messages/del").delete(deleteMessages);