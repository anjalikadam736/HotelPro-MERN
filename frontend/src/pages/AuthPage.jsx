import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hotel, ArrowRight, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Welcome back to HotelPro!');
      } else {
        await register({ name, email, password, phone });
        toast.success('Account created! Welcome to HotelPro.');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setBusy(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setBusy(true);

    try {
      await login(demoEmail, demoPassword);
      toast.success(`Signed in as ${demoEmail.split('@')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Quick login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-mark">
          <Hotel size={24} />
        </div>

        <div className="eyebrow dark">
          {mode === 'login' ? 'WELCOME BACK' : 'BEGIN YOUR STAY'}
        </div>

        <h1>{mode === 'login' ? 'Sign in to HotelPro' : 'Create an Account'}</h1>
        <p className="muted">
          {mode === 'login'
            ? 'Access your reservations, invoices, and stay preferences.'
            : 'Join HotelPro for curated luxury stays and exclusive rates.'}
        </p>

        {/* ONE-CLICK DEMO LOGIN PILLS */}
        <div className="quick-login-pills">
          <p>
            <KeyRound size={12} style={{ display: 'inline', marginRight: '4px' }} />
            One-Click Demo Accounts:
          </p>
          <div className="pills-row">
            <button
              type="button"
              className="pill-btn"
              onClick={() => handleQuickDemo('admin@hotelpro.local', 'Admin123!')}
              disabled={busy}
            >
              👑 Admin
            </button>
            <button
              type="button"
              className="pill-btn"
              onClick={() => handleQuickDemo('staff@hotelpro.local', 'Staff123!')}
              disabled={busy}
            >
              🛎️ Staff
            </button>
            <button
              type="button"
              className="pill-btn"
              onClick={() => handleQuickDemo('guest@hotelpro.local', 'Guest123!')}
              disabled={busy}
            >
              🧳 Demo Guest
            </button>
          </div>
        </div>

        {mode === 'register' && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
            Full Name
            <input
              type="text"
              required
              minLength={2}
              maxLength={80}
              placeholder="e.g. Eleanor Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
            />
          </label>
        )}

        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
          Email Address
          <input
            type="email"
            required
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
          />
        </label>

        {mode === 'register' && (
          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
            Phone Number (Optional)
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
            />
          </label>
        )}

        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
          Password
          <input
            type="password"
            required
            minLength={mode === 'register' ? 8 : 1}
            placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
          />
        </label>

        <button disabled={busy} className="btn-primary-custom full-width" type="submit">
          {busy ? 'Verifying...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          <ArrowRight size={16} />
        </button>

        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account yet? " : 'Already registered? '}
          <Link to={mode === 'login' ? '/register' : '/login'}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </Link>
        </p>
      </form>
    </main>
  );
}
