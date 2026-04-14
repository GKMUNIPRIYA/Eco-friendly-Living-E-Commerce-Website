import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: [
        'personal-care',
        'period-products',
        'soap-bars',
        'bath-body',
        'hair-care',
        'face',
        'essential-oils',
        'cleaners',
        'bathroom',
        'kitchen',
        'travel',
        'home-composting',
        'stationery',
        'candles-aroma',
        'pet-care',
        'reusable-bags',
        'zero-waste-gifts',
        'womens-day',
        'anniversary',
        'corporate-gifting',
      ],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
