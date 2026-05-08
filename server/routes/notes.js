import express from 'express';
import { Note } from '../models/Note.js';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { subject, university, search } = req.query;
    const query = {};
    if (subject) query.subject = subject;
    if (university) query.university = university;
    if (search) query.title = { $regex: search, $options: 'i' };

    const notes = await Note.find(query).populate('userId', 'name avatar').sort({ createdAt: -1 }).lean();

    const user = await User.findById(req.user?.id);
    const unlockedSet = new Set(user?.unlockedNotes?.map((id) => id.toString()) || []);

    const notesWithLockStatus = notes.map((note) => ({
      ...note,
      isUnlocked:
        note.userId._id.toString() === req.user?.id || unlockedSet.has(note._id.toString()),
    }));

    res.json(notesWithLockStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, subject, university, tags } = req.body;
    const file = req.file;

    const note = new Note({
      userId: req.user?.id,
      title,
      description,
      subject,
      university,
      tags: tags ? JSON.parse(tags) : [],
      fileUrl: `/api/files/view/${file.filename}`,
      fileType: file.mimetype || 'application/octet-stream',
    });

    await note.save();

    await User.findByIdAndUpdate(req.user?.id, { $inc: { reputation: 40 } });

    res.status(201).json(note);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const index = note.likes.indexOf(req.user?.id);
    if (index === -1) {
      note.likes.push(req.user?.id);
    } else {
      note.likes.splice(index, 1);
    }
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/unlock', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.reputation < 10) {
      return res.status(400).json({ message: 'Insufficient reputation points (Cost: 10)' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    user.reputation -= 10;
    user.unlockedNotes.push(req.params.id);
    await user.save();

    res.json({ message: 'Note unlocked successfully', reputation: user.reputation });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/rate', authenticate, async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Invalid rating' });

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const existingRatingIndex = note.ratings.findIndex((r) => r.userId.toString() === req.user?.id);
    if (existingRatingIndex >= 0) {
      note.ratings[existingRatingIndex].rating = rating;
      if (review !== undefined) note.ratings[existingRatingIndex].review = review;
    } else {
      note.ratings.push({ userId: req.user?.id, rating, review });
    }

    const totalRatings = note.ratings.reduce((sum, r) => sum + r.rating, 0);
    note.averageRating = totalRatings / note.ratings.length;

    await note.save();
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.userId.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
