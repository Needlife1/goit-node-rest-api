import { loginSchema, registerSchema, User } from "../schemas/usersSchemas.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const { SECRET_KEY } = process.env;

export const register = async (req, res) => {
  try {
    const { value, error } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).send({ message: error.message });
    }

    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) {
      return res.status(409).send({ message: "Email in use" });
    }

    const hashPassword = await bcrypt.hash(value.password, 10);

    const newUser = await User.create({ ...value, password: hashPassword });

    res.status(201).json({
      password: newUser.password,
      email: newUser.email,
    });
  } catch (error) {
    console.error("Помилка під час реєстрації користувача:", error);
    res
      .status(500)
      .send({ message: "Щось пішло не так. Будь ласка, спробуйте ще раз." });
  }
};

export const login = async (req, res) => {
  const { value, error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).send({ message: error.message });
  }

  const user = await User.findOne({ email: value.email });

  if (!user) {
    return res.status(401).send("Email or password is wrong");
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

export const getCurrent = async (req, res) => {
  const { token } = req.user;

  if (!token) {
    return res.status(401).send("Not authorized");
  }

  res.json({
    token,
  });
};

export const logout = async (req, res) => {
  const { _id } = req.user;

  await User.findByIdAndUpdate(req.user, { token: null });

  return res.status(204);
};
