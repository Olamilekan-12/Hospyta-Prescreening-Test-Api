import { Request, Response } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import mongoose from "mongoose";

// Create a comment on a post
const createComment = async (req: Request, res: Response) => {
  const { postId, content } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = new Comment({
      postId,
      author: req.user.user._id,
      content,
    });

    await newComment.save();

    post.comments.push(newComment._id);
    await post.save();

    const createdComment = await Comment.findById(newComment._id)
      .populate("author", "username email")
      .lean();

    res.status(201).json(createdComment);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get comments for a post
const getCommentsForPost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const comments = await Comment.find({ postId })
      .populate("author", "username email")
      .lean();

    if (!comments) {
      return res.status(404).json({ message: "Comments not found" });
    }

    res.status(200).json(comments);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Create a reply to a comment
const createReply = async (req: Request, res: Response) => {
  const { commentId, content } = req.body;

  try {
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const newReply = {
      _id: new mongoose.Types.ObjectId(),
      author: req.user.user._id,
      content,
      lastUpdated: new Date(),
    };

    parentComment.replies.push(newReply);
    await parentComment.save();

    res.status(201).json(newReply);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get replies for a comment
const getRepliesForComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId)
      .populate("replies.author", "username email")
      .lean();

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(comment.replies);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  createComment,
  getCommentsForPost,
  createReply,
  getRepliesForComment,
};
