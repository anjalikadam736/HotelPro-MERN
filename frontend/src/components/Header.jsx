import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Hotel, Menu, X, LogOut, ArrowRight, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';
import { toast } from 'react-toastify';

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <>
      <header className="site-header">
        <div className="container nav-wrap">
          <Link to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark">
              <Hotel size={20} />
            </span>
            hotel<span>pro</span>
          </Link>

          <button
            className="menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={open ? 'nav-links open' : 'nav-links'}>
            <NavLink to="/rooms" onClick={() => setOpen(false)}>
              Explore Rooms
            </NavLink>

            {user && (
              <NavLink to="/dashboard" onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
            )}

            {user && user.role === 'guest' && (
              <NavLink to="/my-bookings" onClick={() => setOpen(false)}>
                My Bookings
              </NavLink>
            )}

            {user && ['staff', 'admin'].includes(user.role) && (
              <NavLink to="/operations" onClick={() => setOpen(false)}>
                Front Desk
              </NavLink>
            )}

            {user?.role === 'admin' && (
              <NavLink to="/admin" onClick={() => setOpen(false)}>
                Admin
              </NavLink>
            )}

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="nav-user-badge"
                  onClick={() => {
                    setShowProfile(true);
                    setOpen(false);
                  }}
                  title="View Account Profile"
                >
                  <UserIcon size={14} />
                  <span>{user.name.split(' ')[0]}</span>
                </button>
                <button className="nav-login" onClick={handleLogout}>
                  <LogOut size={15} />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <Link className="nav-login" to="/login" onClick={() => setOpen(false)}>
                Sign in <ArrowRight size={15} />
              </Link>
            )}
          </nav>
        </div>
      </header>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
