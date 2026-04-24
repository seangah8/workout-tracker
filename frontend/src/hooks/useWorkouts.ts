import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Workout, WorkoutEntry } from '../types';
import { apiFetch } from '../api';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch<Workout[]>('/workouts'),
      apiFetch<WorkoutEntry[]>('/entries'),
    ]).then(([w, e]) => {
      if (!cancelled) {
        setWorkouts(w);
        setEntries(e);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const addWorkout = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const workout = await apiFetch<Workout>('/workouts', {
        method: 'POST',
        body: JSON.stringify({ name: trimmed }),
      });
      setWorkouts((prev) => [...prev, workout]);
    } catch {
      // server-side duplicate check handles rejection
    }
  }, []);

  const deleteWorkout = useCallback(async (id: string) => {
    try {
      await apiFetch(`/workouts/${id}`, { method: 'DELETE' });
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      setEntries((prev) => prev.filter((e) => e.workoutId !== id));
    } catch {
      // ignore
    }
  }, []);

  const setReps = useCallback(async (workoutId: string, date: string, reps: number) => {
    try {
      await apiFetch('/entries', {
        method: 'PUT',
        body: JSON.stringify({ workoutId, date, reps }),
      });
      setEntries((prev) => {
        const filtered = prev.filter(
          (e) => !(e.workoutId === workoutId && e.date === date),
        );
        if (reps <= 0) return filtered;
        return [...filtered, { userId: '', workoutId, date, reps }];
      });
    } catch {
      // ignore
    }
  }, []);

  const getRepsForDate = useCallback(
    (date: string): Record<string, number> => {
      const result: Record<string, number> = {};
      entries.filter((e) => e.date === date).forEach((e) => {
        result[e.workoutId] = e.reps;
      });
      return result;
    },
    [entries],
  );

  const getSeriesForChart = useCallback(() => {
    return workouts
      .map((w) => {
        const data = entries
          .filter((e) => e.workoutId === w.id)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((e) => ({ date: e.date, reps: e.reps }));
        return { id: w.id, name: w.name, data };
      })
      .filter((s) => s.data.length > 0);
  }, [workouts, entries]);

  return useMemo(
    () => ({ workouts, entries, loading, addWorkout, deleteWorkout, setReps, getRepsForDate, getSeriesForChart }),
    [workouts, entries, loading, addWorkout, deleteWorkout, setReps, getRepsForDate, getSeriesForChart],
  );
}
