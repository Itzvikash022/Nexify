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
    location: {
      type: String,
      required: false,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    commentCount: {
      type: Number,
      default: 0,
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
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
      }
    ]
  });

  const Posts = new mongoose.model("Posts", postSchema);
  export default Posts;
