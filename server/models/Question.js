import mongoose, { Schema } from 'mongoose';

const QuestionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    bestAnswerId: { type: Schema.Types.ObjectId },
    answers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, required: true },
        upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        isBest: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Question = mongoose.model('Question', QuestionSchema);
