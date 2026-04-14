import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    discount: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: [0, 'Discount cannot be less than 0'],
      max: [100, 'Discount cannot exceed 100'],
    },
    validFrom: {
      type: Date,
      required: [true, 'Valid From date is required'],
    },
    validTo: {
      type: Date,
      required: [true, 'Valid To date is required'],
      validate: {
        validator: function() {
          return this.validTo > this.validFrom;
        },
        message: 'Valid To date must be after Valid From date',
      },
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: 'admin',
    },
  },
  { timestamps: true }
);

// Add index for active offers
offerSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

export default mongoose.model('Offer', offerSchema);
