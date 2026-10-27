import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  BedDouble,
  Search,
  Star,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  Coffee,
  Wifi,
  Clock
} from 'lucide-react';
import api from '../api';
import RoomCard from '../components/RoomCard';
import { dateOnly } from '../utils';
import { toast } from 'react-toastify';

export default function Home() {
  const [checkIn, setCheckIn] = useState(dateOnly(new Date(Date.now() + 86400000)));
  const [checkOut, setCheckOut] = useState(dateOnly(new Date(Date.now() + 2 * 86400000)));
  const [category, setCategory] = useState('All');
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/rooms')
      .then((res) => {
        setFeaturedRooms((res.data.rooms || []).slice(0, 3));
      })
      .catch((err) => {
        console.error('Failed to load featured rooms', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (checkOut <= checkIn) {
      return toast.error('Check-out must be after check-in date');
    }
    navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&category=${encodeURIComponent(category)}`);
  };

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <div className="eyebrow">
            <span></span> YOUR NEXT CHAPTER STARTS HERE
          </div>
          <h1>
            Stay somewhere<br />
            <em>extraordinary.</em>
          </h1>
          <p>
            Curated spaces, thoughtful bespoke service, and seamless hospitality designed for the modern traveler.
          </p>

          <form className="search-panel" onSubmit={handleSearch}>
            <label>
              <span><CalendarDays size={15} /> CHECK IN</span>
              <input
                required
                type="date"
                min={dateOnly(new Date())}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </label>

            <label>
              <span><CalendarDays size={15} /> CHECK OUT</span>
              <input
                required
                type="date"
                min={checkIn || dateOnly(new Date())}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </label>

            <label>
              <span><BedDouble size={15} /> ROOM TYPE</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="All">All Categories</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Family">Family</option>
              </select>
            </label>

            <button className="btn-primary-custom" type="submit">
              <Search size={16} /> Find a room
            </button>
          </form>
        </div>

        <div className="hero-note">
          <Star size={15} fill="currentColor" /> Crafted for extraordinary journeys
        </div>
      </section>

      {/* FEATURED ROOMS */}
      <section className="container section-space">
        <div className="section-head">
          <div>
            <div className="eyebrow dark">A BETTER KIND OF GETAWAY</div>
            <h2>Room to feel <em>at home.</em></h2>
          </div>
          <Link className="text-link" to="/rooms">
            Explore all rooms <ArrowRight size={17} />
          </Link>
        </div>

        {loading ? (
          <div className="loading">Curating luxury stays...</div>
        ) : (
          <div className="room-grid">
            {featuredRooms.map((room) => (
              <RoomCard key={room._id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/* HOTEL EXPERIENCE HIGHLIGHTS */}
      <section style={{ background: '#faf9f5', borderTop: '1px solid #eae8df', padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
            <div className="eyebrow dark" style={{ justifyContent: 'center' }}>
              <span></span> THE HOTELPRO STANDARD <span></span>
            </div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '34px', color: 'var(--ink)', margin: '10px 0' }}>
              Thoughtful luxuries at <em>every touchpoint</em>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#fff', border: '1px solid #e7e5dc', borderRadius: '10px', padding: '24px' }}>
              <div className="benefit-icon"><Sparkles size={22} /></div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', margin: '16px 0 6px', color: 'var(--ink)' }}>
                Bespoke Interiors
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6f7771', lineHeight: '1.6', margin: 0 }}>
                Every suite is curated with king-sized mattresses, acoustic insulation, and custom organic linens.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e7e5dc', borderRadius: '10px', padding: '24px' }}>
              <div className="benefit-icon"><Coffee size={22} /></div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', margin: '16px 0 6px', color: 'var(--ink)' }}>
                Artisan Breakfast
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6f7771', lineHeight: '1.6', margin: 0 }}>
                Start your morning with farm-to-table breakfast spreads and single-origin pour-overs.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e7e5dc', borderRadius: '10px', padding: '24px' }}>
              <div className="benefit-icon"><Wifi size={22} /></div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', margin: '16px 0 6px', color: 'var(--ink)' }}>
                Gigabit Connectivity
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6f7771', lineHeight: '1.6', margin: 0 }}>
                Enterprise-grade high-speed Wi-Fi in all rooms, lounges, and private meeting suites.
              </p>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e7e5dc', borderRadius: '10px', padding: '24px' }}>
              <div className="benefit-icon"><Clock size={22} /></div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', margin: '16px 0 6px', color: 'var(--ink)' }}>
                Seamless Front Desk
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6f7771', lineHeight: '1.6', margin: 0 }}>
                Expedited mobile check-in and luggage concierge around the clock.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE BENEFITS */}
      <section className="benefits">
        <div className="container benefit-grid">
          <div>
            <span className="benefit-icon"><ShieldCheck size={22} /></span>
            <h3>Book with confidence</h3>
            <p>Guaranteed instant confirmation, transparent nightly pricing, and hassle-free cancellation options.</p>
          </div>
          <div>
            <span className="benefit-icon"><BedDouble size={22} /></span>
            <h3>Spaces for every stay</h3>
            <p>From cozy executive business studios to sprawling family penthouses with scenic vistas.</p>
          </div>
          <div>
            <span className="benefit-icon"><Users size={22} /></span>
            <h3>Dedicated hospitality</h3>
            <p>Personalized guest support from reservation discovery right through check-out and beyond.</p>
          </div>
        </div>
      </section>
    </>
  );
}
