import mongoose, { Schema } from 'mongoose';

const PostSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const Post = mongoose.model('Post', PostSchema);
