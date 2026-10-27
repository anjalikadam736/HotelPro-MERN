import { useState } from 'react';
import { X, CreditCard, Smartphone, Building, Banknote, ShieldCheck } from 'lucide-react';
import api from '../api';
import { money, dateOnly, calculateNights } from '../utils';
import { toast } from 'react-toastify';

export default function PaymentModal({ booking, onClose, onSuccess }) {
  const [method, setMethod] = useState('card');
  const [busy, setBusy] = useState(false);

  // Form states
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState('HOTEL GUEST');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [upiId, setUpiId] = useState('guest@okhdfcbank');

  const nights = calculateNights(booking.checkIn, booking.checkOut);

  const handlePay = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      const res = await api.post(`/bookings/${booking._id}/pay`, {
        paymentMethod: method
      });
      toast.success('Payment completed successfully! Booking is confirmed.');
      if (onSuccess) onSuccess(res.data.booking);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Payment</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handlePay}>
          <div className="modal-body">
            {/* Booking summary box */}
            <div style={{ background: '#f5f4ef', border: '1px solid #e7e6dc', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>{booking.room?.name || 'Selected Room'}</strong>
                  <span style={{ display: 'block', fontSize: '11px', color: '#7a817b', marginTop: '2px' }}>
                    {dateOnly(booking.checkIn)} to {dateOnly(booking.checkOut)} ({nights} {nights === 1 ? 'night' : 'nights'})
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>
                    {money(booking.totalAmount)}
                  </span>
                  <small style={{ display: 'block', fontSize: '10px', color: '#7a817b' }}>Total payable</small>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#5b645e', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                Select Payment Method
              </label>
              <div className="payment-selector">
                <div
                  className={`payment-method-card ${method === 'card' ? 'selected' : ''}`}
                  onClick={() => setMethod('card')}
                >
                  <CreditCard size={18} />
                  <span>Card</span>
                </div>
                <div
                  className={`payment-method-card ${method === 'upi' ? 'selected' : ''}`}
                  onClick={() => setMethod('upi')}
                >
                  <Smartphone size={18} />
                  <span>UPI / QR</span>
                </div>
                <div
                  className={`payment-method-card ${method === 'netbanking' ? 'selected' : ''}`}
                  onClick={() => setMethod('netbanking')}
                >
                  <Building size={18} />
                  <span>NetBanking</span>
                </div>
                <div
                  className={`payment-method-card ${method === 'cash' ? 'selected' : ''}`}
                  onClick={() => setMethod('cash')}
                >
                  <Banknote size={18} />
                  <span>Desk Cash</span>
                </div>
              </div>
            </div>

            {/* Method Details */}
            {method === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                  Card Number
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '10px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                    Cardholder Name
                    <input
                      type="text"
                      required
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                    Expiry
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                    CVV
                    <input
                      type="password"
                      maxLength={4}
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                    />
                  </label>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                  UPI ID / Virtual Payment Address
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                  />
                </label>
                <small style={{ color: '#818982', fontSize: '11px' }}>
                  Simulated UPI transaction gateway. You will receive an instant payment confirmation.
                </small>
              </div>
            )}

            {method === 'netbanking' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                  Choose Bank
                  <select style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}>
                    <option>HDFC Bank</option>
                    <option>State Bank of India</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </label>
              </div>
            )}

            {method === 'cash' && (
              <div style={{ background: '#fef9ee', border: '1px solid #f6e6c1', borderRadius: '8px', padding: '12px', fontSize: '12.5px', color: '#8d6314' }}>
                Guest will settle full payment at the front desk upon arrival or checkout.
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6e7770', fontSize: '11.5px', marginTop: '4px' }}>
              <ShieldCheck size={16} color="var(--green)" />
              <span>Simulated 256-bit encrypted hospitality payment environment</span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline-small" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-custom" disabled={busy}>
              {busy ? 'Processing...' : `Pay ${money(booking.totalAmount)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
