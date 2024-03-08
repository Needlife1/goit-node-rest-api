import {
  loginSchema,
  registerSchema,
  emailSchema,
  User,
} from "../schemas/usersSchemas.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { ctrlWrapper } from "../helpers/ctrlWrapper.js";
import { sendEmail } from "../helpers/sendEmail.js";
import Jimp from "jimp";
import { randomUUID } from "crypto";

dotenv.config();

const { SECRET_KEY, BASE_URL } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  const { value, error } = registerSchema.validate(req.body);

  if (error) {
    return res.status(400).send({ message: error.message });
  }

  const existingUser = await User.findOne({ email: value.email });
  if (existingUser) {
    return res.status(409).send({ message: "Email in use" });
  }

  const hashPassword = await bcrypt.hash(value.password, 10);
  const avatarURL = gravatar.url(value.email);
  const verificationCode = randomUUID();

  const newUser = await User.create({
    ...value,
    password: hashPassword,
    avatarURL,
    verificationCode,
  });

  const verifyEmail = {
    to: value.email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationCode}">Click verify mail</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    password: newUser.subscription,
    email: newUser.email,
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    return res.status(401).send({ message: error.message });
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.json({ message: "Email verify success" });
};

const resendVerifyEmail = async (req, res) => {
  const { value, error } = emailSchema.validate(req.body);

  if (error) {
    return res.status(400).send({ message: error.message });
  }
  const user = await User.findOne({ email: value.email });

  if (!user) {
    return res.status(400).send({ message: "Email not found" });
  }

  if (user.verify) {
    return res
      .status(400)
      .message({ message: "Verification has already been passed" });
  }

  const verifyEmail = {
    to: value.email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationCode}">Click verify mail</a>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verify email send success",
  });
};

const login = async (req, res) => {
  const { value, error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).send({ message: error.message });
  }

  const user = await User.findOne({ email: value.email });

  if (!user) {
    return res.status(401).send("Email or password is wrong");
  }

  if (!user.verify) {
    return res.status(401).send("Email not verified");
  }

  const passwordCompare = await bcrypt.compare(value.password, user.password);

  if (!passwordCompare) {
    return res.status(401).send("Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });

  await User.findByIdAndUpdate(user._id, { token });

  res.status(200).json({
    token: token,
    user: {
      email: value.email,
      subscription: "starter",
    },
  });
};

const getCurrent = async (req, res) => {
  const { token } = req.user;

  if (!token) {
    return res.status(401).send("Not authorized");
  }

  res.json({
    token,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { token: null });

  return res.status(204).end();
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;

  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);

  const image = await Jimp.read(resultUpload);
  image.resize(250, 250);
  image.write(resultUpload);

  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

export const controllers = {
  register: ctrlWrapper(register),
  verifyEmail: ctrlWrapper(verifyEmail),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
};
