import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateRegisterRequest = [
  body("username")
    .isString()
    .notEmpty()
    .withMessage("Username must be a string and cannot be empty"),

  body("email").isEmail().withMessage("Must be a valid email").normalizeEmail(),
  body("password")
    .isString()
    .notEmpty()
    .withMessage("Password must be a string and cannot be empty")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long"),
  body("imageUrl").optional(),
  handleValidationErrors,
];
export const validateLoginRequest = [
  body("username")
    .isString()
    .notEmpty()
    .withMessage("Username must be a string and cannot be empty"),
  body("password")
    .isString()
    .notEmpty()
    .withMessage("Password must be a string and cannot be empty")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long"),
  handleValidationErrors,
];

export const validatePostRequest = [
  body("title")
    .isString()
    .notEmpty()
    .withMessage("Title must be a string and cannot be empty"),
  body("content")
    .isString()
    .notEmpty()
    .withMessage("Content must be a string and cannot be empty"),
  body("category")
    .isString()
    .notEmpty()
    .withMessage("Category must be a string and cannot be empty")
    .isIn([
      "Kidney",
      "Liver",
      "Heart",
      "Lungs",
      "Diabetes",
      "Cancer",
      "Nutrition",
      "Fitness",
    ])
    .withMessage("Category must be one of the predefined categories"),
  body("upVotes")
    .optional()
    .isInt({ min: 0 })
    .withMessage("UpVotes must be a non-negative integer"),
  body("downVotes")
    .optional()
    .isInt({ min: 0 })
    .withMessage("DownVotes must be a non-negative integer"),

  handleValidationErrors,
];
