import LoginActivity from '../models/LoginActivity.js';

// ─────────────────────────────────────────────
// INTERNAL — Log an activity (called from authController)
// Not an API endpoint — used internally
// ─────────────────────────────────────────────
export const logActivity = async ({ userId, email, activityType, status, failureReason, req }) => {
  try {
    await LoginActivity.create({
      userId: userId || null,
      email,
      activityType,
      status,
      failureReason: failureReason || null,
      userAgent: req?.headers?.['user-agent'] || 'Unknown',
      ipAddress: req?.ip || req?.connection?.remoteAddress || 'Unknown',
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
    // Non-critical — don't throw, just log
  }
};

// ─────────────────────────────────────────────
// USER SIDE — Get my own login/signup history
// GET /api/activity/my
// ─────────────────────────────────────────────
export const getMyActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const activities = await LoginActivity.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LoginActivity.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: activities,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN SIDE — Get all login/signup activity
// GET /api/activity/admin/all
// ─────────────────────────────────────────────
export const getAllActivityAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;
    const { type, status } = req.query;

    const filter = {};
    if (type) filter.activityType = type;
    if (status) filter.status = status;

    const activities = await LoginActivity.find(filter)
      .populate('userId', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LoginActivity.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: activities,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN SIDE — Get activity stats summary
// GET /api/activity/admin/stats
// ─────────────────────────────────────────────
export const getActivityStats = async (req, res) => {
  try {
    const totalSignups   = await LoginActivity.countDocuments({ activityType: 'signup', status: 'success' });
    const totalSignins   = await LoginActivity.countDocuments({ activityType: 'signin', status: 'success' });
    const failedSignins  = await LoginActivity.countDocuments({ activityType: 'signin', status: 'failed' });
    const todaySignups   = await LoginActivity.countDocuments({
      activityType: 'signup',
      status: 'success',
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    res.status(200).json({
      success: true,
      data: { totalSignups, totalSignins, failedSignins, todaySignups },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
