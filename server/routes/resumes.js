import express from 'express';
import { Resume } from '../models/Resume.js';
import { authenticate } from '../middleware/auth.js';
import { buildResumeSummaryFromProfile } from '../utils/buildResumeSummary.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user?.id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const resume = new Resume({ ...req.body, userId: req.user?.id });
    await resume.save();
    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/generate-intro', authenticate, async (req, res) => {
  try {
    const { skills, experience, education } = req.body;
    const summary = buildResumeSummaryFromProfile({ skills, experience, education });
    res.json({ summary });
  } catch (error) {
    console.error('generate-intro:', error);
    res.status(500).json({ message: 'Could not build summary' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.id },
      { ...req.body },
      { new: true }
    );
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
    res.json({ message: 'Resume deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
