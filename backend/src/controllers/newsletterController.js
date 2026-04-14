import Newsletter from '../models/Newsletter.js';

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email format
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Valid email is required' },
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Email format validation
    const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_EMAIL', message: 'Please provide a valid email address' },
      });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email: trimmedEmail });
    if (existing && existing.isActive) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_SUBSCRIBED', message: 'This email is already subscribed' },
      });
    }

    // If previously unsubscribed, reactivate
    if (existing && !existing.isActive) {
      await Newsletter.findByIdAndUpdate(existing._id, { isActive: true });
      return res.status(200).json({
        success: true,
        message: 'Resubscribed to newsletter',
        data: { email: trimmedEmail },
      });
    }

    // Create new subscriber
    const subscriber = new Newsletter({ email: trimmedEmail });
    await subscriber.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: { email: trimmedEmail },
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to subscribe. Please try again.' },
    });
  }
};

export const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const subscribers = await Newsletter.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Newsletter.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: subscribers,
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch subscribers' },
    });
  }
};

export const getSubscriberCount = async (req, res) => {
  try {
    const count = await Newsletter.countDocuments({ isActive: true });
    res.status(200).json({
      success: true,
      total: count,
      data: { count },
    });
  } catch (error) {
    console.error('Count error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch subscriber count' },
    });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email is required' },
      });
    }

    const subscriber = await Newsletter.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isActive: false },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Email not found' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Unsubscribed from newsletter',
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to unsubscribe' },
    });
  }
};
