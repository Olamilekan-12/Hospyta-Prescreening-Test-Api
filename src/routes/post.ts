import express from "express";
const router = express.Router();
import multer from "multer";
import { validatePostRequest } from "../middleware/validation";
import postController from "../controllers/postController";
import { verifyToken } from "../middleware/auth";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb
  },
});

router.post(
  "/new-post",
  upload.single("imageFile"),
  validatePostRequest,
  verifyToken,
  postController.createPost
);
router.get("/", postController.getAllPosts);
router.get("/:id", postController.getPostById);
router.get("/user/:userId", verifyToken, postController.getAllPostsByUser);
router.post("/:postId/upvote", verifyToken, postController.upvotePost);
router.post("/:postId/downvote", verifyToken, postController.downvotePost);
router.put("/:postId", verifyToken, postController.editPost);
router.delete("/:id", verifyToken, postController.deletePost);

export default router;
