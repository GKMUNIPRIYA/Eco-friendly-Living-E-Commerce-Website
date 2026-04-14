import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const { products, customerInfo, paymentInfo, shippingInfo, couponCode } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No products in order',
        },
      });
    }

    // authMiddleware sets req.userId and req.user
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Please login to place an order',
        },
      });
    }

    const resolvedCustomerInfo =
      customerInfo && customerInfo.email
        ? customerInfo
        : {
            firstName: req.user?.firstName,
            lastName: req.user?.lastName,
            email: req.user?.email,
            phone: req.user?.phone,
            address: req.user?.address,
          };

    if (!resolvedCustomerInfo?.email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Customer email is required',
        },
      });
    }

    // Calculate totals
    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of products) {
      subtotal += item.subtotal || item.price * item.quantity;
      totalDiscount += item.discount || 0;
    }

    const tax = Math.round(subtotal * 0.18); // 18% GST (matching frontend)
    const shippingCost = 0; // Shipping is now free for everyone
    const total = subtotal + tax - totalDiscount;

    const order = new Order({
      userId: req.userId,
      products,
      customerInfo: resolvedCustomerInfo,
      paymentInfo: {
        method: paymentInfo?.method || 'credit-card',
        status: paymentInfo?.method === 'upi' ? 'pending' : 'completed',
        paidAt: paymentInfo?.method === 'upi' ? null : new Date(),
      },
      shippingInfo: {
        method: shippingInfo?.method || 'standard',
      },
      pricing: {
        subtotal,
        tax,
        shippingCost,
        discount: totalDiscount,
        total,
      },
      status: 'pending',
      couponCode,
    });

    await order.save();

    // SIMULATION: If it's a UPI order, automatically confirm it after 8 seconds
    if (paymentInfo.method === 'upi') {
      setTimeout(async () => {
        try {
          const upiOrder = await Order.findById(order._id);
          if (upiOrder && upiOrder.status === 'pending') {
            upiOrder.status = 'confirmed';
            upiOrder.paidAt = new Date();
            await upiOrder.save();
            console.log(`[SIMULATION] UPI Order ${order._id} automatically confirmed.`);
          }
        } catch (err) {
          console.error('[SIMULATION] Automated confirmation failed:', err);
        }
      }, 60000); // 1 minute automatic fallback confirmation
    }

    // Send confirmation email
    try {
      await sendOrderConfirmationEmail(customerInfo.email, {
        ...order.toObject(),
        createdAt: order.createdAt,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
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

// Get order by ID
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: order,
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

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
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

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);
    const unreadCount = await Order.countDocuments({ isAdminRead: false });

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      unreadCount,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: orders,
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

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status is required',
        },
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid status',
        },
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    order.status = status;
    if (status === 'shipped' && !order.shippingInfo?.shippedAt) {
      order.shippingInfo = {
        ...order.shippingInfo,
        shippedAt: new Date(),
      };
    }

    await order.save();

    // send customer email for status change if applicable
    try {
      if (status === 'shipped' || status === 'delivered') {
        const { sendOrderConfirmationEmail } = await import('../services/emailService.js');
        await sendOrderConfirmationEmail(order.customerInfo.email, {
          ...order.toObject(),
          status,
        });
      }
    } catch (err) {
      console.error('Failed to send status update email', err);
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order,
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

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Order not found',
        },
      });
    }

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Only pending or confirmed orders can be cancelled',
        },
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
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

// Mark orders as read
export const markOrdersRead = async (req, res) => {
  try {
    await Order.updateMany({ isAdminRead: false }, { $set: { isAdminRead: true } });
    res.status(200).json({
      success: true,
      message: 'All orders marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// Confirm UPI payment (called by user after scanning & paying)
export const confirmUpiPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Order not found' },
      });
    }
    // Only the order owner can confirm
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not your order' },
      });
    }
    order.paymentInfo.status = 'completed';
    order.paymentInfo.paidAt = new Date();
    order.status = 'confirmed';
    await order.save();
    res.status(200).json({
      success: true,
      message: 'UPI payment confirmed',
      data: { orderId: order._id, status: order.status, paymentStatus: order.paymentInfo.status },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};
