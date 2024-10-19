import { ApiResponse } from "../utils/apiHandler.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { getOtherUser } from "../utils/helper.js";
import {
  uploadMultipleFiles,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import { Message } from "../models/message.model.js";

export async function createNewChat(req, res) {
  try {
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res
        .status(400)
        .json(new ApiResponse(false, "please provide other user id"));
    }

    const otherUser = await User.findById(otherUserId);

    if (otherUser.blockedUsers.includes(req.user._id)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            "you are blocked by the user you are trying to currently message"
          )
        );
    }

    const chat = await Chat.create({
      members: [req.user._id, otherUserId],
      creator: req.user._id,
      isApproved: false,
      groupChat: false,
      name: `anything`,
    });

    if (!chat) {
      return res
        .status(500)
        .json(new ApiResponse(false, "couldn't create chat"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "created chat succesffully"));
  } catch (error) {
    console.log("error while creating chat: ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while creating chat"));
  }
}

export async function createGroupChat(req, res) {
  try {
    const { name, members } = req.body;

    if (members.length < 3) {
      return res
        .status(400)
        .json(new ApiResponse(false, "at least 3 members are required"));
    }

    const allMembers = [...members, req.user._id];

    const chat = await Chat.create({
      name,
      members: allMembers,
      creator: req.user._id,
      isApproved: true,
      groupChat: true,
    });

    if (!chat) {
      return res
        .status(400)
        .json(new ApiResponse(false, "couldn't create chat"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "creaed chat succesfully"));
  } catch (error) {
    console.log("error while creating group chat: ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while creating group chat"));
  }
}

export async function getMyChats(req, res) {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ members: userId }).populate(
      "members",
      "username avatar"
    );

    const transformedChats = chats.map(
      ({ _id, members, isApproved, groupChat }) => {
        const otherMember = getOtherUser(members, userId);

        return {
          _id,
          members: members.reduce((prev, current) => {
            if (current._id.toString() !== req.user._id.toString()) {
              prev.push(current);
            }
            return prev;
          }, []),
          isApproved,
          groupChat,
          avatar: groupChat
            ? members.slice(0, 3).map(({ avatar }) => avatar)
            : [otherMember.avatar],
        };
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(true, "fetched chats successfully", transformedChats)
      );
  } catch (error) {
    console.log("error while fetching chats", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "couldn't fetch user chats"));
  }
}

export async function addMember(req, res) {
  try {
    const { member, chatId } = req.body;

    if (!chatId || !member) {
      return res
        .status(400)
        .json(new ApiResponse(false, "chat id or members were not found"));
    }

    const chat = await Chat.findById(chatId);

    const allMembersPromise = member.map((i) => User.findById(i, "_id"));

    const allMembers = await Promise.all(allMembersPromise);

    const memberIds = allMembers.filter(
      (i) => !chat.members.includes(i._id.toString())
    );

    chat.members.push(...memberIds);

    if (chat.members.length > 50) {
      return res
        .status(400)
        .json(new ApiResponse(false, "members list has exceeded it's limit"));
    }

    await chat.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(true, "member added to the group succesfully"));
  } catch (error) {
    console.log("error while adding member to the chat: ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while adding member to the chat"));
  }
}

export async function removeMember(req, res) {
  try {
    const { memberToBeRemoved, chatId } = req.body;

    if (!chatId || !memberToBeRemoved) {
      return res
        .status(400)
        .json(
          new ApiResponse(false, "chatId or member to be removed is missing")
        );
    }

    const chat = await Chat.findById(chatId);

    if (chat.creator.toString() !== req.user._id.toString()) {
      return res
        .status(500)
        .json(new ApiResponse(false, "you are not the admin of chat "));
    }

    chat.members = chat.members.filter(
      (member) => member.toString() !== memberToBeRemoved
    );
    await chat.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(true, "member succesfully removed from the chat"));
  } catch (error) {
    console.log("error while removing member from the group: ", error);
    return res
      .status(500)
      .json(
        new ApiResponse(false, "error while removing member from the group")
      );
  }
}

export async function leaveGroup(req, res) {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res
        .status(400)
        .json(new ApiResponse(false, "please provide chat id"));
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res
        .status(400)
        .json(new ApiResponse(false, "no chat found for the given id"));
    }

    chat.members = chat.members.filter(
      (member) => member.toString() !== req.user._id.toString()
    );

    if (chat.creator.toString() == req.user._id.toString()) {
      chat.creator = chat.members[0];
    }

    await chat.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(true, "left group succesfully"));
  } catch (error) {
    console.log("error while leaving group", error);
    return res
      .status(400)
      .json(new ApiResponse(false, "error while leaving group"));
  }
}

export async function sendAttachments(req, res) {
  try {
    const { content, chatId } = req.body;
    const files = req.files.file.map((file) => file?.path);

    if (!files) {
      return res
        .status(400)
        .json(new ApiResponse(false, "please provide files to send"));
    }

    const uploadedUrls = await uploadToCloudinary(files[0]);

    const message = await Message.create({
      content: content || "",
      sender: req.user._id,
      chatId,
      attachments: uploadedUrls,
    });

    if (!message) {
      return res
        .status(500)
        .json(new ApiResponse(false, "couldn't send messsage"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "sent message succesfully"));
  } catch (error) {
    console.log("error while sending attachments: ", error);
  }
}

export async function getChatDetails(req, res) {
  try {
    const { chatId } = req.params;

    if (!chatId) {
      return res.status(500).json(new ApiResponse(false, "chat id not found"));
    }

    const chat = await Chat.findById(chatId).populate(
      "members",
      "avatar username"
    );

    if (!chat) {
      return res
        .status(400)
        .json(new ApiResponse(false, "no chat found for the given id"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "fetched chat succesfully", chat));
  } catch (error) {
    console.log("error while getting chat details: ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "errro while getting chat details"));
  }
}

export async function renameGroup(req, res) {
  try {
    const { name, chatId } = req.body;

    if (!name || !chatId) {
      return res
        .status(400)
        .json(new ApiResponse(false, "chat id is required"));
    }

    const chat = await Chat.findById(chatId);

    if (req.user._id.toString() !== chat.creator.toString()) {
      return res
        .status(400)
        .json(new ApiResponse(false, "you are not the admin of the chat"));
    }

    chat.name = name;
    await chat.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(true, "group name changed succesfully"));
  } catch (error) {
    console.log("error while renaming group: ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while renaming group"));
  }
}

export async function deleteGroup(req, res) {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res
        .status(400)
        .json(new ApiResponse(false, "couldn't find any chat id"));
    }

    const chat = await Chat.findById(chatId);

    if (req.user._id.toString() !== chat.creator.toString()) {
      return res
        .status(400)
        .json(new ApiResponse(false, "you are not the admin of the chat"));
    }

    const deletedChat = await Chat.findByIdAndDelete(chat._id);

    if (!deletedChat) {
      return res
        .status(400)
        .json(new ApiResponse(false, "couldn't delete the chat"));
    }

    return res
      .status(200)
      .json(new ApiResponse(false, "delted chat succesfully"));
  } catch (error) {
    console.log("error while deleting group", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while deleting group"));
  }
}

export async function getMessages(req, res) {
  try {
    const { chatId } = req.body;

    if (!chatId) {
      return res
        .status(400)
        .json(new ApiResponse(false, "please provide chat id to get messages"));
    }

    const messages = await Message.find({ chatId }).populate("sender", "name");

    return res
      .status(200)
      .json(new ApiResponse(true, "messages fetched succesfully", messages));
  } catch (error) {
    console.log("error while getting messages: ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while getting messages"));
  }
}
