import { Router } from 'express';
import { User, Room, Booking } from '../models.js';
import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();
router.use(protect, allowRoles('admin'));

router.get('/stats', async (_req, res, next) => {
  try {
    const [
      users,
      rooms,
      bookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      revenueResult,
      occupiedRooms,
      recentBookings
    ] = await Promise.all([
      User.countDocuments(),
      Room.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['confirmed', 'checked-in'] } }),
      Booking.countDocuments({ status: 'checked-out' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid', status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Room.countDocuments({ status: 'occupied' }),
      Booking.find()
        .populate('user', 'name email')
        .populate('room', 'name category pricePerNight')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const occupancyRate = rooms > 0 ? Math.round((occupiedRooms / rooms) * 100) : 0;

    res.json({
      stats: {
        users,
        rooms,
        bookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        revenue: revenueResult[0]?.total || 0,
        occupiedRooms,
        occupancyRate,
        recentBookings
      }
    });
  } catch (e) {
    next(e);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role && req.query.role !== 'all') {
      filter.role = req.query.role;
    }

    let users = await User.find(filter)
      .select('name email role phone createdAt')
      .sort({ createdAt: -1 });

    if (req.query.search && req.query.search.trim()) {
      const q = req.query.search.trim().toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
      );
    }

    res.json({ users });
  } catch (e) {
    next(e);
  }
});

router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['guest', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    if (String(req.user._id) === req.params.id && role !== 'admin') {
      return res.status(400).json({ message: 'You cannot demote your own account' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('name email role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    // Check if user has active bookings
    const hasActiveBookings = await Booking.exists({
      user: req.params.id,
      status: { $in: ['confirmed', 'checked-in'] }
    });
    if (hasActiveBookings) {
      return res.status(409).json({ message: 'Cannot delete a user who currently has active bookings' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed successfully' });
  } catch (e) {
    next(e);
  }
});

export default router;
