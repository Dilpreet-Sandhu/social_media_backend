import { ApiError, ApiResponse } from "../utils/apiHandler.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { NotificationModel } from "../models/notification.model.js";
import {Chat} from '../models/chat.model.js';

export async function signUp(req, res) {
  try {
    const { username, email, password ,tags} = req.body;

    if ([username, email, password].some((item) => item == "")) {
      return res.json(new ApiError(400, false, "all fields are neccessary"));
    }

    const avatarPath = req?.file?.path || "";

    let avatar;

    if (avatarPath) {
      avatar = await uploadToCloudinary(avatarPath);
    }

    const hashedpassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedpassword,
      avatar: avatar?.url || "",
      followers: [],
      following: [],
      blockedUser: [],
      avatarPublicId: avatar?.public_id || "",
      isPrivate: false,
      tags
    });

    if (!user) {
      return res
        .status(500)
        .json(new ApiError(500, false, "couldn't register user"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "user registed successfully"));
  } catch (error) {
    console.log("error while registering user:  ", error);
    return res.status(500).json(new ApiError(500, "couldn't register user"));
  }
}

export async function checkUsername(req,res) {
  try {

    const {username} = req.body;

    if (!username) {
      return res.status(200).json(new ApiResponse(false,"no username detected"));
    }

    const user = await User.findOne({username});

    if (user) {
      return res.status(200).json(new ApiResponse(true,"username is already taken"));
    }

    return res.status(200).json(new ApiResponse(true,"username is available"));

    
  } catch (error) {
    console.log("error while checking username: ",error);
    return res.status(500).json(new ApiResponse(false,"error while checking username"));
  }

}

export async function logIn(req, res) {
  try {
    const { identifier, password } = req.body;

    if ([identifier, password].some((item) => item == "")) {
      return res
        .status(400)
        .json(new ApiResponse(false, "please fill all the neccessary fields"));
    }

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            false,
            "no user found for the given username or email"
          )
        );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json(new ApiResponse(false, "wrong password"));
    }

    const token = user.generateToken();

    if (!token) {
      return res
        .status(500)
        .json(new ApiResponse(false, "couldn't generate token"));
    }

    return res
      .status(200)
      .cookie("token", token,{sameSite : "Lax",path : "/",maxAge : 10 * 24 * 60 * 60 * 1000})
      .json(new ApiResponse(true, "user logged in succesfully", user));
  } catch (error) {
    console.log("error while logging user in: ", error);
    return res.status(500).json(new ApiResponse(false, "couldn't log in user"));
  }
}

export async function logOut(req, res) {
  try {
    if (!req.user) {
      return res
        .status(400)
        .json(new ApiError(400, false, "you are not logged in"));
    }

    return res
      .status(200)
      .clearCookie("token",{sameSite : "Lax",httpOnly : true,path : "/"})
      .json(new ApiResponse(true, "you are logged out succesfully"));
  } catch (error) {
    console.log("error while logging user out:  ", error);
    return res
      .status(500)
      .json(new ApiError(500, false, "couldn't log out the user"));
  }
}

export async function getMyProfile(req, res) {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(500).json(new ApiError(500, false, "no user id found"));
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(500).json(new ApiError(500, false, "no user found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "fetched user profile sucesfully", user));
  } catch (error) {
    console.log("error while getting user profile info: ", error);
    return res
      .status(500)
      .json(new ApiError(500, false, "error while getting user profile info"));
  }
}

export async function sendFollowRequest(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json(new ApiError(400, false, "please provide user id"));
    }

    const otherUser = await User.findById(userId);

    if (!otherUser) {
      return res
        .status(400)
        .json(new ApiError(400, false, "no user found for the given id"));
    }

    if (otherUser.blockedUsers.includes(req.user._id)) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            false,
            `you are blocked by ${otherUser.username}`
          )
        );
    }
    

    otherUser.followers.push(req.user._id);
    await otherUser.save({ validateBeforeSave: false });

    const me = await User.findByIdAndUpdate(req.user._id, {
      $push: { following: userId },
    });

    const newNotification = await NotificationModel.create({
      title : `${req.user.username} has started following you`,
      sender : req.user._id,
      reciever : otherUser._id,
      type : "follow"
    });

    if (!newNotification) {
      console.log("coulnd't send notification ")
    }

    if (!me) {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            false,
            "couldn't updated following list in your profile"
          )
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(true, `you are now following ${otherUser.username}`)
      );
  } catch (error) {
    console.log("error while sending follow request: ", error);
    return res
      .status(500)
      .json(new ApiError(500, false, "cound't send follow request"));
  }
}

export async function sendUnfollowRequest(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(new ApiError(400, false, "no user id found"));
    }

    const otherUser = await User.findById(userId);

    if (!otherUser) {
      return res
        .status(400)
        .json(new ApiError(400, false, "no user found for the given userId"));
    }

    otherUser.followers = otherUser.followers.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await otherUser.save({ validateBeforeSave: false });

    const me = await User.findById(req.user._id);
    me.following = me.following.filter(
      (id) => id.toString() !== otherUser._id.toString()
    );
    await me.save({ validateBeforeSave: false });

    if (!me) {
      return res
        .status(400)
        .json(
          new ApiError(400, false, "couldn't update following list of user")
        );
    }

    return res
      .status(200)
      .json(new ApiResponse(true, `you unfollowed ${otherUser.username}`));
  } catch (error) {
    console.log("error while unfollowing someone: ", error);
    return res
      .status(500)
      .json(new ApiError(500, false, "couldn't send unfollow request"));
  }
}

