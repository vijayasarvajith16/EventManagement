import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">⚡</span>
        <Link to="/events" className="brand-name">CSEA Events</Link>
      </div>

      {user && (
        <div className="nav-links">
          <Link to="/events" className={isActive('/events')}>Events</Link>
          {isAdmin ? (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>Manage Events</Link>
              <Link to="/create-event" className={isActive('/create-event')}>+ Create Event</Link>
            </>
          ) : (
            <Link to="/dashboard" className={isActive('/dashboard')}>My Registrations</Link>
          )}
        </div>
      )}

      <div className="nav-actions">
        {user ? (
          <div className="user-menu">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={`user-role ${user.role}`}>{user.role}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="btn-nav-login">Login</Link>
            <Link to="/register" className="btn-nav-register">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
