import express from 'express';
import { Post } from '../models/Post.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    const posts = await Post.find(query).populate('userId', 'name avatar').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const post = new Post({ ...req.body, userId: req.user?.id });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likes.indexOf(req.user?.id);
    if (index === -1) {
      post.likes.push(req.user?.id);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/comment', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Comment content is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      userId: req.user?.id,
      content,
      createdAt: new Date(),
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'name avatar role')
      .populate('comments.userId', 'name avatar');
    res.json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
