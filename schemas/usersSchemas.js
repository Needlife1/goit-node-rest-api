import { Schema, model } from "mongoose";
import Joi from "joi";

const userSchema = new Schema(
  {
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: {
      type: String,
      required: true,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", (error, doc, next) => {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Email in use"));
  } else {
    next(error);
  }
});

export const registerSchema = Joi.object({
  password: Joi.string().required().min(6),
  email: Joi.string().email().required(),
});

export const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const loginSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

export const User = model("user", userSchema);
