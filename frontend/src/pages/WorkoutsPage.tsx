import { useState } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';

export function WorkoutsPage() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const { workouts, addWorkout, deleteWorkout } = useWorkouts();

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter a workout name.');
      return;
    }
    if (workouts.some((w) => w.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A workout with this name already exists.');
      return;
    }
    addWorkout(trimmed);
    setInput('');
    setError('');
  };

  return (
    <div className="page">
      <h1>My Workouts</h1>
      <div className="add-form">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="e.g. Push-ups"
          className="text-input"
        />
        <button onClick={handleAdd} className="btn-primary">
          Add
        </button>
      </div>
      {error && <p className="error-msg">{error}</p>}

      {workouts.length === 0 ? (
        <p className="empty-state">No workouts yet. Add your first exercise above.</p>
      ) : (
        <ul className="workout-list">
          {workouts.map((w) => (
            <li key={w.id} className="workout-card">
              <span className="workout-name">{w.name}</span>
              <button
                onClick={() => deleteWorkout(w.id)}
                className="btn-delete"
                aria-label={`Delete ${w.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
