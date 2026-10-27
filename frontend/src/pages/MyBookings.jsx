import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CreditCard,
  FileText,
  Star,
  Ban,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import api from '../api';
import { money, dateOnly, calculateNights } from '../utils';
import PaymentModal from '../components/PaymentModal';
import InvoiceModal from '../components/InvoiceModal';
import ReviewModal from '../components/ReviewModal';
import { toast } from 'react-toastify';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');

  // Modals state
  const [selectedBookingForPay, setSelectedBookingForPay] = useState(null);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState(null);
  const [selectedRoomForReview, setSelectedRoomForReview] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings/mine')
      .then((res) => {
        setBookings(res.data.bookings || []);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Could not load your reservations');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this reservation? If paid, a refund will be processed.')) {
      return;
    }

    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success('Reservation cancelled successfully');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterTab === 'all') return true;
    return b.status === filterTab;
  });

  return (
    <main className="container page-space">
      <div className="eyebrow dark">YOUR JOURNEY</div>
      <h1 className="page-title">
        My <em>Reservations</em>
      </h1>
      <p className="page-subtitle">
        Review upcoming arrivals, download receipts, and manage stay details.
      </p>

      {/* FILTER TABS */}
      <div className="tab-row">
        {['all', 'confirmed', 'checked-in', 'checked-out', 'cancelled'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-btn ${filterTab === tab ? 'active' : ''}`}
            onClick={() => setFilterTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'all' ? ` (${bookings.length})` : ` (${bookings.filter((x) => x.status === tab).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading your reservations...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="empty-state">
          <CalendarDays size={36} color="var(--green)" />
          <h3>No reservations found</h3>
          <p>
            {filterTab === 'all'
              ? 'You have not booked any stays yet. Explore our luxury rooms.'
              : `No reservations with status "${filterTab}".`}
          </p>
          <Link className="btn-primary-custom" to="/rooms">
            Explore Rooms
          </Link>
        </div>
      ) : (
        <div className="table-wrap table-responsive">
          <table className="table booking-table">
            <thead>
              <tr>
                <th>Accommodation</th>
                <th>Stay Dates</th>
                <th>Guests</th>
                <th>Total Price</th>
                <th>Booking Status</th>
                <th>Payment</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const nights = calculateNights(b.checkIn, b.checkOut);
                const isPaid = b.paymentStatus === 'paid';
                const canPay = !isPaid && b.status !== 'cancelled';
                const canCancel = b.status === 'confirmed';

                return (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.room?.name || 'Room Archived'}</strong>
                      <small>{b.room?.category} Suite</small>
                    </td>

                    <td>
                      <strong>{dateOnly(b.checkIn)}</strong>
                      <small>to {dateOnly(b.checkOut)} ({nights} {nights === 1 ? 'night' : 'nights'})</small>
                    </td>

                    <td>{b.guests} {b.guests === 1 ? 'Guest' : 'Guests'}</td>

                    <td>
                      <strong>{money(b.totalAmount)}</strong>
                    </td>

                    <td>
                      <span className={`status status-${b.status}`}>
                        {b.status}
                      </span>
                    </td>

                    <td>
                      <span className={`status status-${b.paymentStatus || 'unpaid'}`}>
                        {b.paymentStatus || 'unpaid'}
                      </span>
                    </td>

                    <td>
                      <div className="action-cell" style={{ justifyContent: 'flex-end' }}>
                        {/* PAY NOW */}
                        {canPay && (
                          <button
                            type="button"
                            className="btn-outline-small btn-outline-success"
                            onClick={() => setSelectedBookingForPay(b)}
                          >
                            <CreditCard size={13} /> Pay Now
                          </button>
                        )}

                        {/* VIEW INVOICE */}
                        <button
                          type="button"
                          className="btn-outline-small"
                          onClick={() => setSelectedBookingForInvoice(b)}
                          title="View Receipt and Tax Invoice"
                        >
                          <FileText size={13} /> Invoice
                        </button>

                        {/* REVIEW STAY */}
                        {b.room && b.status !== 'cancelled' && (
                          <button
                            type="button"
                            className="btn-outline-small"
                            onClick={() => setSelectedRoomForReview(b.room)}
                            title="Rate & Review Suite"
                          >
                            <Star size={13} /> Review
                          </button>
                        )}

                        {/* CANCEL BOOKING */}
                        {canCancel && (
                          <button
                            type="button"
                            className="btn-outline-small btn-outline-danger"
                            onClick={() => handleCancelBooking(b._id)}
                          >
                            <Ban size={13} /> Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {selectedBookingForPay && (
        <PaymentModal
          booking={selectedBookingForPay}
          onClose={() => setSelectedBookingForPay(null)}
          onSuccess={() => {
            fetchBookings();
            setSelectedBookingForPay(null);
          }}
        />
      )}

      {/* INVOICE MODAL */}
      {selectedBookingForInvoice && (
        <InvoiceModal
          booking={selectedBookingForInvoice}
          onClose={() => setSelectedBookingForInvoice(null)}
        />
      )}

      {/* REVIEW MODAL */}
      {selectedRoomForReview && (
        <ReviewModal
          room={selectedRoomForReview}
          onClose={() => setSelectedRoomForReview(null)}
          onSuccess={() => {
            fetchBookings();
            setSelectedRoomForReview(null);
          }}
        />
      )}
    </main>
  );
}
