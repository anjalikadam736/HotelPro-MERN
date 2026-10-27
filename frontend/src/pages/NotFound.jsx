import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="container page-space empty-state" style={{ minHeight: '60vh', justifyContent: 'center' }}>
      <Compass size={48} color="var(--green)" />
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', margin: '14px 0 6px', color: 'var(--ink)' }}>
        That page took a little detour.
      </h1>
      <p style={{ maxWidth: '420px', lineHeight: '1.6' }}>
        The destination you are looking for has moved or does not exist. Let's guide you back to comfort.
      </p>
      <Link to="/" className="btn-primary-custom" style={{ marginTop: '10px' }}>
        Return to Home
      </Link>
    </main>
  );
}
