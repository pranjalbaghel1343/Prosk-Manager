import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-logo">
        <div className="navbar-logo-icon">📋</div>
        <span className="navbar-logo-text">Prosk<span>Manager</span></span>
      </Link>

      <div className="navbar-right">
        {user && (
          <div className="navbar-user">
            <div className="navbar-avatar">{initials}</div>
          </div>
        )}
        <button
          id="logout-btn"
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          title="Logout"
        >
          ⎋ Logout
        </button>
      </div>
    </nav>
  );
}
