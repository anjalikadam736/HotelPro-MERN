import { useState, useEffect } from 'react';
import {
  Users,
  BedDouble,
  CalendarDays,
  CheckCircle,
  LayoutDashboard,
  Plus,
  Trash2,
  Edit,
  Search,
  Shield,
  FileText,
  DollarSign,
  TrendingUp,
  Percent
} from 'lucide-react';
import api from '../api';
import { money, dateOnly, formatDatePretty, calculateNights } from '../utils';
import EditRoomModal from '../components/EditRoomModal';
import InvoiceModal from '../components/InvoiceModal';
import { toast } from 'react-toastify';

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active sub-tab in admin console
  const [adminTab, setAdminTab] = useState('inventory'); // 'inventory' | 'users' | 'bookings'

  // Add room form state
  const [roomForm, setRoomForm] = useState({
    name: '',
    category: 'Standard',
    description: '',
    pricePerNight: '',
    capacity: 2,
    imageUrl: '',
    amenities: 'High-speed Wi-Fi, Air conditioning, Smart TV'
  });
  const [addBusy, setAddBusy] = useState(false);

  // Modals state
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);

  // Search filters
  const [userSearch, setUserSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');

  const loadAdminData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/rooms', { params: { status: 'all' } }),
      api.get('/bookings')
    ])
      .then(([sRes, uRes, rRes, bRes]) => {
        setStats(sRes.data.stats);
        setUsers(uRes.data.users || []);
        setRooms(rRes.data.rooms || []);
        setBookings(bRes.data.bookings || []);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Could not load admin console');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    setAddBusy(true);

    try {
      await api.post('/rooms', {
        ...roomForm,
        pricePerNight: Number(roomForm.pricePerNight),
        capacity: Number(roomForm.capacity),
        amenities: roomForm.amenities.split(',').map((s) => s.trim()).filter(Boolean)
      });
      toast.success('New room added to property inventory!');
      setRoomForm({
        name: '',
        category: 'Standard',
        description: '',
        pricePerNight: '',
        capacity: 2,
        imageUrl: '',
        amenities: 'High-speed Wi-Fi, Air conditioning, Smart TV'
      });
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add room');
    } finally {
      setAddBusy(false);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm('Are you certain you want to permanently delete this room?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Room successfully removed');
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete room');
    }
  };

  const handleUserRoleChange = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      toast.success('User authorization role updated');
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this user account?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User account removed');
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete user account');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const filteredBookings = bookings.filter((b) => {
    if (!bookingSearch.trim()) return true;
    const q = bookingSearch.toLowerCase();
    return (
      (b.user?.name || '').toLowerCase().includes(q) ||
      (b.user?.email || '').toLowerCase().includes(q) ||
      (b.room?.name || '').toLowerCase().includes(q) ||
      String(b._id).toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="loading page-space">Loading executive control console...</div>;
  }

  return (
    <main className="container page-space">
      <div className="eyebrow dark">HOTELPRO CONTROL CENTRE</div>
      <h1 className="page-title">
        Executive <em>Admin Overview</em>
      </h1>
      <p className="page-subtitle">
        Holistic operational performance, property asset management, and user security.
      </p>

      {/* STATS METRIC CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <span><Users size={19} /></span>
          <small>Total Users</small>
          <strong>{stats?.users ?? 0}</strong>
        </div>

        <div className="stat-card">
          <span><BedDouble size={19} /></span>
          <small>Total Rooms</small>
          <strong>{stats?.rooms ?? 0}</strong>
        </div>

        <div className="stat-card">
          <span><CalendarDays size={19} /></span>
          <small>Total Bookings</small>
          <strong>{stats?.bookings ?? 0}</strong>
        </div>

        <div className="stat-card">
          <span><CheckCircle size={19} /></span>
          <small>Active Stays</small>
          <strong>{stats?.activeBookings ?? 0}</strong>
        </div>

        <div className="stat-card">
          <span><DollarSign size={19} /></span>
          <small>Recorded Revenue</small>
          <strong style={{ fontSize: '20px' }}>{money(stats?.revenue)}</strong>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="tab-row" style={{ marginBottom: '25px' }}>
        <button
          type="button"
          className={`tab-btn ${adminTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setAdminTab('inventory')}
        >
          <BedDouble size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Room Inventory ({rooms.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${adminTab === 'users' ? 'active' : ''}`}
          onClick={() => setAdminTab('users')}
        >
          <Users size={14} style={{ display: 'inline', marginRight: '6px' }} />
          User Management ({users.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${adminTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setAdminTab('bookings')}
        >
          <CalendarDays size={14} style={{ display: 'inline', marginRight: '6px' }} />
          All Reservations ({bookings.length})
        </button>
      </div>

      {/* TAB 1: INVENTORY & ADD ROOM */}
      {adminTab === 'inventory' && (
        <>
          <div className="admin-columns" style={{ marginBottom: '35px' }}>
            <section className="panel span-two">
              <h2><Plus size={20} /> Add New Room / Suite</h2>
              <form className="admin-form" onSubmit={handleAddRoom}>
                <label>
                  Room Name
                  <input
                    required
                    maxLength={100}
                    placeholder="e.g. Penthouse Panorama 401"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  />
                </label>

                <label>
                  Category
                  <select
                    value={roomForm.category}
                    onChange={(e) => setRoomForm({ ...roomForm, category: e.target.value })}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Family">Family</option>
                  </select>
                </label>

                <label>
                  Nightly Rate (₹)
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 4500"
                    value={roomForm.pricePerNight}
                    onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                  />
                </label>

                <label>
                  Guest Capacity
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                  />
                </label>

                <label className="span-two">
                  Photo URL
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={roomForm.imageUrl}
                    onChange={(e) => setRoomForm({ ...roomForm, imageUrl: e.target.value })}
                  />
                </label>

                <label className="span-two">
                  Amenities (Comma separated)
                  <input
                    type="text"
                    placeholder="Wi-Fi, Balcony, Mini bar, Smart TV, Free Breakfast"
                    value={roomForm.amenities}
                    onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                  />
                </label>

                <label className="span-two">
                  Description
                  <textarea
                    rows="2"
                    placeholder="Describe the aesthetic, view, bed configurations, and layout..."
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  />
                </label>

                <button className="btn-primary-custom full-width span-two" type="submit" disabled={addBusy}>
                  {addBusy ? 'Adding Room...' : 'Publish Room to Inventory'}
                  <Plus size={16} />
                </button>
              </form>
            </section>
          </div>

          <section className="panel">
            <h2><BedDouble size={20} /> Current Inventory ({rooms.length} Rooms)</h2>
            <div className="table-responsive">
              <table className="table booking-table">
                <thead>
                  <tr>
                    <th>Room Name</th>
                    <th>Category</th>
                    <th>Rate / Night</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <strong>{r.name}</strong>
                        <small>{(r.amenities || []).slice(0, 3).join(', ')}</small>
                      </td>
                      <td>{r.category}</td>
                      <td>{money(r.pricePerNight)}</td>
                      <td>{r.capacity} Guests</td>
                      <td>
                        <span className={`status status-${r.status}`}>{r.status}</span>
                      </td>
                      <td>
                        <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-outline-small"
                            onClick={() => setEditingRoom(r)}
                            title="Edit room specifications"
                          >
                            <Edit size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-outline-small btn-outline-danger"
                            onClick={() => handleDeleteRoom(r._id)}
                            title="Delete room"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {adminTab === 'users' && (
        <section className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}><Users size={20} /> Platform Accounts ({users.length})</h2>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#889189' }} />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: '6px',
                  border: '1px solid #d5dad4',
                  fontSize: '12.5px'
                }}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table booking-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Contact Email</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th>Member Since</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="user-avatar-circle" style={{ width: '28px', height: '28px', fontSize: '11px' }}>
                          {u.name ? u.name[0].toUpperCase() : 'U'}
                        </div>
                        <strong>{u.name}</strong>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleUserRoleChange(u._id, e.target.value)}
                        style={{ padding: '5px 8px', borderRadius: '5px', fontSize: '12px' }}
                      >
                        <option value="guest">Guest</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{formatDatePretty(u.createdAt)}</td>
                    <td>
                      <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="icon-delete"
                          onClick={() => handleDeleteUser(u._id)}
                          title="Remove user account"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: ALL RESERVATIONS */}
      {adminTab === 'bookings' && (
        <section className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}><CalendarDays size={20} /> All Property Bookings ({bookings.length})</h2>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#889189' }} />
              <input
                type="text"
                placeholder="Search guest, room, or ID..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: '6px',
                  border: '1px solid #d5dad4',
                  fontSize: '12.5px'
                }}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table booking-table">
              <thead>
                <tr>
                  <th>Booking Reference</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Stay Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th style={{ textAlign: 'right' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>#{String(b._id).slice(-8).toUpperCase()}</strong>
                      <small>{formatDatePretty(b.createdAt)}</small>
                    </td>
                    <td>
                      <strong>{b.user?.name || 'Guest'}</strong>
                      <small>{b.user?.email}</small>
                    </td>
                    <td>
                      <strong>{b.room?.name || 'Room Removed'}</strong>
                      <small>{b.room?.category}</small>
                    </td>
                    <td>
                      {dateOnly(b.checkIn)} – {dateOnly(b.checkOut)}
                    </td>
                    <td>
                      <strong>{money(b.totalAmount)}</strong>
                    </td>
                    <td>
                      <span className={`status status-${b.status}`}>{b.status}</span>
                    </td>
                    <td>
                      <span className={`status status-${b.paymentStatus || 'unpaid'}`}>
                        {b.paymentStatus || 'unpaid'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-outline-small"
                        onClick={() => setSelectedBookingForInvoice(b)}
                      >
                        <FileText size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* EDIT ROOM MODAL */}
      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSuccess={loadAdminData}
        />
      )}

      {/* INVOICE MODAL */}
      {selectedBookingForInvoice && (
        <InvoiceModal
          booking={selectedBookingForInvoice}
          onClose={() => setSelectedBookingForInvoice(null)}
        />
      )}
    </main>
  );
}