export async function getUserFollowingAndFollowerList(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json(new ApiError(400, false, "you are not logged in"));
    }

    const users = await User.findById(userId).select(
      "-password -avatarPublicId -blockedUsers -avatar -username -email"
    );

    const following = await User.find({ _id: users.following }).select(
      "+avatar +username +following +followers"
    );
    const followers = await User.find({ _id: users.followers }).select(
      "+avatar +username +following +followers"
    );

    return res.status(200).json(
      new ApiResponse(
        true,
        "fetched following and followers list list sucessfully",
        {
          followers,
          following,
        }
      )
    );
  } catch (error) {
    console.log("error while fetching following list: ", error);
    return res
      .status(500)
      .json(new ApiError(500, false, "error while fetching following list"));
  }
}

export async function blockUser(req, res) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json(new ApiError(400, false, "no user id found "));
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
      $push: { blockedUsers: userId },
    });

    if (!user) {
      return res.status(400).json(new ApiError(400, false, "no user found"));
    }

    return res.status(200).json(new ApiResponse(true, `blocked successfully`));
  } catch (error) {
    console.log("error while blocking user: ", error);
    return res
      .status(500)
      .json(new ApiError(500, false, "error while blocking user"));
  }
}

export async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json(new ApiError(400, false, "no user id found"));
    }

    const user = await User.findById(userId).select(
      "-password -email -blockedUsers -avatarPublicId"
    ).populate("followers following","username avatar follower following");

    if (!user) {
      return res
        .status(400)
        .json(new ApiError(400, false, "no user found for the given id"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "user fetched sucessfully", user));
  } catch (error) {
    console.log("error while getting user info: ", error);
    return res
      .status(500)
      .json(new ApiError(500, false, "couldn't fetch user info"));
  }
}

export async function getBlockedUsers(req, res) {
  try {
    const users = await User.find({ _id: req.user.blockedUsers });

    if (!users) {
      return res
        .status(200)
        .json(new ApiResponse(true, "you have 0 blocked users"));
    }

    return res.status(200).json(new ApiResponse(true, "blocked users", users));
  } catch (error) {
    console.log("error while fetching blocked users", error);
    return res
      .status(500)
      .json(new ApiError(500, false, "error while fetching blocked users"));
  }
}

export async function makeAccountPrivate(req, res) {
  try {
    const { isPrivate } = req.body;

    if (!isPrivate) {
      return res
        .status(400)
        .json(new ApiResponse(false, "private flag is required"));
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
      isPrivate,
    });

    return res
      .status(200)
      .json(new ApiResponse(true, "your profile is private"));
  } catch (error) {
    console.log("error while making account private", error);
    return res
      .status(400)
      .json(new ApiResponse(false, "error while making account private"));
  }
}

export async function editUser(req, res) {
  try {
    const { username } = req.body;

    const avatarPath = req?.file?.path;
    let avatar;

    if (avatar) {
      avatar = await uploadToCloudinary(avatarPath);
      await deleteFromCloudinary(req.user.avatarPublicId);
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
      avatar: avatar.url,
      avatarPublicId: avatar.public_id,
      username,
    });

    if (!user) {
      return res
        .status(400)
        .json(new ApiResponse(false, "couldn't update your profile"));
    }

    return res
      .status(200)
      .json(new ApiResponse(true, "updated user profile successfully"));
  } catch (error) {
    console.log("error while editing profile: ", error);
    return res
      .status(500)
      .json(new ApiResponse(false, "error while editing profile"));
  }
}


export async function getUserByName(req,res) {
  try {

    const {name} = req.query;

    if (!name) {
      return res.status(400).json(new ApiResponse(false,"name not found"));
    }

    const users = await User.find({
      username : { $regex : name, $options : "i" },
    },{username : 1,avatar : 1,followers : 1}).populate("followers","username ");

    if (!users) {
      return res.status(200).json(new ApiResponse(true,"no users found"));
    }

    return res.status(200).json(new ApiResponse(true,"users fetched succesfully",users));


    
  } catch (error) {
    console.log("error while gettting user by name: ",error);
  }
}

export async function getUserNotification(req,res) {

  try {

    const userId = req?.user?._id;

    const notifications = await NotificationModel.find({reciever : userId}).populate("sender","username avatar");




    return res.status(200).json(new ApiResponse(true,"fetched user's notifications",notifications));
    
  } catch (error) {
    console.log("error while getting user's notification",error);
  }

}


export async function deleteNotif(req,res) {

  try {

    const {notifId} = req.body;

    const notification = await NotificationModel.findByIdAndDelete(notifId);

    if (!notification) {
      return res.status(400).json(new ApiResponse(false,"couldn't delte notification"));
    }

    return res.status(200).json(new ApiResponse(true,"notification deleted succesfully"))
    
  } catch (error) {
    console.log("error while deleting notification",error);
    return res.status(500).json(new ApiResponse(false,"error while deleting notification"));
  }

}