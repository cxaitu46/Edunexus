import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, bio, skills, linkedin } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const parsedSkills = skills
      ? skills.split(',').map((s) => s.trim()).filter((s) => s)
      : [];

    const user = new User({
      name,
      email,
      password: hashedPassword,
      bio,
      skills: parsedSkills,
      socialLinks: { linkedin: linkedin || '' },
    });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const lastActive = user.lastActive ? new Date(user.lastActive) : new Date(0);
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    let newStreak = user.streak || 0;

    if (diffHours > 24 && diffHours < 48) {
      newStreak += 1;
    } else if (diffHours >= 48) {
      newStreak = 0;
    } else if (newStreak === 0 && diffHours > 0) {
      newStreak = 1;
    }

    user.streak = newStreak;
    user.lastActive = now;
    await user.save();

    const [notesCount, questionsCount, resumesCount] = await Promise.all([
      mongoose.model('Note').countDocuments({ userId: user._id }),
      mongoose.model('Question').countDocuments({ userId: user._id }),
      mongoose.model('Resume').countDocuments({ userId: user._id }),
    ]);

    const userObj = user.toObject();
    res.json({
      ...userObj,
      id: user._id,
      stats: {
        notesCount,
        questionsCount,
        resumesCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/me', authenticate, async (req, res) => {
  try {
    const { name, bio, skills, socialLinks, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { name, bio, skills, socialLinks, avatar },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
