import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
  },
});

const User = mongoose.model("User", UserSchema);
export default User;
