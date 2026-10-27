import { Router } from 'express';
import { Review, Room } from '../models.js';
import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();

// Get all reviews for a specific room
router.get('/room/:roomId', async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const roomExists = await Room.findById(roomId);
    if (!roomExists) return res.status(404).json({ message: 'Room not found' });

    const reviews = await Review.find({ room: roomId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
      ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
      : null;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
    });

    res.json({
      reviews,
      totalReviews,
      avgRating: avgRating ? Number(avgRating) : 4.8, // fallback to standard 4.8 if unrated
      breakdown
    });
  } catch (err) {
    next(err);
  }
});

// Create or update review for a room
router.post('/room/:roomId', protect, async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Check if user already reviewed this room
    let review = await Review.findOne({ user: req.user._id, room: roomId });
    if (review) {
      review.rating = numericRating;
      review.comment = String(comment || '').trim().slice(0, 1000);
      await review.save();
    } else {
      review = await Review.create({
        user: req.user._id,
        room: roomId,
        rating: numericRating,
        comment: String(comment || '').trim().slice(0, 1000)
      });
    }

    const populatedReview = await Review.findById(review._id).populate('user', 'name email');
    res.status(201).json({ review: populatedReview, message: 'Review submitted successfully' });
  } catch (err) {
    next(err);
  }
});

// Delete a review
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (req.user.role !== 'admin' && String(review.user) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
