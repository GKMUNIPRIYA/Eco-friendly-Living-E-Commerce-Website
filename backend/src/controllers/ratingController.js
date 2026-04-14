import mongoose from 'mongoose';
import Rating from '../models/Rating.js';
import Product from '../models/Product.js';

// ─────────────────────────────────────────────
// USER SIDE — Add or Update a Rating
// POST /api/ratings
// ─────────────────────────────────────────────
export const addOrUpdateRating = async (req, res) => {
  try {
    const { productId, rating, review, title } = req.body;
    const userId = req.user._id;

    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: 'productId and rating are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existingRating = await Rating.findOneAndUpdate(
      { userId, productId },
      { rating, review, title },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Rating submitted successfully',
      data: existingRating,
    });
  } catch (error) {
    console.error('addOrUpdateRating error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// USER SIDE — Get all ratings for a product
// GET /api/ratings/product/:productId
// ─────────────────────────────────────────────
export const getProductRatings = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ productId, isVisible: true })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Rating.countDocuments({ productId, isVisible: true });

    // Calculate average — use mongoose.Types.ObjectId (ES module safe)
    let averageRating = 0;
    let totalRatings = 0;
    try {
      const avgResult = await Rating.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId), isVisible: true } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (avgResult.length > 0) {
        averageRating = Math.round(avgResult[0].avgRating * 10) / 10;
        totalRatings = avgResult[0].count;
      }
    } catch (aggErr) {
      console.warn('Rating aggregate error:', aggErr.message);
    }

    res.status(200).json({
      success: true,
      data: ratings,
      averageRating,
      totalRatings,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('getProductRatings error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// USER SIDE — Get logged-in user's own rating for a product
// GET /api/ratings/my/:productId
// ─────────────────────────────────────────────
export const getMyRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    const rating = await Rating.findOne({ userId, productId });
    res.status(200).json({ success: true, data: rating || null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// USER SIDE — Delete own rating
// DELETE /api/ratings/:productId
// ─────────────────────────────────────────────
export const deleteMyRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    const deleted = await Rating.findOneAndDelete({ userId, productId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }
    res.status(200).json({ success: true, message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN SIDE — Get all ratings
// GET /api/ratings/admin/all
// ─────────────────────────────────────────────
export const getAllRatingsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find()
      .populate('userId', 'firstName lastName email')
      .populate('productId', 'name price image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Rating.countDocuments();

    res.status(200).json({
      success: true,
      data: ratings,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN SIDE — Toggle rating visibility
// PUT /api/ratings/admin/:id/visibility
// ─────────────────────────────────────────────
export const toggleRatingVisibility = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }
    rating.isVisible = !rating.isVisible;
    rating.isVerified = true;
    await rating.save();
    res.status(200).json({
      success: true,
      message: `Rating ${rating.isVisible ? 'visible' : 'hidden'}`,
      data: rating,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN SIDE — Delete any rating
// DELETE /api/ratings/admin/:id
// ─────────────────────────────────────────────
export const deleteRatingAdmin = async (req, res) => {
  try {
    const deleted = await Rating.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }
    res.status(200).json({ success: true, message: 'Rating deleted by admin' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
