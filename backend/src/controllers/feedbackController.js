import Feedback from '../models/Feedback.js';

// Create feedback
export const createFeedback = async (req, res) => {
  try {
    const { name, email, message, type, rating } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, email, and message are required',
        },
      });
    }

    const feedback = new Feedback({
      name,
      email: email.toLowerCase(),
      message,
      type: type || 'general',
      ...(rating ? { rating: Number(rating) } : {}),
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback!',
      data: feedback,
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

// Get all feedback (admin)
export const getAllFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, isRead } = req.query;

    let query = {};

    if (type) {
      query.type = type;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Feedback.countDocuments(query);

    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: feedback,
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

// Get single feedback
export const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Feedback not found',
        },
      });
    }

    // Mark as read
    if (!feedback.isRead) {
      feedback.isRead = true;
      await feedback.save();
    }

    res.status(200).json({
      success: true,
      data: feedback,
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

// Update feedback (admin)
export const updateFeedback = async (req, res) => {
  try {
    const { priority, response } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        priority,
        response,
        respondedAt: response ? new Date() : null,
        respondedBy: response ? req.user?.firstName || 'Admin' : null,
      },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Feedback not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback updated',
      data: feedback,
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

// Delete feedback (admin)
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Feedback not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted',
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

// Mark feedback as read (admin)
export const markAsRead = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Feedback not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
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

// Get feedback statistics (admin)
export const getFeedbackStats = async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const unread = await Feedback.countDocuments({ isRead: false });
    const byType = await Feedback.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);
    const byPriority = await Feedback.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        unread,
        byType,
        byPriority,
      },
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
