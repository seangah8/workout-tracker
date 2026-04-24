import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function NavBar() {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="navbar">
      <span className="navbar-brand">WorkoutTracker</span>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          Workouts
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => (isActive ? 'active' : '')}>
          Calendar
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => (isActive ? 'active' : '')}>
          Progress
        </NavLink>
      </div>
      <div className="navbar-user">
        <span className="navbar-username">{currentUser?.username}</span>
        <button onClick={logout} className="btn-logout">Log out</button>
      </div>
    </nav>
  );
}
