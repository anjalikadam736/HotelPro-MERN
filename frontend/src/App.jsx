import { Routes, Route, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import Operations from './pages/Operations';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

function Protected({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading page-space">Loading your account...</div>;
  }

  if (!user) {
    return (
      <div className="page-space container">
        <div className="empty-state">
          <ShieldCheck size={36} color="var(--green)" />
          <h3>Authentication Required</h3>
          <p>Please sign in to access this page.</p>
          <Link className="btn-primary-custom" to="/login">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="page-space container">
        <div className="empty-state">
          <ShieldCheck size={36} color="var(--danger)" />
          <h3>Access Restricted</h3>
          <p>Your account ({user.role}) does not have permission to access this area.</p>
          <Link className="btn-primary-custom" to="/dashboard">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/rooms/:id" element={<RoomDetails />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <Protected roles={['guest']}>
              <MyBookings />
            </Protected>
          }
        />

        <Route
          path="/operations"
          element={
            <Protected roles={['staff', 'admin']}>
              <Operations />
            </Protected>
          }
        />

        <Route
          path="/admin"
          element={
            <Protected roles={['admin']}>
              <Admin />
            </Protected>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}
