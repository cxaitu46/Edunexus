import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    avatar: { type: String },
    reputation: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    bio: { type: String },
    skills: [{ type: String }],
    socialLinks: {
      github: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      website: { type: String },
    },
    unlockedNotes: [{ type: Schema.Types.ObjectId, ref: 'Note' }],
  },
  { timestamps: true }
);

export const User = mongoose.model('User', UserSchema);
