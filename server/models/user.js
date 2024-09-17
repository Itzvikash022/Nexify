import mongoose, { Types } from "mongoose";

const userSchema = new mongoose.Schema({
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
  bio: {
    type: String,
    required: false,
    default: "Nexify User",
  },
  name: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  occupation: {
    type: String,
  },
  token: {
    type: String,
  },
  profileImgUrl: {
    type: String,
    // default: "default_profile_image.jpg",
  }
});

const Users = new mongoose.model("Users", userSchema);
export default Users;
