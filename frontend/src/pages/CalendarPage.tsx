import { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useWorkouts } from '../hooks/useWorkouts';
import type { WorkoutEntry } from '../types';

type CalendarValue = Date | null | [Date | null, Date | null];

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function CalendarPage() {
  const { workouts, entries, setReps } = useWorkouts();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [localReps, setLocalReps] = useState<Record<string, string>>({});

  const dateStr = formatDate(selectedDate);
  const entriesRef = useRef<WorkoutEntry[]>(entries);
  entriesRef.current = entries;

  useEffect(() => {
    const initial: Record<string, string> = {};
    workouts.forEach((w) => {
      const entry = entriesRef.current.find((e) => e.workoutId === w.id && e.date === dateStr);
      initial[w.id] = entry ? String(entry.reps) : '';
    });
    setLocalReps(initial);
  // entriesRef.current is intentionally excluded — we only reinitialize on date/workout changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr, workouts]);

  const handleDateChange = (val: CalendarValue) => {
    const date = Array.isArray(val) ? val[0] : val;
    if (date instanceof Date) setSelectedDate(date);
  };

  const handleRepsChange = (workoutId: string, value: string) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setLocalReps((prev) => ({ ...prev, [workoutId]: value }));
  };

  const handleRepsBlur = (workoutId: string, value: string) => {
    const num = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(num)) void setReps(workoutId, dateStr, num);
  };

  const displayDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="page">
      <h1>Log Workouts</h1>
      <div className="calendar-layout">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;
            const ds = formatDate(date);
            return entries.some((e) => e.date === ds) ? <div className="cal-dot" /> : null;
          }}
        />
        <div className="reps-section">
          <h2 className="reps-date">{displayDate}</h2>
          {workouts.length === 0 ? (
            <p className="empty-state">No workouts defined yet. Add some on the Workouts page first.</p>
          ) : (
            <table className="reps-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Reps</th>
                </tr>
              </thead>
              <tbody>
                {workouts.map((w) => (
                  <tr key={w.id}>
                    <td>{w.name}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={localReps[w.id] ?? ''}
                        onChange={(e) => handleRepsChange(w.id, e.target.value)}
                        onBlur={(e) => handleRepsBlur(w.id, e.target.value)}
                        placeholder="—"
                        className="reps-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
