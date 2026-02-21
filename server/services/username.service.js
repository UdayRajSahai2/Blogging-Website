import { User } from "../models/associations.js";
import { nanoid } from "nanoid";

export const generateUsername = async (email) => {
  let baseUsername = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 20);

  let username = baseUsername;

  while (await User.findOne({ where: { username } })) {
    username = `${baseUsername}_${nanoid(3)}`;
  }

  return username;
};
