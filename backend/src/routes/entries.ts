import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Entry } from '../db/models.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const entries = await Entry.find({ userId });
    res.json(entries);
  } catch {
    res.status(500).json({ error: 'internal error' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const { workoutId, date, reps } = req.body as { workoutId?: string; date?: string; reps?: number };
    if (!workoutId || !date || reps === undefined) {
      res.status(400).json({ error: 'workoutId, date, and reps are required' });
      return;
    }
    if (reps <= 0) {
      await Entry.deleteOne({ userId, workoutId, date });
    } else {
      await Entry.findOneAndUpdate(
        { userId, workoutId, date },
        { reps },
        { upsert: true },
      );
    }
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'internal error' });
  }
});

export default router;
