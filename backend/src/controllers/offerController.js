import Offer from '../models/Offer.js';
import { broadcastNewOffer } from '../services/emailService.js';

// Get all offers
export const getAllOffers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const offers = await Offer.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Offer.countDocuments();

    res.status(200).json({
      success: true,
      count: offers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: offers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

// Get active offers (for displaying in products)
export const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
    }).sort({ validTo: 1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

// Get expired offers
export const getExpiredOffers = async (req, res) => {
  try {
    const now = new Date();
    const { page = 1, limit = 10 } = req.query;

    const offers = await Offer.find({
      validTo: { $lt: now },
    })
      .sort({ validTo: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Offer.countDocuments({ validTo: { $lt: now } });

    res.status(200).json({
      success: true,
      count: offers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: offers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

// Get single offer
export const getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Offer not found',
        },
      });
    }
    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};

// Create offer
export const createOffer = async (req, res) => {
  try {
    const { title, discount, validFrom, validTo } = req.body;

    if (!title || !discount || !validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please provide all required fields',
        },
      });
    }

    const offer = new Offer(req.body);
    await offer.save();

    // Notify subscribers
    broadcastNewOffer(offer).catch(err => console.error('Offer broadcast error:', err));

    res.status(201).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    });
  }
};

// Update offer
export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Offer not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
    });
  }
};

// Delete offer
export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Offer not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Offer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: error.message,
      },
    });
  }
};
