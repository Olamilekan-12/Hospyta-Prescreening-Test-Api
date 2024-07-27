import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import userController from "../controllers/userController";

const router = Router();

router.get("/", verifyToken, userController.getAllUsers);
router.get("/single", verifyToken, userController.getSingleUser);

export default router;
