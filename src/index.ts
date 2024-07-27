import express, { Request, Response } from "express";
import connectDB from "./config/connectDB";
import cookieParser from "cookie-parser";
import cors from "cors";
const PORT = process.env.PORT || 8000;
import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import authRoutes from "./routes/auth";
import postRoutes from "./routes/post";
import commentRoute from "./routes/comment";
import userRoutes from "./routes/user";

const app = express();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [process.env.FRONTEND_URI];
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
app.use("/api/my/user", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/post/comment", commentRoute);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
