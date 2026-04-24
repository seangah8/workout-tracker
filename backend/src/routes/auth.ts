import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../db/models.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    const trimmed = username?.trim();
    if (!trimmed || !password) {
      res.status(400).json({ error: 'username and password are required' });
      return;
    }
    const exists = await User.findOne({ username: { $regex: new RegExp(`^${trimmed}$`, 'i') } });
    if (exists) {
      res.status(409).json({ error: 'taken' });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await new User({ username: trimmed, passwordHash }).save();
    const token = signToken(user.id as string, user.username);
    res.status(201).json({ token, user: { id: user.id, username: user.username } });
  } catch {
    res.status(500).json({ error: 'internal error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username?.trim() || !password) {
      res.status(400).json({ error: 'username and password are required' });
      return;
    }
    const user = await User.findOne({ username: { $regex: new RegExp(`^${username.trim()}$`, 'i') } });
    if (!user) {
      res.status(401).json({ error: 'invalid' });
      return;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ error: 'invalid' });
      return;
    }
    const token = signToken(user.id as string, user.username);
    res.json({ token, user: { id: user.id, username: user.username } });
  } catch {
    res.status(500).json({ error: 'internal error' });
  }
});

export default router;
