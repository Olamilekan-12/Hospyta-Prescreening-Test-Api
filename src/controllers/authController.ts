import { Request, Response } from "express";
import bcryptjs from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";

const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "User email already exists" });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }
    const newUser = new User({
      username,
      email,
      password,
    });
    const salt = await bcryptjs.genSalt(10);
    newUser.password = await bcryptjs.hash(password, salt);

    await newUser.save();

    const registeredUser = await User.findOne({ email })
      .select("-password")
      .lean();
    if (!registeredUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ user: registerUser }, process.env.JWT_SECRET!);
    res
      .status(201)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(registeredUser);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const authenticUser = await User.findOne({ username }).lean();
    if (!authenticUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const validateUserPassword = await bcryptjs.compare(
      password,
      authenticUser.password
    );
    if (!validateUserPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { password: pass, ...rest } = authenticUser;
    const token = jwt.sign({ user: rest }, process.env.JWT_SECRET!);
    res
      .status(201)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const logoutUser = (req: Request, res: Response) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json({ message: "Successfully logged out" });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
};
