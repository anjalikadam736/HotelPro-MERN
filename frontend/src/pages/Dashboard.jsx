import { Link } from 'react-router-dom';
import {
  CalendarDays,
  LayoutDashboard,
  BedDouble,
  ArrowRight,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <main className="container page-space">
      <div className="dashboard-welcome">
        <div>
          <div className="eyebrow dark">HOTELPRO CONCIERGE</div>
          <h1 className="page-title">
            Welcome back, <em>{user?.name?.split(' ')[0] || 'Guest'}.</em>
          </h1>
          <p className="page-subtitle">
            Manage your accommodations, invoices, and preferences seamlessly.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="role-chip">Account: {user?.role}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* GUEST SPECIFIC CARDS */}
        {user?.role === 'guest' && (
          <Link to="/my-bookings" className="dashboard-card">
            <span>
              <CalendarDays size={22} />
            </span>
            <h3>My Reservations</h3>
            <p>View confirmed bookings, download official PDF invoices, and complete payments.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontSize: '13px', fontWeight: '700' }}>
              View Stays <ArrowRight size={15} />
            </div>
          </Link>
        )}

        {/* STAFF & ADMIN CARDS */}
        {user && ['staff', 'admin'].includes(user.role) && (
          <Link to="/operations" className="dashboard-card">
            <span>
              <ClipboardList size={22} />
            </span>
            <h3>Front Desk Operations</h3>
            <p>Check guests in & out, update real-time room statuses, and collect front-desk payments.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontSize: '13px', fontWeight: '700' }}>
              Open Desk <ArrowRight size={15} />
            </div>
          </Link>
        )}

        {/* ADMIN EXCLUSIVE CARD */}
        {user?.role === 'admin' && (
          <Link to="/admin" className="dashboard-card">
            <span>
              <LayoutDashboard size={22} />
            </span>
            <h3>Executive Control Center</h3>
            <p>Manage property inventory, oversee platform revenue, and configure staff/user roles.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontSize: '13px', fontWeight: '700' }}>
              Launch Console <ArrowRight size={15} />
            </div>
          </Link>
        )}

        {/* EXPLORE ROOMS */}
        <Link to="/rooms" className="dashboard-card">
          <span>
            <BedDouble size={22} />
          </span>
          <h3>Explore Rooms & Suites</h3>
          <p>Discover our luxury collection of accommodations with real-time availability checking.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontSize: '13px', fontWeight: '700' }}>
            Browse Catalog <ArrowRight size={15} />
          </div>
        </Link>
      </div>

      {/* QUICK ASSISTANCE BANNER */}
      <div style={{ marginTop: '40px', background: '#faf9f4', border: '1px solid #e7e5dc', borderRadius: '12px', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <strong style={{ fontSize: '16px', color: 'var(--ink)' }}>Need Assistance with your stay?</strong>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#747c75' }}>
            Our 24/7 guest relations concierge team is available to assist with room upgrades and amenities.
          </p>
        </div>
        <Link to="/rooms" className="btn-outline-small">
          <Sparkles size={14} /> View Special Packages
        </Link>
      </div>
    </main>
  );
}
