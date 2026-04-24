export interface User {
  id: string;
  username: string;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export interface WorkoutEntry {
  userId: string;
  workoutId: string;
  date: string; // YYYY-MM-DD
  reps: number;
}
