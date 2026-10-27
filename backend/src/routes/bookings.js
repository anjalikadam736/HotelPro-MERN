import { Router } from 'express';
import { Booking, Room, User } from '../models.js';
import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();
const active = ['confirmed', 'checked-in'];
router.use(protect);

// Create a new booking (guest only)
router.post('/', allowRoles('guest'), async (req, res, next) => {
  try {
    const { roomId, checkIn, checkOut, guests = 1, specialRequests = '' } = req.body;
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (!roomId || Number.isNaN(+start) || Number.isNaN(+end) || end <= start) {
      return res.status(400).json({ message: 'Select a valid room, check-in and check-out date' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateOnly = new Date(start);
    startDateOnly.setHours(0, 0, 0, 0);

    if (startDateOnly < today) {
      return res.status(400).json({ message: 'Check-in must be today or a future date' });
    }

    const room = await Room.findById(roomId);
    if (!room || room.status !== 'available') {
      return res.status(404).json({ message: 'Room is not currently available for booking' });
    }

    const guestCount = Number(guests);
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > room.capacity) {
      return res.status(400).json({ message: `Guest count must be between 1 and ${room.capacity}` });
    }

    const conflict = await Booking.exists({
      room: roomId,
      status: { $in: active },
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });

    if (conflict) {
      return res.status(409).json({ message: 'This room is already booked for the selected dates' });
    }

    const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const totalAmount = nights * room.pricePerNight;

    const booking = await Booking.create({
      user: req.user._id,
      room: roomId,
      checkIn: start,
      checkOut: end,
      guests: guestCount,
      totalAmount,
      specialRequests: String(specialRequests || '').slice(0, 500),
      paymentStatus: 'unpaid'
    });

    const populatedBooking = await Booking.findById(booking._id).populate('room');
    res.status(201).json({ booking: populatedBooking });
  } catch (e) {
    next(e);
  }
});

// Get current user's bookings
router.get('/mine', async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (e) {
    next(e);
  }
});

// Get single booking by ID
router.get('/:id', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('room')
      .populate('user', 'name email phone');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.role === 'guest' && String(booking.user._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You do not have permission to view this booking' });
    }

    res.json({ booking });
  } catch (e) {
    next(e);
  }
});

// Get all bookings (staff and admin only) with search and filter
router.get('/', allowRoles('staff', 'admin'), async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }

    if (req.query.paymentStatus && req.query.paymentStatus !== 'all') {
      filter.paymentStatus = req.query.paymentStatus;
    }

    let bookings = await Booking.find(filter)
      .populate('room')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    if (req.query.search && req.query.search.trim()) {
      const q = req.query.search.trim().toLowerCase();
      bookings = bookings.filter(b => {
        const guestName = (b.user?.name || '').toLowerCase();
        const guestEmail = (b.user?.email || '').toLowerCase();
        const roomName = (b.room?.name || '').toLowerCase();
        const id = String(b._id).toLowerCase();
        return guestName.includes(q) || guestEmail.includes(q) || roomName.includes(q) || id.includes(q);
      });
    }

    res.json({ bookings });
  } catch (e) {
    next(e);
  }
});

// Pay for a booking (Guest or Staff/Admin)
router.post('/:id/pay', async (req, res, next) => {
  try {
    const { paymentMethod = 'card' } = req.body;
    const booking = await Booking.findById(req.params.id).populate('room');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.role === 'guest' && String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot pay for a cancelled booking' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }

    const validMethods = ['card', 'upi', 'netbanking', 'cash'];
    const chosenMethod = validMethods.includes(paymentMethod) ? paymentMethod : 'card';

    const txnSuffix = Math.random().toString(36).substring(2, 9).toUpperCase();
    booking.paymentStatus = 'paid';
    booking.paymentMethod = chosenMethod;
    booking.paymentDate = new Date();
    booking.transactionId = `HP-${Date.now().toString().slice(-6)}-${txnSuffix}`;

    await booking.save();
    res.json({ booking, message: 'Payment processed successfully' });
  } catch (e) {
    next(e);
  }
});

// Cancel a booking
router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (req.user.role === 'guest' && String(booking.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your booking' });
    }

    if (!['confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
    }

    booking.status = 'cancelled';
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }
    await booking.save();

    res.json({ booking, message: 'Booking cancelled successfully' });
  } catch (e) {
    next(e);
  }
});

// Staff/Admin updates booking status (check-in, check-out, cancel)
router.patch('/:id/status', allowRoles('staff', 'admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['checked-in', 'checked-out', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await Booking.findById(req.params.id).populate('room');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (status === 'checked-in' && booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can check in' });
    }

    if (status === 'checked-out' && booking.status !== 'checked-in') {
      return res.status(400).json({ message: 'Only checked-in bookings can check out' });
    }

    booking.status = status;
    if (status === 'cancelled' && booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }

    // When guest checks in or out, optionally keep room status in sync
    if (status === 'checked-in' && booking.room) {
      await Room.findByIdAndUpdate(booking.room._id, { status: 'occupied' });
    } else if (status === 'checked-out' && booking.room) {
      await Room.findByIdAndUpdate(booking.room._id, { status: 'available' });
    }

    await booking.save();
    res.json({ booking });
  } catch (e) {
    next(e);
  }
});

// Staff/Admin updates payment status directly
router.patch('/:id/payment', allowRoles('staff', 'admin'), async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod = 'cash' } = req.body;
    if (!['unpaid', 'pending', 'paid', 'refunded'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      booking.paymentMethod = paymentMethod;
      booking.paymentDate = new Date();
      if (!booking.transactionId) {
        booking.transactionId = `DESK-${Date.now().toString().slice(-6)}`;
      }
    }
    await booking.save();

    res.json({ booking });
  } catch (e) {
    next(e);
  }
});

export default router;
