// src/controllers/postController.ts
import { Request, Response } from "express";
import Post from "../models/Post";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import User from "../models/User";

const getAllPosts = async (req: Request, res: Response) => {
  const { sort } = req.query;

  try {
    let posts;
    if (sort === "mostVoted") {
      posts = await Post.find()
        .sort({ upVotes: -1, downVotes: 1 })
        .populate("author", "username email imageUrl")
        .populate("comments", "author content createdAt replies")
        .lean();
    } else {
      posts = await Post.find()
        .sort({ lastUpdated: -1 })
        .populate("author", "username email imageUrl")
        .populate({
          path: "comments",
          populate: [
            { path: "author", select: "username email imageUrl createdAt" },
            {
              path: "replies.author",
              select: "username email imageUrl createdAt",
            },
          ],
        })
        .lean();
    }

    res.status(200).json(posts);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const createPost = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user.user._id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const newPost = new Post(req.body);
    newPost.author = new mongoose.Types.ObjectId(req.user.user._id);
    (newPost.title = req.body.title),
      (newPost.content = req.body.content),
      (newPost.category = req.body.category),
      (newPost.upVotes = 0),
      (newPost.downVotes = 0),
      (newPost.lastUpdated = new Date());
    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      newPost.imageUrl = imageUrl;
    }
    await newPost.save();
    const createdPost = await Post.findById(newPost._id)
      .populate("author", "username email imageUrl")
      .lean();

    res.status(201).json(createdPost);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getPostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id)
      .populate("author", "username email imageUrl")
      .populate({
        path: "comments",
        populate: [
          { path: "author", select: "username email imageUrl createdAt" },
          {
            path: "replies.author",
            select: "username email imageUrl createdAt",
          },
        ],
      })
      .lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const getAllPostsByUser = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ author: userId })
      .populate("author", "username email imageUrl")
      .populate({
        path: "comments",
        populate: [
          { path: "author", select: "username email imageUrl createdAt" },
          {
            path: "replies.author",
            select: "username email imageUrl createdAt",
          },
        ],
      })
      .lean();

    if (!posts.length) {
      return res.status(404).json({ message: "No posts found for this user" });
    }

    res.status(200).json(posts);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Handler to upvote a post
const upvotePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = req.user.user._id;

  try {
    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already upvoted or downvoted
    if (post.upVotedBy.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already upvoted this post" });
    }
    if (post.downVotedBy.includes(userId)) {
      post.downVotes -= 1;
      post.downVotedBy = post.downVotedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    // Update the post with the new upvote
    post.upVotes += 1;
    post.upVotedBy.push(userId);
    await post.save();

    res.status(200).json(post);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Handler to downvote a post
const downvotePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = req.user.user._id;

  try {
    // Check if the post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user has already upvoted or downvoted
    if (post.downVotedBy.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You have already downvoted this post" });
    }
    if (post.upVotedBy.includes(userId)) {
      post.upVotes -= 1;
      post.upVotedBy = post.upVotedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    }

    // Update the post with the new downvote
    post.downVotes += 1;
    post.downVotedBy.push(userId);
    await post.save();

    res.status(200).json(post);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const editPost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { title, content, category } = req.body;
  const userId = req.user.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author?._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Forbidden: You can only edit your own posts" });
    }

    post.title = title ?? post.title;
    post.content = content ?? post.content;
    post.category = category ?? post.category;
    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      post.imageUrl = imageUrl;
    }
    post.lastUpdated = new Date();

    await post.save();

    res.status(200).json(post);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author?._id.toString() !== req.user.user._id) {
      return res
        .status(403)
        .json({ message: "Forbidden: You are not the author of this post" });
    }

    // Delete the post
    await post.deleteOne();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const uploadImage = async (file: Express.Multer.File) => {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString("base64");
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
};

export default {
  getAllPosts,
  createPost,
  getPostById,
  editPost,
  deletePost,
  getAllPostsByUser,
  upvotePost,
  downvotePost,
};
