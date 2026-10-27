import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight, Users } from 'lucide-react';
import { money } from '../utils';

export default function RoomCard({ room }) {
  const navigate = useNavigate();

  const fallbackImages = {
    Standard: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85',
    Deluxe: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=85',
    Suite: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=85',
    Family: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=85'
  };

  const imageSrc = room.imageUrl || fallbackImages[room.category] || fallbackImages.Standard;
  const ratingValue = room.avgRating || 4.8;
  const reviewCount = room.reviewCount || 0;

  return (
    <article className="room-card">
      <div className="room-image" style={{ backgroundImage: `url("${imageSrc}")` }}>
        <span className="room-category">{room.category}</span>
        {room.status && room.status !== 'available' && (
          <span className={`status status-${room.status} room-status-badge`}>
            {room.status}
          </span>
        )}
      </div>

      <div className="room-card-body">
        <div className="room-title-row">
          <h3>{room.name}</h3>
          <span className="rating" title={`${ratingValue} out of 5 stars`}>
            <Star size={14} fill="currentColor" /> {ratingValue}
            {reviewCount > 0 && <small style={{ color: '#88918a', fontWeight: '400' }}>({reviewCount})</small>}
          </span>
        </div>

        <p>{room.description || 'A welcoming room designed for maximum comfort and relaxation.'}</p>

        <div className="amenities">
          {(room.amenities && room.amenities.length > 0
            ? room.amenities
            : ['High-speed Wi-Fi', 'Air conditioning', 'Smart TV']
          ).slice(0, 3).map((amenity) => (
            <span key={amenity}>{amenity}</span>
          ))}
          {room.amenities && room.amenities.length > 3 && (
            <span>+{room.amenities.length - 3} more</span>
          )}
        </div>

        <div className="room-card-bottom">
          <div>
            <strong>{money(room.pricePerNight)}</strong>
            <small> / night · up to {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'}</small>
          </div>
          <button
            type="button"
            className="circle-arrow"
            onClick={() => navigate(`/rooms/${room._id}`)}
            aria-label={`View details of ${room.name}`}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
