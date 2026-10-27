import { Router } from 'express';
import { Room, Booking, Review } from '../models.js';
import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();

// Get rooms with filtering, search, and availability check
router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    // Category filter
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    // Price filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.pricePerNight = {};
      if (req.query.minPrice) filter.pricePerNight.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.pricePerNight.$lte = Number(req.query.maxPrice);
    }

    // Capacity filter
    if (req.query.capacity) {
      filter.capacity = { $gte: Number(req.query.capacity) };
    }

    // Search query (name, description, amenities)
    if (req.query.search && req.query.search.trim()) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { amenities: { $in: [regex] } }
      ];
    }

    // Date range availability filter
    if (req.query.checkIn && req.query.checkOut) {
      const start = new Date(req.query.checkIn);
      const end = new Date(req.query.checkOut);
      if (Number.isNaN(+start) || Number.isNaN(+end) || end <= start) {
        return res.status(400).json({ message: 'Invalid date range' });
      }
      const busyRoomIds = await Booking.distinct('room', {
        status: { $in: ['confirmed', 'checked-in'] },
        checkIn: { $lt: end },
        checkOut: { $gt: start }
      });
      filter._id = { $nin: busyRoomIds };
    }

    // Status filter:
    // If status is specifically provided:
    // - status=all: do not filter by status
    // - status=occupied: filter occupied
    // - status=maintenance: filter maintenance
    // Default to 'available' for public browsing unless status is specified
    if (req.query.status) {
      if (req.query.status !== 'all') {
        filter.status = req.query.status;
      }
    } else {
      filter.status = 'available';
    }

    // Sorting
    let sort = { pricePerNight: 1 };
    if (req.query.sortBy === 'price-desc') sort = { pricePerNight: -1 };
    else if (req.query.sortBy === 'capacity-desc') sort = { capacity: -1 };
    else if (req.query.sortBy === 'name-asc') sort = { name: 1 };

    const rooms = await Room.find(filter).sort(sort);

    // Attach review counts and ratings
    const roomIds = rooms.map(r => r._id);
    const reviews = await Review.aggregate([
      { $match: { room: { $in: roomIds } } },
      { $group: { _id: '$room', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const reviewMap = new Map();
    reviews.forEach(r => reviewMap.set(String(r._id), { avgRating: Number(r.avgRating.toFixed(1)), count: r.count }));

    const roomsWithRatings = rooms.map(r => {
      const rObj = r.toObject();
      const meta = reviewMap.get(String(r._id));
      rObj.avgRating = meta ? meta.avgRating : 4.8;
      rObj.reviewCount = meta ? meta.count : 0;
      return rObj;
    });

    res.json({ rooms: roomsWithRatings });
  } catch (e) {
    next(e);
  }
});

// Get room details by ID
router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const reviews = await Review.find({ room: room._id }).populate('user', 'name email').sort({ createdAt: -1 });
    const count = reviews.length;
    const avg = count > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / count).toFixed(1) : 4.8;

    const rObj = room.toObject();
    rObj.avgRating = Number(avg);
    rObj.reviewCount = count;
    rObj.reviews = reviews;

    res.json({ room: rObj });
  } catch (e) {
    next(e);
  }
});

// Admin creates a room
router.post('/', protect, allowRoles('admin'), async (req, res, next) => {
  try {
    const { name, category, description, pricePerNight, capacity, imageUrl, amenities } = req.body;
    if (!name || !Number.isFinite(Number(pricePerNight)) || Number(pricePerNight) <= 0) {
      return res.status(400).json({ message: 'Name and a positive nightly price are required' });
    }

    const processedAmenities = Array.isArray(amenities)
      ? amenities
      : typeof amenities === 'string'
      ? amenities.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const room = await Room.create({
      name: name.trim(),
      category: category || 'Standard',
      description: (description || '').trim(),
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity || 2),
      imageUrl: (imageUrl || '').trim(),
      amenities: processedAmenities
    });

    res.status(201).json({ room });
  } catch (e) {
    next(e);
  }
});

// Admin/Staff updates a room
router.patch('/:id', protect, allowRoles('admin', 'staff'), async (req, res, next) => {
  try {
    const allowed = ['name', 'category', 'description', 'pricePerNight', 'capacity', 'imageUrl', 'status', 'amenities'];
    const changes = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === 'amenities' && typeof req.body.amenities === 'string') {
          changes.amenities = req.body.amenities.split(',').map(s => s.trim()).filter(Boolean);
        } else if (key === 'pricePerNight' || key === 'capacity') {
          changes[key] = Number(req.body[key]);
        } else {
          changes[key] = req.body[key];
        }
      }
    }

    const room = await Room.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ room });
  } catch (e) {
    next(e);
  }
});

// Admin deletes a room
router.delete('/:id', protect, allowRoles('admin'), async (req, res, next) => {
  try {
    const hasBookings = await Booking.exists({ room: req.params.id, status: { $in: ['confirmed', 'checked-in'] } });
    if (hasBookings) {
      return res.status(409).json({ message: 'Cannot delete a room with active bookings (confirmed or checked-in)' });
    }
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Clean up associated reviews
    await Review.deleteMany({ room: req.params.id });

    res.json({ message: 'Room deleted' });
  } catch (e) {
    next(e);
  }
});

export default router;
