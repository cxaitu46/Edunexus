import express from 'express';
import { Project } from '../models/Project.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const project = new Project({ ...req.body, userId: req.user?.id });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
