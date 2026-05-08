import mongoose, { Schema } from 'mongoose';

const ResumeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    template: { type: String, enum: ['modern', 'minimal', 'creative'], default: 'modern' },
    personalInfo: {
      fullName: { type: String },
      email: { type: String },
      phone: { type: String },
      location: { type: String },
      summary: { type: String },
    },
    education: [
      {
        institution: { type: String },
        degree: { type: String },
        field: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        grade: { type: String },
      },
    ],
    experience: [
      {
        company: { type: String },
        position: { type: String },
        location: { type: String },
        startDate: { type: String },
        endDate: { type: String },
        description: [{ type: String }],
      },
    ],
    projects: [
      {
        name: { type: String },
        link: { type: String },
        description: { type: String },
        technologies: [{ type: String }],
      },
    ],
    skills: [{ type: String }],
    certifications: [{ type: String }],
    achievements: [{ type: String }],
    completeness: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Resume = mongoose.model('Resume', ResumeSchema);
