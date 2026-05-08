import mongoose, { Schema } from 'mongoose';

const ProjectSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    githubLink: { type: String },
    liveLink: { type: String },
    images: [{ type: String }],
    techStack: [{ type: String }],
  },
  { timestamps: true }
);

export const Project = mongoose.model('Project', ProjectSchema);
