import { useState } from 'react';
import { X, User, Phone, Mail, Lock, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDatePretty } from '../utils';
import { toast } from 'react-toastify';

export default function ProfileModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { name, phone };
      if (newPassword) {
        if (!currentPassword) {
          toast.error('Please enter your current password to update password');
          setBusy(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await updateProfile(payload);
      toast.success('Profile updated successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>My Profile</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <div className="user-avatar-circle" style={{ width: '50px', height: '50px', fontSize: '18px' }}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <strong style={{ fontSize: '17px', color: 'var(--ink)', display: 'block' }}>{user?.name}</strong>
                <span className="role-chip" style={{ display: 'inline-block', marginTop: '4px' }}>
                  {user?.role}
                </span>
              </div>
            </div>

            <div style={{ background: '#faf9f5', border: '1px solid #e7e6df', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#636c65' }}>
                <Mail size={14} /> <span>{user?.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#636c65' }}>
                <Shield size={14} /> <span>Role: {user?.role}</span>
              </div>
              {user?.createdAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#636c65' }}>
                  <Calendar size={14} /> <span>Member since: {formatDatePretty(user.createdAt)}</span>
                </div>
              )}
            </div>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
              Full name
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
              Phone number
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
              />
            </label>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '14px', marginTop: '4px' }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#889088', margin: '0 0 10px', letterSpacing: '0.5px' }}>
                Change Password (Optional)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                  Current password
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current"
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#566259' }}>
                  New password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    minLength={8}
                    style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #d5dad4', fontSize: '13px' }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline-small" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-custom" disabled={busy}>
              {busy ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
