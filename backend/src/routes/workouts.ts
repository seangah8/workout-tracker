import { Router } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Workout, Entry } from '../db/models.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const workouts = await Workout.find({ userId });
    res.json(workouts);
  } catch {
    res.status(500).json({ error: 'internal error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId } = req as AuthRequest;
    const { name } = req.body as { name?: string };
    const trimmed = name?.trim();
    if (!trimmed) {
      res.status(400).json({ error: 'name is required' });
      return;
    }
    const duplicate = await Workout.findOne({
      userId,
      name: { $regex: new RegExp(`^${trimmed}$`, 'i') },
    });
    if (duplicate) {
      res.status(409).json({ error: 'duplicate' });
      return;
    }
    const workout = await new Workout({ userId, name: trimmed }).save();
    res.status(201).json(workout);
  } catch {
    res.status(500).json({ error: 'internal error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req as unknown as AuthRequest;
    const { id } = req.params;
    const deleted = await Workout.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    await Entry.deleteMany({ workoutId: id });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'internal error' });
  }
});

export default router;
