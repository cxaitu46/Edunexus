import express from 'express';
import { User } from '../models/User.js';
import { Connection } from '../models/Connection.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { query } = req.query;
    const filter = { _id: { $ne: req.user?.id } };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { skills: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('name role avatar bio skills').limit(20).lean();

    const connections = await Connection.find({
      $or: [
        { requester: req.user?.id, recipient: { $in: users.map((u) => u._id) } },
        { recipient: req.user?.id, requester: { $in: users.map((u) => u._id) } },
      ],
    });

    const usersWithConnectionStatus = users.map((u) => {
      const conn = connections.find(
        (c) =>
          (c.requester.toString() === u._id.toString() && c.recipient.toString() === req.user?.id) ||
          (c.recipient.toString() === u._id.toString() && c.requester.toString() === req.user?.id)
      );
      return {
        ...u,
        connectionStatus: conn ? conn.status : 'none',
        isRequester: conn ? conn.requester.toString() === req.user?.id : false,
      };
    });

    res.json(usersWithConnectionStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/connections/pending', authenticate, async (req, res) => {
  try {
    const requests = await Connection.find({ recipient: req.user?.id, status: 'pending' }).populate(
      'requester',
      'name avatar role bio skills'
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/connections/accepted', authenticate, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user?.id }, { recipient: req.user?.id }],
      status: 'accepted',
    }).populate('requester recipient', 'name avatar role bio skills');

    const peers = connections.map((conn) => {
      const isRequester = conn.requester._id.toString() === req.user?.id;
      return isRequester ? conn.recipient : conn.requester;
    });

    res.json(peers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let connectionStatus = 'none';
    let isRequester = false;
    if (req.user && req.user.id !== req.params.id) {
      const conn = await Connection.findOne({
        $or: [
          { requester: req.user.id, recipient: req.params.id },
          { recipient: req.user.id, requester: req.params.id },
        ],
      });
      if (conn) {
        connectionStatus = conn.status;
        isRequester = conn.requester.toString() === req.user.id;
      }
    }

    const safeUser = { ...user };
    if (connectionStatus !== 'accepted' && connectionStatus !== 'connected') {
      delete safeUser.email;
    }

    res.json({ ...safeUser, connectionStatus, isRequester });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/connect', authenticate, async (req, res) => {
  try {
    if (req.user?.id === req.params.id) return res.status(400).json({ message: 'Cannot connect with yourself' });

    const existing = await Connection.findOne({
      $or: [
        { requester: req.user?.id, recipient: req.params.id },
        { recipient: req.user?.id, requester: req.params.id },
      ],
    });

    if (existing) return res.status(400).json({ message: 'Connection already exists' });

    const connection = new Connection({
      requester: req.user?.id,
      recipient: req.params.id,
      status: 'pending',
    });
    await connection.save();

    res.status(201).json({ ...connection.toObject(), status: 'pending' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/accept', authenticate, async (req, res) => {
  try {
    const connection = await Connection.findOne({
      requester: req.params.id,
      recipient: req.user?.id,
      status: 'pending',
    });

    if (!connection) return res.status(404).json({ message: 'Connection request not found' });

    connection.status = 'accepted';
    await connection.save();

    res.json(connection);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id/connection', authenticate, async (req, res) => {
  try {
    const result = await Connection.findOneAndDelete({
      $or: [
        { requester: req.user?.id, recipient: req.params.id },
        { recipient: req.user?.id, requester: req.params.id },
      ],
    });

    if (!result) return res.status(404).json({ message: 'Connection not found' });
    res.json({ message: 'Connection removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
