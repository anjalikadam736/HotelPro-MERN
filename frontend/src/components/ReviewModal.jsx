import { useState } from 'react';
import { X, Star } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

export default function ReviewModal({ room, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please select a star rating');
    setBusy(true);

    try {
      await api.post(`/reviews/room/${room._id}`, {
        rating,
        comment
      });
      toast.success('Thank you for sharing your review!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Review Your Stay</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div>
              <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>{room.name}</strong>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#7a827b' }}>{room.category} Room</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#59655c', textTransform: 'uppercase' }}>
                Your Rating
              </span>
              <div className="star-selector" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      type="button"
                      key={star}
                      className={`star-btn ${isFilled ? 'active' : ''}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onClick={() => setRating(star)}
                    >
                      <Star size={28} fill={isFilled ? '#f59e0b' : 'none'} color={isFilled ? '#f59e0b' : '#cbd5e1'} />
                    </button>
                  );
                })}
                <span style={{ fontSize: '13px', fontWeight: '600', marginLeft: '6px', color: 'var(--ink)' }}>
                  {hoverRating || rating} / 5 Stars
                </span>
              </div>
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#59655c', textTransform: 'uppercase' }}>
              Your Feedback
              <textarea
                rows="4"
                maxLength="1000"
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell other travelers about your stay, room cleanliness, service, and experience..."
                style={{
                  border: '1px solid #d5dad4',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  fontFamily: 'inherit'
                }}
              />
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline-small" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-custom" disabled={busy}>
              {busy ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
