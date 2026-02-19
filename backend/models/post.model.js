import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
  },
  { _id: false }
);

const postSchema=new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    caption: {
        type: String,
        required: true,
    },
    // Array of media items (images/videos) for a single post
    media: {
        type: [mediaSchema],
        required: true,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            message: {
                type: String,
                required: true, 
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
},{timestamps: true});

const Post=mongoose.model("Post",postSchema);
export default Post;