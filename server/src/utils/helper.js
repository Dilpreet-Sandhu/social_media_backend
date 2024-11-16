import { userSocketIds } from "../app.js";

export const getOtherUser = (members, userId) => {
  return members.find((member) => member?._id.toString() !== userId.toString());
};

export const getSocket = (users) => {
  return users.map((user) => userSocketIds.get(user?.toString()));
};

export const getMySocket = (userId) => {
  return userSocketIds.get(userId?.toString());
}