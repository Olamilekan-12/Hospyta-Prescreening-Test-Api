import { Router } from "express";
import commentController from "../controllers/commentController";
import { verifyToken } from "../middleware/auth"; // Adjust the path as needed

const router = Router();

router.post("/", verifyToken, commentController.createComment);
router.get("/:postId", commentController.getCommentsForPost);
router.post("/reply", verifyToken, commentController.createReply);
router.get("/replies/:commentId", commentController.getRepliesForComment);

export default router;
