import express from "express";
import authController from "../controllers/authController";
import {
  validateLoginRequest,
  validateRegisterRequest,
} from "../middleware/validation";
const router = express.Router();

router.post("/register", validateRegisterRequest, authController.registerUser);
router.post("/login", validateLoginRequest, authController.loginUser);
router.post("/logout", authController.logoutUser);

export default router;
