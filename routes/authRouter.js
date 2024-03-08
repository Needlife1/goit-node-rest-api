import express from "express";
import { controllers } from "../controllers/authControllers.js";
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/upload.js";

export const authRouter = express.Router();

authRouter.post("/register", controllers.register);

authRouter.get("/verify/:verificationToken", controllers.verifyEmail);

authRouter.post("/verify", controllers.resendVerifyEmail);

authRouter.post("/login", controllers.login);

authRouter.get("/current", authenticate, controllers.getCurrent);

authRouter.post("/logout", authenticate, controllers.logout);

authRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  controllers.updateAvatar
);
