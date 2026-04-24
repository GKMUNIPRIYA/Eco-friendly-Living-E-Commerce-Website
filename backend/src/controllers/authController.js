import User from '../models/User.js';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { generateToken, generateRandomToken } from '../services/tokenService.js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendVerificationEmail } from '../services/emailService.js';
import { logActivity } from './loginActivityController.js';

// Generate a 6-digit OTP code
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Register user
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, phone, dateOfBirth, address, city, state, pincode } = req.body;

    // Validation
    if (!firstName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'All fields are required',
        },
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Passwords do not match',
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 6 characters',
        },
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
        },
      });
    }

    // Create user with all profile fields
    const otpCode = generateOTP();
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: 'user',
      phone: phone || undefined,
      dateOfBirth: dateOfBirth || undefined,
      address: (address || city || state || pincode)
        ? {
          street: address || '',
          city: city || '',
          state: state || '',
          postalCode: pincode || '',
          country: 'India',
        }
        : undefined,
      emailVerified: false,
      verificationToken: otpCode,
      resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 mins
    });

    await user.save();

    // Log signup activity
    await logActivity({ userId: user._id, email: user.email, activityType: 'signup', status: 'success', req });

    // Send verification email with OTP
    let emailSent = false;
    try {
      await sendVerificationEmail(user.email, user.firstName, otpCode);
      emailSent = true;
    } catch (emailError) {
      console.error('Verification email sending failed:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Registration successful! Please check your email for the verification code.'
        : 'Registration successful! Email delivery failed — use the code shown on screen.',
      requiresVerification: true,
      email: user.email,
      ...(emailSent ? {} : { devCode: otpCode }),
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

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      });
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await logActivity({ userId: user._id, email, activityType: 'signin', status: 'failed', failureReason: 'Invalid password', req });
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    // Check email verification (skip for admin accounts)
    if (user.role !== 'admin' && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        error: {
          code: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email before logging in. Check your inbox for the verification code.',
        },
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Log signin activity
    await logActivity({ userId: user._id, email: user.email, activityType: 'signin', status: 'success', req });

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || {},
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

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: user,
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

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, state, pincode, dateOfBirth, currentPassword, password } = req.body;

    const existingUser = await User.findById(req.userId).select('+password');
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Handle password change
    if (currentPassword && password) {
      const isCurrentValid = await existingUser.comparePassword(currentPassword);
      if (!isCurrentValid) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Current password is incorrect',
          },
        });
      }
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'New password must be at least 6 characters',
          },
        });
      }
      existingUser.password = password;
      await existingUser.save(); // triggers pre-save hash hook
    }

    // Build the nested address object from flat fields
    const existingAddr = existingUser.address || {};
    const updatedAddress = {
      street: address !== undefined ? address : (existingAddr.street || ''),
      city: city !== undefined ? city : (existingAddr.city || ''),
      state: state !== undefined ? state : (existingAddr.state || ''),
      postalCode: pincode !== undefined ? pincode : (existingAddr.postalCode || ''),
      country: existingAddr.country || 'India',
    };

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName: firstName ?? existingUser.firstName,
        lastName: lastName ?? existingUser.lastName,
        phone: phone ?? existingUser.phone,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : existingUser.dateOfBirth,
        address: updatedAddress,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: currentPassword ? 'Password changed successfully' : 'Profile updated successfully',
      data: user,
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

// Update profile image
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No image file uploaded',
        },
      });
    }

    const imageUrl = req.file.path;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { profileImage: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        profileImage: user.profileImage,
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

// Verify email with OTP code
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and verification code are required',
        },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_VERIFIED',
          message: 'Email is already verified',
        },
      });
    }

    if (user.verificationToken !== code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: 'Invalid verification code',
        },
      });
    }

    // Check expiry (stored in resetPasswordExpire for OTP)
    if (user.resetPasswordExpire && user.resetPasswordExpire < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CODE_EXPIRED',
          message: 'Verification code has expired. Please request a new one.',
        },
      });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send welcome email after verification
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Welcome email sending failed:', emailError);
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
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

// Resend verification email
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
        },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_VERIFIED',
          message: 'Email is already verified',
        },
      });
    }

    const otpCode = generateOTP();
    user.verificationToken = otpCode;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    let emailSent = false;
    try {
      await sendVerificationEmail(user.email, user.firstName, otpCode);
      emailSent = true;
    } catch (emailError) {
      console.error('Verification email resend failed:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: emailSent
        ? 'Verification code resent. Please check your email.'
        : 'Email delivery failed — use the code shown on screen.',
      ...(emailSent ? {} : { devCode: otpCode }),
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

// Toggle product in wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product ID is required',
        },
      });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Please login to update wishlist',
        },
      });
    }

    // Safety: check if product exists (handling both ObjectId and static string IDs)
    // If it's a valid ObjectId string, use findById. Otherwise, it might be a static ID.
    // For local dev with p1, p2, we don't strictly reject them if we want them to work.
    // But we should at least try to see if it's a real product if possible.
    let productExists = true;
    if (mongoose.Types.ObjectId.isValid(productId)) {
        const p = await Product.findById(productId);
        if (!p) productExists = false;
    }

    // We proceed anyway to support static frontend IDs like 'p1' if requested,
    // but the analytics might be less accurate.
    
    // Use the Wishlist collection
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // Create new wishlist
      wishlist = new Wishlist({
        userId,
        products: [{ productId, addedAt: new Date() }]
      });
      await wishlist.save();
      
      // Also sync to user model for backward compatibility if needed
      await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: productId } });

      return res.status(200).json({
        success: true,
        added: true,
        wishlist: [productId],
      });
    }

    // Check if exists in wishlist document
    const productIdx = wishlist.products.findIndex(p => p.productId && p.productId.toString() === productId.toString());
    
    let added = false;
    if (productIdx > -1) {
      // Remove
      wishlist.products.splice(productIdx, 1);
      await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } });
    } else {
      // Add
      wishlist.products.push({ productId, addedAt: new Date() });
      await User.findByIdAndUpdate(userId, { $addToSet: { wishlist: productId } });
      added = true;
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      added,
      wishlist: wishlist.products.map(p => p.productId),
    });
  } catch (error) {
    console.error('[WISHLIST] Toggle error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Could not update wishlist. ' + error.message,
      },
    });
  }
};

// Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('wishlist');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }
    res.status(200).json({ success: true, data: user.wishlist });
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

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
        },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    const otpCode = generateOTP();
    user.resetPasswordToken = otpCode;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, user.firstName, otpCode);
      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // We still return 200 if we want to be "secure" but let's provide a helpful hint in dev
      // or if it's explicitly broken. 
      return res.status(500).json({
        success: false,
        error: {
          code: 'EMAIL_ERROR',
          message: 'Account found, but we could not send the reset email. Please try again later or contact support.',
        },
      });
    }
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

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, OTP, password, and confirm password are required',
        },
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Passwords do not match',
        },
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: otp,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired reset token',
        },
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
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
