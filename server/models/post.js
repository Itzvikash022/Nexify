import mongoose, { Types } from "mongoose";

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
});

const Posts = new mongoose.model("Posts", postSchema);
export default Posts;
