import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/connection.js';
import authRoutes from './routes/auth.js';
import workoutRoutes from './routes/workouts.js';
import entryRoutes from './routes/entries.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/entries', entryRoutes);

(async () => {
  await connectDB(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/workout-tracker');
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
})();
