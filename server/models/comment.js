import mongoose, { Types } from "mongoose";

const commentSchema = new mongoose.Schema({
user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Posts',
      required: true,
    },
comment:{
    type: String,
    required: true,
},
createdAt: {
    type: Date,
    default: Date.now,
},
});

const Comments = new mongoose.model("Comments", commentSchema);
export default Comments;
