import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// ─────────────────────────────────────────────
// USER SIDE — Get my wishlist
// GET /api/wishlist
// ─────────────────────────────────────────────
export const getMyWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    let wishlist = await Wishlist.findOne({ userId }).populate(
      'products.productId',
      'name price image inStock category description'
    );

    if (!wishlist) {
      // Return empty wishlist structure
      return res.status(200).json({ success: true, data: { userId, products: [] } });
    }

    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    console.error('getMyWishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// USER SIDE — Add product to wishlist
// POST /api/wishlist/add
// ─────────────────────────────────────────────
export const addToWishlist = async (req, res) => {
  try {
    const { productId, note } = req.body;
    const userId = req.user._id;

    // Verify product exists (if it's a valid ID)
    if (mongoose.Types.ObjectId.isValid(productId)) {
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // Create new wishlist for user
      wishlist = await Wishlist.create({
        userId,
        products: [{ productId, note }],
      });
    } else {
      // Check if product already in wishlist
      const alreadyExists = wishlist.products.some(
        (p) => p.productId.toString() === productId
      );

      if (alreadyExists) {
        return res.status(400).json({
          success: false,
          message: 'Product is already in your wishlist',
        });
      }

      wishlist.products.push({ productId, note });
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist,
    });
  } catch (error) {
    console.error('addToWishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// USER SIDE — Remove product from wishlist
// DELETE /api/wishlist/remove/:productId
// ─────────────────────────────────────────────
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    const originalLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      (p) => p.productId.toString() !== productId
    );

    if (wishlist.products.length === originalLength) {
      return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist,
    });
  } catch (error) {
    console.error('removeFromWishlist error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// USER SIDE — Clear entire wishlist
// DELETE /api/wishlist/clear
// ─────────────────────────────────────────────
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    await Wishlist.findOneAndUpdate({ userId }, { products: [] });
    res.status(200).json({ success: true, message: 'Wishlist cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN SIDE — Get all wishlists (which products users want most)
// GET /api/wishlist/admin/all
// ─────────────────────────────────────────────
export const getAllWishlistsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const wishlists = await Wishlist.find()
      .populate('userId', 'firstName lastName email')
      .populate('products.productId', 'name price image category')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Wishlist.countDocuments();

    res.status(200).json({
      success: true,
      data: wishlists,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN SIDE — Get most wishlisted products
// GET /api/wishlist/admin/popular
// ─────────────────────────────────────────────
export const getMostWishlistedProducts = async (req, res) => {
  try {
    const popular = await Wishlist.aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products.productId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          wishlistCount: '$count',
          name: '$product.name',
          price: '$product.price',
          image: '$product.image',
          category: '$product.category',
        },
      },
    ]);

    res.status(200).json({ success: true, data: popular });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
