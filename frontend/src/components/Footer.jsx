import { Link } from 'react-router-dom';
import { Hotel } from 'lucide-react';

export default function Footer() {
  return (
    <footer>
      <div className="container footer-inner">
        <Link to="/" className="brand brand-light">
          <span className="brand-mark">
            <Hotel size={18} />
          </span>
          hotel<span>pro</span>
        </Link>
        <span>Thoughtful stays. Seamless hospitality. Luxury redefined.</span>
        <span>© {new Date().getFullYear()} HotelPro Management System. All rights reserved.</span>
      </div>
    </footer>
  );
}
