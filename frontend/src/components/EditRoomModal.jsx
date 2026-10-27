import { useState } from 'react';
import { X, Save } from 'lucide-react';
import api from '../api';
import { toast } from 'react-toastify';

export default function EditRoomModal({ room, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: room.name || '',
    category: room.category || 'Standard',
    pricePerNight: room.pricePerNight || '',
    capacity: room.capacity || 2,
    status: room.status || 'available',
    imageUrl: room.imageUrl || '',
    description: room.description || '',
    amenities: (room.amenities || []).join(', ')
  });
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      await api.patch(`/rooms/${room._id}`, {
        name: form.name.trim(),
        category: form.category,
        pricePerNight: Number(form.pricePerNight),
        capacity: Number(form.capacity),
        status: form.status,
        imageUrl: form.imageUrl.trim(),
        description: form.description.trim(),
        amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean)
      });
      toast.success('Room updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update room');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Room Details</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                Room Name
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                >
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Family">Family</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                Nightly Rate (₹)
                <input
                  type="number"
                  min="1"
                  required
                  value={form.pricePerNight}
                  onChange={(e) => setForm({ ...form, pricePerNight: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                Capacity (Guests)
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                Current Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                Photo URL
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259', gridColumn: 'span 2' }}>
                Amenities (Comma-separated)
                <input
                  type="text"
                  placeholder="High-speed Wi-Fi, Air conditioning, Mini Fridge, Breakfast"
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259', gridColumn: 'span 2' }}>
                Description
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px', fontFamily: 'inherit' }}
                />
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline-small" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-custom" disabled={busy}>
              <Save size={15} /> {busy ? 'Saving...' : 'Update Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
