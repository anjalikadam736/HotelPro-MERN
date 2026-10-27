import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Room, Booking, Review } from './models.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
  if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in .env first');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB. Starting database seed...');

  // Upsert demo accounts
  const users = {};
  for (const account of [
    { name: 'HotelPro Admin', email: 'admin@hotelpro.local', password: 'Admin123!', role: 'admin', phone: '+91 98765 43210' },
    { name: 'HotelPro Staff', email: 'staff@hotelpro.local', password: 'Staff123!', role: 'staff', phone: '+91 98765 43211' },
    { name: 'Demo Guest', email: 'guest@hotelpro.local', password: 'Guest123!', role: 'guest', phone: '+91 98765 43212' },
    { name: 'Sophia Chen', email: 'sophia@example.com', password: 'Guest123!', role: 'guest', phone: '+91 98765 43213' },
    { name: 'Marcus Vance', email: 'marcus@example.com', password: 'Guest123!', role: 'guest', phone: '+91 98765 43214' }
  ]) {
    let user = await User.findOne({ email: account.email });
    if (!user) {
      user = await User.create({
        name: account.name,
        email: account.email,
        phone: account.phone,
        passwordHash: await bcrypt.hash(account.password, 12),
        role: account.role
      });
    }
    users[account.email] = user;
  }

  // Seed / update rooms with stunning photography and rich amenities
  const initialRooms = [
    {
      name: 'Classic Comfort 101',
      category: 'Standard',
      description: 'A quiet, sunlit haven designed for restful solo trips or weekend getaways with king-sized bedding.',
      pricePerNight: 2400,
      capacity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
      amenities: ['High-speed Wi-Fi', 'Air conditioning', 'Smart TV', 'Work Desk', 'Premium Toiletries']
    },
    {
      name: 'Urban Sanctuary 102',
      category: 'Standard',
      description: 'Modern minimalist layout overlooking the courtyard with blackout curtains and artisan coffee maker.',
      pricePerNight: 2800,
      capacity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85',
      amenities: ['High-speed Wi-Fi', 'Air conditioning', 'Courtyard View', 'Espresso Machine', 'Daily Housekeeping']
    },
    {
      name: 'Deluxe Garden Haven 201',
      category: 'Deluxe',
      description: 'Expansive room with private garden terrace, soaking tub, and custom bath amenities.',
      pricePerNight: 4200,
      capacity: 3,
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85',
      amenities: ['Wi-Fi', 'Private Balcony', 'Mini Fridge', 'Complimentary Breakfast', 'Rain Shower', 'Garden View']
    },
    {
      name: 'Grand Horizon Deluxe 202',
      category: 'Deluxe',
      description: 'Elevated city skyline views with plush king bed, marble bathroom, and lounge seating.',
      pricePerNight: 4800,
      capacity: 3,
      imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85',
      amenities: ['High-speed Wi-Fi', 'Skyline View', 'Mini Bar', 'Marble Bath', 'Complimentary Breakfast']
    },
    {
      name: 'Presidential Royal Suite 301',
      category: 'Suite',
      description: 'Our flagship suite featuring a separate living parlor, dining area, jacuzzi tub, and 24/7 butler service.',
      pricePerNight: 8500,
      capacity: 4,
      imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=85',
      amenities: ['Private Jacuzzi', 'Living Parlor', 'Complimentary Champagne', 'Buffet Breakfast', 'Airport Transfer', '24/7 Butler']
    },
    {
      name: 'Family Panorama Retreat 105',
      category: 'Family',
      description: 'A spacious dual-bedroom layout crafted for family vacations with child-friendly amenities and game console.',
      pricePerNight: 5600,
      capacity: 5,
      imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
      amenities: ['Two King Beds', 'Kids Corner', 'Wi-Fi', 'Double Smart TV', 'Breakfast Buffet Included', 'Kitchenette']
    }
  ];

  for (const r of initialRooms) {
    const existing = await Room.findOne({ name: r.name });
    if (!existing) {
      await Room.create(r);
    } else {
      await Room.findByIdAndUpdate(existing._id, {
        imageUrl: r.imageUrl,
        description: r.description,
        amenities: r.amenities,
        pricePerNight: r.pricePerNight,
        capacity: r.capacity
      });
    }
  }

  const seededRooms = await Room.find();
  const guestUser = users['guest@hotelpro.local'];
  const sophiaUser = users['sophia@example.com'];
  const marcusUser = users['marcus@example.com'];

  // Seed sample reviews if empty
  if (seededRooms.length > 0 && (await Review.countDocuments()) === 0) {
    await Review.insertMany([
      {
        user: sophiaUser._id,
        room: seededRooms[0]._id,
        rating: 5,
        comment: 'Truly wonderful experience! Spotless room, comfortable bedding, and very quiet at night.'
      },
      {
        user: marcusUser._id,
        room: seededRooms[0]._id,
        rating: 4,
        comment: 'Great value for money. The Wi-Fi was fast and check-in was seamless.'
      },
      {
        user: guestUser._id,
        room: seededRooms[2]._id,
        rating: 5,
        comment: 'The garden view from the terrace was breathtaking. Loved the fresh breakfast!'
      },
      {
        user: sophiaUser._id,
        room: seededRooms[4]._id,
        rating: 5,
        comment: 'Top tier luxury. The jacuzzi and parlor made our anniversary unforgettable.'
      }
    ]);
  }

  // Seed sample bookings if empty
  if (seededRooms.length > 0 && (await Booking.countDocuments()) === 0) {
    const today = new Date();
    const in3Days = new Date(Date.now() + 3 * 86400000);
    const in6Days = new Date(Date.now() + 6 * 86400000);
    const pastStart = new Date(Date.now() - 5 * 86400000);
    const pastEnd = new Date(Date.now() - 2 * 86400000);

    await Booking.insertMany([
      {
        user: guestUser._id,
        room: seededRooms[2]._id,
        checkIn: in3Days,
        checkOut: in6Days,
        guests: 2,
        totalAmount: 3 * seededRooms[2].pricePerNight,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        paymentDate: today,
        transactionId: 'HP-901842-DEMOPAY',
        specialRequests: 'Quiet room on an upper floor please.'
      },
      {
        user: guestUser._id,
        room: seededRooms[0]._id,
        checkIn: pastStart,
        checkOut: pastEnd,
        guests: 1,
        totalAmount: 3 * seededRooms[0].pricePerNight,
        status: 'checked-out',
        paymentStatus: 'paid',
        paymentMethod: 'upi',
        paymentDate: pastStart,
        transactionId: 'HP-829141-UPI99',
        specialRequests: 'Late check-in requested.'
      },
      {
        user: sophiaUser._id,
        room: seededRooms[1]._id,
        checkIn: today,
        checkOut: in3Days,
        guests: 2,
        totalAmount: 3 * seededRooms[1].pricePerNight,
        status: 'checked-in',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        paymentDate: today,
        transactionId: 'HP-771239-CARD88',
        specialRequests: 'Extra pillows requested.'
      },
      {
        user: marcusUser._id,
        room: seededRooms[4]._id,
        checkIn: in6Days,
        checkOut: new Date(Date.now() + 9 * 86400000),
        guests: 2,
        totalAmount: 3 * seededRooms[4].pricePerNight,
        status: 'confirmed',
        paymentStatus: 'unpaid',
        specialRequests: 'Celebrating a special milestone.'
      }
    ]);
  }

  console.log('Seed completed successfully!');
  console.log('Demo Accounts:');
  console.log('  Admin: admin@hotelpro.local / Admin123!');
  console.log('  Staff: staff@hotelpro.local / Staff123!');
  console.log('  Guest: guest@hotelpro.local / Guest123!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
