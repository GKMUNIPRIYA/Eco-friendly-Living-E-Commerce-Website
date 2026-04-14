import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    products: [
      {
        productId: {
          type: String,
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        discount: {
          type: Number,
          default: 0,
        },
        subtotal: Number,
      },
    ],
    customerInfo: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: mongoose.Schema.Types.Mixed,
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ['credit-card', 'debit-card', 'upi', 'net-banking', 'paypal', 'cod'],
        default: 'cod',
      },
      transactionId: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      paidAt: Date,
    },
    shippingInfo: {
      method: {
        type: String,
        enum: ['standard', 'express', 'overnight'],
        default: 'standard',
      },
      trackingNumber: String,
      shippedAt: Date,
      deliveredAt: Date,
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
      },
      tax: {
        type: Number,
        default: 0,
      },
      shippingCost: {
        type: Number,
        default: 0,
      },
      discount: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    isAdminRead: {
      type: Boolean,
      default: false,
    },
    notes: String,
    couponCode: String,
  },
  { timestamps: true }
);

// Generate order number
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    this.orderNumber = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Index for tracking
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

export default mongoose.model('Order', orderSchema);
