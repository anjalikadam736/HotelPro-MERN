import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BedDouble, RotateCcw } from 'lucide-react';
import api from '../api';
import RoomCard from '../components/RoomCard';
import { money, dateOnly } from '../utils';
import { toast } from 'react-toastify';

export default function Rooms() {
  const [params, setParams] = useSearchParams();

  // Filters
  const [search, setSearch] = useState(params.get('search') || '');
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [checkIn, setCheckIn] = useState(params.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(params.get('checkOut') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '10000');
  const [capacity, setCapacity] = useState(params.get('capacity') || '');
  const [sortBy, setSortBy] = useState(params.get('sortBy') || 'price-asc');

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = () => {
    setLoading(true);
    const query = {};
    if (category && category !== 'All') query.category = category;
    if (maxPrice) query.maxPrice = maxPrice;
    if (search.trim()) query.search = search.trim();
    if (capacity) query.capacity = capacity;
    if (sortBy) query.sortBy = sortBy;
    if (checkIn && checkOut) {
      if (checkOut > checkIn) {
        query.checkIn = checkIn;
        query.checkOut = checkOut;
      }
    }

    api.get('/rooms', { params: query })
      .then((res) => {
        setRooms(res.data.rooms || []);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Could not load rooms');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRooms();
  }, [category, maxPrice, capacity, sortBy, checkIn, checkOut, search]);

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setCheckIn('');
    setCheckOut('');
    setMaxPrice('10000');
    setCapacity('');
    setSortBy('price-asc');
    setParams({});
  };

  return (
    <main className="container page-space">
      <div className="eyebrow dark">FIND YOUR SPACE</div>
      <h1 className="page-title">
        Rooms & <em>Suites</em>
      </h1>
      <p className="page-subtitle">
        Immerse yourself in our serene rooms, elevated suites, and family spaces.
      </p>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <label>
          Search room
          <input
            type="text"
            placeholder="Room name or amenities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Standard">Standard</option>
            <option value="Deluxe">Deluxe</option>
            <option value="Suite">Suite</option>
            <option value="Family">Family</option>
          </select>
        </label>

        <label>
          Dates
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <input
              type="date"
              min={dateOnly(new Date())}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              placeholder="In"
            />
            <input
              type="date"
              min={checkIn || dateOnly(new Date())}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              placeholder="Out"
            />
          </div>
        </label>

        <label>
          Min Guests
          <select value={capacity} onChange={(e) => setCapacity(e.target.value)}>
            <option value="">Any Capacity</option>
            <option value="1">1+ Guest</option>
            <option value="2">2+ Guests</option>
            <option value="3">3+ Guests</option>
            <option value="4">4+ Guests</option>
          </select>
        </label>

        <label>
          Max price: <strong>{money(Number(maxPrice))}</strong>
          <input
            type="range"
            min="2000"
            max="12000"
            step="500"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </label>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-reset"
            onClick={resetFilters}
            title="Reset filters"
          >
            <RotateCcw size={14} /> Clear
          </button>
        </div>
      </div>

      {/* RESULTS COUNT & SORT */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <span style={{ fontSize: '13px', color: '#68736b', fontWeight: '500' }}>
          Showing <strong>{rooms.length}</strong> {rooms.length === 1 ? 'room' : 'rooms'} available
        </span>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#68736b' }}>
          Sort by:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ border: '1px solid #d5dad4', borderRadius: '5px', padding: '5px 8px', fontSize: '12px' }}
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="capacity-desc">Capacity: Highest First</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </label>
      </div>

      {/* ROOM GRID */}
      {loading ? (
        <div className="loading">Checking room availability...</div>
      ) : rooms.length === 0 ? (
        <div className="empty-state">
          <BedDouble size={36} color="var(--green)" />
          <h3>No rooms match your criteria</h3>
          <p>Try adjusting your price range, dates, or category filters.</p>
          <button className="btn-primary-custom" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="room-grid">
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}
    </main>
  );
}
