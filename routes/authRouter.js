import express from "express";
import {
  register,
  login,
  getCurrent,
  logout,
} from "../controllers/authControllers.js";
import { authenticate } from "../middlewares/authenticate.js";

export const authRouter = express.Router();

authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.get("/current", authenticate, getCurrent);

authRouter.post("/logout", authenticate, logout);
