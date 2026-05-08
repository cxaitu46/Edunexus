import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';
import noteRoutes from './routes/notes.js';
import qaRoutes from './routes/qa.js';
import socialRoutes from './routes/social.js';
import projectRoutes from './routes/projects.js';
import notificationRoutes from './routes/notifications.js';
import fileRoutes from './routes/files.js';
import userRoutes from './routes/users.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 4004;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edunexus';

app.use(express.json());

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);

const clientDist = path.join(__dirname, '..', 'client', 'dist');

app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next(err);
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server at http://localhost:${PORT} (API + React static)`);
});
