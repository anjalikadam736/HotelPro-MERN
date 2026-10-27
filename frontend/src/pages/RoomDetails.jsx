import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Star,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  MessageSquare
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { money, dateOnly, formatDatePretty, calculateNights } from '../utils';
import ReviewModal from '../components/ReviewModal';
import { toast } from 'react-toastify';

export default function RoomDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking form
  const [checkIn, setCheckIn] = useState(dateOnly(new Date(Date.now() + 86400000)));
  const [checkOut, setCheckOut] = useState(dateOnly(new Date(Date.now() + 3 * 86400000)));
  const [guests, setGuests] = useState(1);
  const [requests, setRequests] = useState('');
  const [bookingBusy, setBookingBusy] = useState(false);

  // Review modal
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchRoom = () => {
    api.get(`/rooms/${id}`)
      .then((res) => {
        setRoom(res.data.room);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Room not found');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const nights = calculateNights(checkIn, checkOut);
  const totalPrice = room ? nights * room.pricePerNight : 0;

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in or create an account to book this room');
      return navigate('/login');
    }

    if (user.role !== 'guest') {
      return toast.error('Staff and Admin accounts cannot book rooms. Sign in as a guest.');
    }

    if (checkOut <= checkIn) {
      return toast.error('Check-out date must be strictly after check-in date');
    }

    setBookingBusy(true);
    try {
      await api.post('/bookings', {
        roomId: room._id,
        checkIn,
        checkOut,
        guests: Number(guests),
        specialRequests: requests
      });

      toast.success('Your reservation has been confirmed!');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingBusy(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      toast.success('Review removed');
      fetchRoom();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete review');
    }
  };

  if (loading) {
    return <div className="loading page-space">Loading suite details...</div>;
  }

  if (!room) {
    return (
      <div className="page-space container empty-state">
        <h2>Room Not Found</h2>
        <p>The requested room could not be located or may have been archived.</p>
        <button className="btn-primary-custom" onClick={() => navigate('/rooms')}>
          Back to all rooms
        </button>
      </div>
    );
  }

  const fallbackImages = {
    Standard: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85',
    Deluxe: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85',
    Suite: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=85',
    Family: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=85'
  };

  const imageSrc = room.imageUrl || fallbackImages[room.category] || fallbackImages.Standard;

  return (
    <main className="container page-space detail-grid">
      {/* LEFT COLUMN: ROOM DETAILS & REVIEWS */}
      <div>
        <div className="detail-image" style={{ backgroundImage: `url("${imageSrc}")` }}></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span className="room-category detail-badge">{room.category}</span>
          <span className={`status status-${room.status}`}>{room.status}</span>
          <span className="rating" style={{ fontSize: '13px' }}>
            <Star size={15} fill="currentColor" /> {room.avgRating || 4.8} ({room.reviewCount || 0} reviews)
          </span>
        </div>

        <h1 className="page-title">{room.name}</h1>
        <p className="page-subtitle" style={{ fontSize: '15px' }}>
          {room.description || 'A thoughtfully designed suite curated for rest, rejuvenation, and comfort.'}
        </p>

        {/* AMENITIES */}
        <h3 className="small-heading">Room Amenities</h3>
        <div className="amenities detail-amenities">
          {(room.amenities && room.amenities.length > 0
            ? room.amenities
            : ['High-speed Wi-Fi', 'Air conditioning', 'Smart TV', 'Daily Housekeeping', 'Bathrobes & Slippers']
          ).map((amenity) => (
            <span key={amenity}>
              <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '6px', color: 'var(--green)' }} />
              {amenity}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#68736b', fontSize: '13px', margin: '15px 0 30px' }}>
          <Users size={16} /> Accommodates up to <strong>{room.capacity} guests</strong>
        </div>

        {/* REVIEWS SECTION */}
        <section className="reviews-section">
          <div className="reviews-header">
            <div>
              <div className="eyebrow dark">GUEST REPUTATION</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', margin: '6px 0 0', color: 'var(--ink)' }}>
                Guest Experiences
              </h2>
            </div>

            {user && user.role === 'guest' && (
              <button
                type="button"
                className="btn-primary-custom"
                onClick={() => setShowReviewModal(true)}
              >
                <MessageSquare size={15} /> Write a Review
              </button>
            )}
          </div>

          <div className="rating-overview">
            <div className="rating-big-score">
              {room.avgRating || 4.8}
              <small>OUT OF 5.0</small>
            </div>
            <div style={{ flex: 1, borderLeft: '1px solid #e7e6dc', paddingLeft: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b4833e', marginBottom: '4px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(room.avgRating || 4.8) ? 'currentColor' : 'none'}
                    color="currentColor"
                  />
                ))}
              </div>
              <span style={{ fontSize: '13px', color: '#576259' }}>
                Based on <strong>{room.reviewCount || 0}</strong> verified guest reviews
              </span>
            </div>
          </div>

          {/* REVIEWS LIST */}
          {room.reviews && room.reviews.length > 0 ? (
            <div className="review-cards-list">
              {room.reviews.map((rev) => {
                const isAuthor = user && (user.id === rev.user?._id || user._id === rev.user?._id);
                const isAdmin = user && user.role === 'admin';

                return (
                  <div className="review-card-item" key={rev._id}>
                    <div className="review-card-header">
                      <div className="review-user-info">
                        <div className="user-avatar-circle">
                          {rev.user?.name ? rev.user.name[0].toUpperCase() : 'G'}
                        </div>
                        <div>
                          <strong style={{ fontSize: '13.5px', color: 'var(--ink)', display: 'block' }}>
                            {rev.user?.name || 'Verified Guest'}
                          </strong>
                          <small style={{ color: '#889088', fontSize: '11px' }}>
                            {formatDatePretty(rev.createdAt)}
                          </small>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="rating" style={{ fontSize: '12px' }}>
                          <Star size={14} fill="currentColor" /> {rev.rating}/5
                        </div>
                        {(isAuthor || isAdmin) && (
                          <button
                            type="button"
                            className="icon-delete"
                            onClick={() => handleDeleteReview(rev._id)}
                            title="Delete review"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="review-comment">{rev.comment}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '24px', background: '#faf9f5', border: '1px dashed #d8dcd5', borderRadius: '8px', textAlign: 'center', color: '#7a837c' }}>
              <p style={{ margin: 0, fontSize: '13px' }}>
                No reviews posted yet for this suite. Be the first to share your experience!
              </p>
            </div>
          )}
        </section>
      </div>

      {/* RIGHT COLUMN: BOOKING BOX */}
      <aside>
        <form className="booking-box" onSubmit={handleBooking}>
          <div className="booking-price">
            <strong>{money(room.pricePerNight)}</strong>
            <span> / night</span>
          </div>

          <h3 style={{ margin: '0 0 2px' }}>Make it your stay</h3>
          <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#7b837c' }}>
            Instant reservation with free cancellation.
          </p>

          <label>
            CHECK-IN DATE
            <input
              type="date"
              required
              min={dateOnly(new Date())}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </label>

          <label>
            CHECK-OUT DATE
            <input
              type="date"
              required
              min={checkIn || dateOnly(new Date())}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </label>

          <label>
            GUESTS
            <select value={guests} onChange={(e) => setGuests(e.target.value)}>
              {Array.from({ length: room.capacity }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </label>

          <label>
            SPECIAL REQUESTS (OPTIONAL)
            <textarea
              rows="3"
              maxLength="500"
              value={requests}
              onChange={(e) => setRequests(e.target.value)}
              placeholder="E.g., early arrival, quiet room, baby cot, dietary preferences..."
            />
          </label>

          {/* PRICE CALCULATION SUMMARY */}
          <div className="booking-calc-summary">
            <div className="booking-calc-row">
              <span>{money(room.pricePerNight)} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
              <span>{money(totalPrice)}</span>
            </div>
            <div className="booking-calc-row">
              <span>Hotel taxes & booking fees</span>
              <span>Included</span>
            </div>
            <div className="booking-calc-row total">
              <span>Estimated Total</span>
              <span>{money(totalPrice)}</span>
            </div>
          </div>

          <button
            className="btn-primary-custom full-width"
            type="submit"
            disabled={bookingBusy || room.status !== 'available'}
          >
            {bookingBusy
              ? 'Securing Suite...'
              : room.status !== 'available'
              ? 'Currently Unavailable'
              : 'Reserve Room'}
            <ArrowRight size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#7a837c', fontSize: '11px' }}>
            <ShieldCheck size={14} color="var(--green)" />
            <span>Guaranteed best rate • Safe & secure reservation</span>
          </div>
        </form>
      </aside>

      {/* REVIEW MODAL */}
      {showReviewModal && (
        <ReviewModal
          room={room}
          onClose={() => setShowReviewModal(false)}
          onSuccess={fetchRoom}
        />
      )}
    </main>
  );
}
