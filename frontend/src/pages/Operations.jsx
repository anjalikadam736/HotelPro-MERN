import { useState, useEffect } from 'react';
import {
  ClipboardList,
  BedDouble,
  Search,
  CheckCircle,
  LogOut,
  CreditCard,
  FileText,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import api from '../api';
import { money, dateOnly, calculateNights } from '../utils';
import InvoiceModal from '../components/InvoiceModal';
import PaymentModal from '../components/PaymentModal';
import { toast } from 'react-toastify';

export default function Operations() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);
  const [selectedBookingForPay, setSelectedBookingForPay] = useState(null);

  const loadData = () => {
    setLoading(true);
    // Fetch all rooms (status=all) and all bookings
    Promise.all([
      api.get('/bookings', { params: { search, status: statusFilter } }),
      api.get('/rooms', { params: { status: 'all' } })
    ])
      .then(([bRes, rRes]) => {
        setBookings(bRes.data.bookings || []);
        setRooms(rRes.data.rooms || []);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Could not load front desk operations');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  const handleBookingStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      toast.success(`Booking status changed to ${status}`);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const handleRoomStatusChange = async (roomId, newStatus) => {
    try {
      await api.patch(`/rooms/${roomId}`, { status: newStatus });
      toast.success('Room status updated successfully');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update room status');
    }
  };

  // Status counts for rooms
  const availableCount = rooms.filter((r) => r.status === 'available').length;
  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'maintenance').length;

  return (
    <main className="container page-space">
      <div className="eyebrow dark">FRONT DESK & CONCIERGE</div>
      <h1 className="page-title">
        Hotel <em>Operations</em>
      </h1>
      <p className="page-subtitle">
        Coordinate guest arrivals, manage room housekeeping statuses, and record desk transactions.
      </p>

      {/* SEARCH & FILTERS */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '25px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#889189' }} />
          <input
            type="text"
            placeholder="Search by guest name, email, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #d5dad4',
              fontSize: '13px'
            }}
          />
        </div>

        <div className="tab-row" style={{ margin: 0, padding: 0, border: 0 }}>
          {['all', 'confirmed', 'checked-in', 'checked-out', 'cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`tab-btn ${statusFilter === tab ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* RESERVATIONS TABLE */}
      {loading ? (
        <div className="loading">Syncing reservations...</div>
      ) : (
        <>
          <div className="table-wrap table-responsive" style={{ marginBottom: '50px' }}>
            <table className="table booking-table">
              <thead>
                <tr>
                  <th>Guest Information</th>
                  <th>Room Assigned</th>
                  <th>Stay Period</th>
                  <th>Billing & Payment</th>
                  <th>Booking Status</th>
                  <th style={{ textAlign: 'right' }}>Front Desk Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '35px 20px', color: '#7a837c' }}>
                      No reservations match the search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => {
                    const nights = calculateNights(b.checkIn, b.checkOut);
                    return (
                      <tr key={b._id}>
                        <td>
                          <strong>{b.user?.name || 'Guest'}</strong>
                          <small>{b.user?.email || 'No email'}</small>
                          {b.user?.phone && <small>📞 {b.user.phone}</small>}
                        </td>

                        <td>
                          <strong>{b.room?.name || 'Room Removed'}</strong>
                          <small>{b.room?.category} Room</small>
                          {b.specialRequests && (
                            <small style={{ color: '#9c6f2a', fontStyle: 'italic', marginTop: '4px' }}>
                              Note: "{b.specialRequests}"
                            </small>
                          )}
                        </td>

                        <td>
                          <strong>{dateOnly(b.checkIn)}</strong>
                          <small>to {dateOnly(b.checkOut)} ({nights} {nights === 1 ? 'night' : 'nights'})</small>
                        </td>

                        <td>
                          <strong>{money(b.totalAmount)}</strong>
                          <span className={`status status-${b.paymentStatus || 'unpaid'}`} style={{ marginLeft: '6px' }}>
                            {b.paymentStatus || 'unpaid'}
                          </span>
                        </td>

                        <td>
                          <span className={`status status-${b.status}`}>
                            {b.status}
                          </span>
                        </td>

                        <td>
                          <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                            {/* CHECK-IN */}
                            {b.status === 'confirmed' && (
                              <button
                                type="button"
                                className="btn-outline-small btn-outline-success"
                                onClick={() => handleBookingStatus(b._id, 'checked-in')}
                              >
                                <CheckCircle size={13} /> Check In
                              </button>
                            )}

                            {/* CHECK-OUT */}
                            {b.status === 'checked-in' && (
                              <button
                                type="button"
                                className="btn-outline-small btn-outline-danger"
                                onClick={() => handleBookingStatus(b._id, 'checked-out')}
                              >
                                <LogOut size={13} /> Check Out
                              </button>
                            )}

                            {/* COLLECT PAYMENT */}
                            {b.paymentStatus !== 'paid' && b.status !== 'cancelled' && (
                              <button
                                type="button"
                                className="btn-outline-small"
                                onClick={() => setSelectedBookingForPay(b)}
                              >
                                <CreditCard size={13} /> Collect Pay
                              </button>
                            )}

                            {/* INVOICE */}
                            <button
                              type="button"
                              className="btn-outline-small"
                              onClick={() => setSelectedBookingForInvoice(b)}
                            >
                              <FileText size={13} /> Receipt
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ROOM STATUS INVENTORY BOARD */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 className="subsection-title" style={{ margin: 0 }}>
                <BedDouble size={22} /> Property Room Inventory Status
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#757e77' }}>
                Instant real-time room availability and housekeeping tracker.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <span className="status status-available">
                Available: {availableCount}
              </span>
              <span className="status status-occupied">
                Occupied: {occupiedCount}
              </span>
              <span className="status status-maintenance">
                Maintenance: {maintenanceCount}
              </span>
            </div>
          </div>

          <div className="room-status-grid">
            {rooms.map((r) => (
              <div className="room-status-card" key={r._id}>
                <div>
                  <strong style={{ fontSize: '13.5px' }}>{r.name}</strong>
                  <small>
                    {r.category} • {money(r.pricePerNight)}/night • Max {r.capacity} guests
                  </small>
                </div>

                <select
                  value={r.status}
                  onChange={(e) => handleRoomStatusChange(r._id, e.target.value)}
                  style={{
                    backgroundColor:
                      r.status === 'available'
                        ? '#ecfdf5'
                        : r.status === 'occupied'
                        ? '#fef2f2'
                        : '#fffbeb',
                    borderColor:
                      r.status === 'available'
                        ? '#a7f3d0'
                        : r.status === 'occupied'
                        ? '#fecaca'
                        : '#fde68a',
                    fontWeight: '600'
                  }}
                >
                  <option value="available">🟢 Available</option>
                  <option value="occupied">🔴 Occupied</option>
                  <option value="maintenance">🟡 Maintenance</option>
                </select>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODALS */}
      {selectedBookingForInvoice && (
        <InvoiceModal
          booking={selectedBookingForInvoice}
          onClose={() => setSelectedBookingForInvoice(null)}
        />
      )}

      {selectedBookingForPay && (
        <PaymentModal
          booking={selectedBookingForPay}
          onClose={() => setSelectedBookingForPay(null)}
          onSuccess={() => {
            loadData();
            setSelectedBookingForPay(null);
          }}
        />
      )}
    </main>
  );
}
