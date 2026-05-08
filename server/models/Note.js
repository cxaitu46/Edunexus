import mongoose, { Schema } from 'mongoose';

const NoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    fileType: { type: String },
    subject: { type: String, required: true },
    university: { type: String },
    tags: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    downloads: { type: Number, default: 0 },
    ratings: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        review: { type: String },
      },
    ],
    averageRating: { type: Number, default: 0 },
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Note = mongoose.model('Note', NoteSchema);
