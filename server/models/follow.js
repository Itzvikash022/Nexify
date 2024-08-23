import mongoose, { Types } from "mongoose";

const followSchema = new mongoose.Schema({
  follower:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  followed:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },

});

const Follow = new mongoose.model("Follow", followSchema);
export default Follow;
