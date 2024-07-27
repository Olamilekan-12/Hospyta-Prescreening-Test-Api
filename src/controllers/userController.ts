import { Request, Response } from "express";
import User from "../models/User";

const getSingleUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user.user._id;

    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password").lean();
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  getSingleUser,
  getAllUsers,
};
