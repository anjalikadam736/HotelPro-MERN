import { X, Printer, Hotel, CheckCircle } from 'lucide-react';
import { money, dateOnly, formatDatePretty, calculateNights } from '../utils';

export default function InvoiceModal({ booking, onClose }) {
  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const nightlyRate = booking.room?.pricePerNight || (booking.totalAmount / nights);
  const subtotal = nights * nightlyRate;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reservation Receipt & Invoice</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-outline-small"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close invoice">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          <div className="invoice-paper">
            {/* Top header */}
            <div className="invoice-top">
              <div className="invoice-company">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}>
                  <span className="brand-mark" style={{ width: '32px', height: '32px' }}>
                    <Hotel size={18} />
                  </span>
                  <h1>hotel<span style={{ color: 'var(--gold)' }}>pro</span></h1>
                </div>
                <p>HotelPro Boutique & Suites • 42 Heritage Promenade, Central Plaza</p>
                <p>Support: reservations@hotelpro.local • +91 98765 43210</p>
                <p style={{ fontSize: '10px', color: '#9aa099' }}>GSTIN: 27AABCH1234F1Z8</p>
              </div>

              <div className="invoice-meta">
                <strong>INVOICE #{String(booking._id).slice(-8).toUpperCase()}</strong>
                <span>Date: {formatDatePretty(booking.createdAt || new Date())}</span>
                {booking.transactionId && (
                  <span style={{ display: 'block', marginTop: '2px', color: '#27573d', fontWeight: '600' }}>
                    Txn: {booking.transactionId}
                  </span>
                )}
                <div style={{ marginTop: '6px' }}>
                  <span className={`status status-${booking.paymentStatus || 'unpaid'}`}>
                    Payment: {booking.paymentStatus || 'unpaid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Guest & Reservation Info */}
            <div className="invoice-grid">
              <div className="invoice-box">
                <h4>Billed To</h4>
                <strong>{booking.user?.name || 'Valued Guest'}</strong>
                <p style={{ margin: '3px 0 0', color: '#68726a' }}>{booking.user?.email || 'N/A'}</p>
                {booking.user?.phone && <p style={{ margin: '2px 0 0', color: '#68726a' }}>{booking.user?.phone}</p>}
              </div>

              <div className="invoice-box">
                <h4>Stay Information</h4>
                <strong>{booking.room?.name || 'Hotel Room'}</strong> ({booking.room?.category || 'Standard'})
                <p style={{ margin: '3px 0 0', color: '#68726a' }}>
                  Check-in: <strong>{dateOnly(booking.checkIn)}</strong>
                </p>
                <p style={{ margin: '2px 0 0', color: '#68726a' }}>
                  Check-out: <strong>{dateOnly(booking.checkOut)}</strong> ({nights} {nights === 1 ? 'night' : 'nights'})
                </p>
                <p style={{ margin: '2px 0 0', color: '#68726a' }}>
                  Guests: {booking.guests} {booking.guests === 1 ? 'Guest' : 'Guests'}
                </p>
              </div>
            </div>

            {/* Line items table */}
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Rate / Night</th>
                  <th>Nights</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{booking.room?.name || 'Room Stay'}</strong>
                    <small style={{ display: 'block', color: '#7a837c' }}>
                      {booking.room?.category} Room Accommodation for {booking.guests} guests
                    </small>
                    {booking.specialRequests && (
                      <small style={{ display: 'block', color: '#57675c', fontStyle: 'italic', marginTop: '4px' }}>
                        Note: "{booking.specialRequests}"
                      </small>
                    )}
                  </td>
                  <td>{money(nightlyRate)}</td>
                  <td>{nights}</td>
                  <td style={{ textAlign: 'right' }}>{money(subtotal)}</td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="invoice-totals">
              <div className="invoice-totals-row">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <div className="invoice-totals-row">
                <span>Taxes & Luxury Cess</span>
                <span>Included (0%)</span>
              </div>
              <div className="invoice-totals-row grand">
                <span>Grand Total</span>
                <span>{money(booking.totalAmount)}</span>
              </div>
              {booking.paymentStatus === 'paid' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontSize: '11.5px', marginTop: '6px', justifyContent: 'flex-end' }}>
                  <CheckCircle size={14} /> Paid via {(booking.paymentMethod || 'card').toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-outline-small" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
