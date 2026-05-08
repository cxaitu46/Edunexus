import express from 'express';
import { Question } from '../models/Question.js';
import { User } from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { tag, search } = req.query;
    const query = {};
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const questions = await Question.find(query).populate('userId', 'name avatar').sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const question = new Question({ ...req.body, userId: req.user?.id });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/answers', authenticate, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    question.answers.push({
      userId: req.user?.id,
      content: req.body.content,
      upvotes: [],
      downvotes: [],
      isBest: false,
      createdAt: new Date(),
    });
    await question.save();

    await User.findByIdAndUpdate(req.user?.id, { $inc: { reputation: 5 } });

    const updatedQuestion = await Question.findById(req.params.id)
      .populate('userId', 'name avatar')
      .populate('answers.userId', 'name avatar');
    res.status(201).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { type } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const userId = req.user?.id;

    question.upvotes = question.upvotes.filter((id) => id.toString() !== userId.toString());
    question.downvotes = question.downvotes.filter((id) => id.toString() !== userId.toString());

    if (type === 'up') {
      question.upvotes.push(userId);
    } else if (type === 'down') {
      question.downvotes.push(userId);
    }

    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/answers/:answerId/vote', authenticate, async (req, res) => {
  try {
    const { type } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    const answer = question.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });

    const userId = req.user?.id;

    answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId.toString());
    answer.downvotes = answer.downvotes.filter((id) => id.toString() !== userId.toString());

    if (type === 'up') {
      answer.upvotes.push(userId);
    } else if (type === 'down') {
      answer.downvotes.push(userId);
    }

    await question.save();

    const updatedQuestion = await Question.findById(req.params.id)
      .populate('userId', 'name avatar')
      .populate('answers.userId', 'name avatar');
    res.json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
