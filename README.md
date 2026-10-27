# HotelPro — Complete MERN Hotel Management System

A production-ready full-stack hospitality platform built with **React 18 + Vite**, **Express**, **MongoDB / Mongoose**, **JWT Authentication**, and **Role-Based Access Control (RBAC)**.

---

## 🌟 Features Implemented

### 🏨 Guest Experience
- **Hero & Room Discovery**: Real-time room availability search with check-in, check-out date filters, category selector, and keyword search.
- **Detailed Suite Explorer**: High-resolution imagery, amenities with badges, dynamic nightly price calculation (subtotal, nights, grand total), and instant reservation.
- **Ratings & Reviews System**: Verified guest reviews, star rating distribution, average rating calculation, and interactive review submission modal.
- **Booking Management**: Full history of upcoming and past reservations with status badges (`confirmed`, `checked-in`, `checked-out`, `cancelled`).
- **Simulated Payment Gateway**: Pay for bookings online with Cards, UPI / QR, NetBanking, or Front Desk settlement with real transaction ID generation.
- **Printable Tax Invoices & Receipts**: Official hotel invoice modal with booking reference, room rate breakdown, tax lines, payment status, and browser print (`window.print()`).
- **Profile Management**: Update name, contact phone number, and change account passwords securely.

### 🛎️ Front Desk & Operations (Staff & Admin)
- **Live Reservation Desk**: Search reservations by guest name, email, or room.
- **Guest Check-in & Check-out**: One-click check-in (marks room occupied) and check-out (marks room available).
- **Payment Collection**: Collect unpaid balances at the front desk.
- **Special Requests Viewer**: View guest arrival notes and requests.
- **Property Room Status Tracker**: Manage all rooms across the property with real-time status toggling between `Available`, `Occupied`, and `Maintenance`.

### 👑 Executive Control Center (Admin)
- **Real-Time Property Analytics**:
  - Total users, total rooms, total bookings.
  - Active stays counter (confirmed and checked-in).
  - Total recorded revenue (aggregated from paid bookings).
  - Live occupancy rate percentage.
- **Room Inventory Management**:
  - Add new rooms with custom photos, amenities, pricing, category, and capacity.
  - Edit existing rooms (modal for updating rates, amenities, photos, and descriptions).
  - Delete rooms (with safety checks against active bookings).
- **User Management**:
  - Filter and search users.
  - Change user roles (`guest`, `staff`, `admin`).
  - Account removal with self-deletion protection.
- **Complete Booking Audit Log**: Full searchable ledger of all property transactions.

---

## 🔐 Demo Credentials

Use the one-click demo login buttons on the Sign In page, or enter:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@hotelpro.local` | `Admin123!` |
| **Staff** | `staff@hotelpro.local` | `Staff123!` |
| **Guest** | `guest@hotelpro.local` | `Guest123!` |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/hotelpro`) or MongoDB Atlas

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds rooms, reviews, bookings, and demo accounts
npm run dev      # Starts API server at http://localhost:5000
```

Environment variables in `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hotelpro
JWT_SECRET=super_secret_hotelpro_jwt_key_2026_safe_and_long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup
In a second terminal:
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server at http://localhost:5173
```

Environment variables in `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📁 Project Architecture

```
fullstack_project/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT verification & role authorization
│   │   ├── routes/
│   │   │   ├── admin.js           # Platform stats, user management
│   │   │   ├── auth.js            # Register, login, profile updates
│   │   │   ├── bookings.js        # Reservation CRUD, payment, check-in/out
│   │   │   ├── reviews.js         # Room reviews & ratings
│   │   │   └── rooms.js           # Room inventory, search & filter
│   │   ├── models.js              # User, Room, Booking, Review schemas
│   │   ├── seed.js                # Database seeder with photography & demo stays
│   │   └── server.js              # Express app setup & MongoDB connection
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EditRoomModal.jsx  # Admin room editor
│   │   │   ├── Footer.jsx         # Site footer
│   │   │   ├── Header.jsx         # Navigation bar & auth status
│   │   │   ├── InvoiceModal.jsx   # Printable tax invoice / receipt
│   │   │   ├── PaymentModal.jsx   # Mock payment gateway (Card/UPI/Cash)
│   │   │   ├── ProfileModal.jsx   # User profile & password changer
│   │   │   ├── ReviewModal.jsx    # Star rating & review form
│   │   │   └── RoomCard.jsx       # Room preview card
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state, login, register, profile
│   │   ├── pages/
│   │   │   ├── Admin.jsx          # Admin metrics, inventory & users
│   │   │   ├── AuthPage.jsx       # Login & Register with 1-click demo buttons
│   │   │   ├── Dashboard.jsx      # Role-aware navigation hub
│   │   │   ├── Home.jsx           # Landing page with room search
│   │   │   ├── MyBookings.jsx     # Guest reservations & actions
│   │   │   ├── NotFound.jsx       # 404 handler
│   │   │   ├── Operations.jsx     # Front desk check-ins & room board
│   │   │   ├── RoomDetails.jsx    # Suite overview, booking box & reviews
│   │   │   └── Rooms.jsx          # Room catalog with filters
│   │   ├── api.js                 # Axios instance with auth interceptor
│   │   ├── App.jsx                # Route declarations & role protection
│   │   ├── main.jsx               # React entry point
│   │   ├── styles.css             # Luxury design system & responsive styles
│   │   └── utils.js               # Currency & date formatters
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🛠️ REST API Specification

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Sign in & return JWT token |
| `GET` | `/api/auth/me` | Protected | Get current user profile |
| `PATCH` | `/api/auth/profile` | Protected | Update profile name, phone & password |
| `GET` | `/api/rooms` | Public | Get rooms with search, date & category filter |
| `GET` | `/api/rooms/:id` | Public | Get room details with review breakdown |
| `POST` | `/api/rooms` | Admin | Create new room |
| `PATCH` | `/api/rooms/:id` | Admin/Staff | Update room properties & status |
| `DELETE` | `/api/rooms/:id` | Admin | Delete room (when free of active stays) |
| `GET` | `/api/reviews/room/:roomId` | Public | List reviews & compute average rating |
| `POST` | `/api/reviews/room/:roomId` | Protected | Submit rating (1–5) and review |
| `DELETE` | `/api/reviews/:id` | Protected | Delete review (owner or admin) |
| `POST` | `/api/bookings` | Guest | Create a room reservation |
| `GET` | `/api/bookings/mine` | Protected | List current guest's reservations |
| `GET` | `/api/bookings/:id` | Protected | Get single booking receipt details |
| `GET` | `/api/bookings` | Admin/Staff | List all reservations with search & filter |
| `POST` | `/api/bookings/:id/pay` | Protected | Process payment (Card, UPI, Cash) |
| `PATCH` | `/api/bookings/:id/cancel`| Protected | Cancel booking & trigger refund |
| `PATCH` | `/api/bookings/:id/status`| Admin/Staff | Update status (checked-in, checked-out) |
| `GET` | `/api/admin/stats` | Admin | Aggregate revenue, active stays & occupancy |
| `GET` | `/api/admin/users` | Admin | List all platform users |
| `PATCH` | `/api/admin/users/:id/role`| Admin | Change user role (guest, staff, admin) |
| `DELETE` | `/api/admin/users/:id` | Admin | Remove user account |
