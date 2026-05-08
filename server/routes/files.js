import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

router.use('/view', express.static('uploads'));

router.get('/:filename', (req, res) => {
  const filePath = path.join('uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).json({ err: 'No file exists' });
  }
});

router.delete('/:filename', async (req, res) => {
  try {
    const filePath = path.join('uploads', req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ err: 'No file exists' });
    }
  } catch (err) {
    res.status(500).json({ err: 'Server error' });
  }
});

export default router;
