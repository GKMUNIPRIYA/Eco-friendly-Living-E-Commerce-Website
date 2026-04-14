import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Newsletter from '../models/Newsletter.js';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Send welcome email
export const sendWelcomeEmail = async (email, firstName) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: '🌍 Welcome to Eco-Friendly Living!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2d7a4c;">Welcome to Eco-Friendly Living!</h1>
          <p>Hi ${firstName},</p>
          <p>Thank you for signing up! We're excited to have you on our journey towards sustainable living.</p>
          <p>At Eco-Friendly Living, we believe in making eco-conscious choices accessible and affordable for everyone.</p>
          <ul>
            <li>🌱 Shop sustainable products</li>
            <li>📚 Learn from our eco-friendly blog</li>
            <li>💚 Join our community of eco-warriors</li>
          </ul>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #2d7a4c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Start Shopping</a></p>
          <hr style="margin-top: 40px; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #666;">© 2026 Eco-Friendly Living. All rights reserved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending welcome email: ${error.message}`);
    throw error;
  }
};

// Send email verification OTP
export const sendVerificationEmail = async (email, firstName, otpCode) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: '🔐 Verify Your Email - TerraKind',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6B8E23; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white;">Email Verification</h1>
          </div>
          <div style="padding: 30px; background-color: #f9f9f9;">
            <p>Hi ${firstName},</p>
            <p>Thank you for registering with TerraKind! Please use the following verification code to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #6B8E23; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 15px 30px; border-radius: 10px;">
                ${otpCode}
              </div>
            </div>
            <p style="text-align: center; color: #666; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #666; font-size: 14px;">If you did not create an account, please ignore this email.</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px;">
            <p>© 2026 TerraKind. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending verification email: ${error.message}`);
    throw error;
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (email, orderDetails) => {
  try {
    const productsList = orderDetails.products
      .map(
        (prod) =>
          `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${prod.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${prod.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${prod.price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${prod.subtotal || prod.price * prod.quantity}</td>
          </tr>`
      )
      .join('');

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `🎉 Order Confirmation - ${orderDetails.orderNumber || orderDetails._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6B8E23; color: white; padding: 20px; border-radius: 5px 5px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white;">✓ Order Confirmed!</h1>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p>Dear ${orderDetails.customerInfo?.firstName || 'Valued Customer'},</p>
            <p>Thank you for your order! Your eco-friendly order has been successfully placed.</p>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h2 style="color: #5B6F1E; margin-top: 0;">Order Details</h2>
              <p><strong>Order ID:</strong> <code style="background-color: #f5f5f5; padding: 3px 8px; border-radius: 3px;">${orderDetails.orderNumber || orderDetails._id?.slice(-8).toUpperCase() || 'N/A'}</code></p>
              <p><strong>Order Date:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            
            <h3 style="color: #5B6F1E;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #6B8E23; color: white;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                  <th style="padding: 10px; text-align: right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${productsList}
              </tbody>
            </table>
            
            <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="color: #5B6F1E; margin-top: 0;">Order Summary</h3>
              <table style="width: 100;">
                <tr>
                  <td style="padding: 5px 0;"><strong>Subtotal:</strong></td>
                  <td style="padding: 5px 0; text-align: right;">₹${orderDetails.pricing?.subtotal || 0}</td>
                </tr>
                ${orderDetails.pricing?.discount ? `<tr>
                  <td style="padding: 5px 0;"><strong>Discount:</strong></td>
                  <td style="padding: 5px 0; text-align: right; color: green;">-₹${orderDetails.pricing.discount}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 5px 0;"><strong>Shipping:</strong></td>
                  <td style="padding: 5px 0; text-align: right;">${orderDetails.pricing?.shippingCost === 0 ? 'FREE ✓' : `₹${orderDetails.pricing?.shippingCost || 0}`}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0;"><strong>Tax (GST 18%):</strong></td>
                  <td style="padding: 5px 0; text-align: right;">₹${orderDetails.pricing?.tax || 0}</td>
                </tr>
                <tr style="border-top: 2px solid #6B8E23; border-bottom: 2px solid #6B8E23;">
                  <td style="padding: 10px 0;"><strong style="font-size: 16px;">Total Amount:</strong></td>
                  <td style="padding: 10px 0; text-align: right; font-size: 16px; color: #6B8E23;"><strong>₹${orderDetails.pricing?.total || 0}</strong></td>
                </tr>
              </table>
            </div>

            <div style="background-color: #E8F5E9; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #4CAF50;">
              <h3 style="color: #2E7D32; margin-top: 0;">Delivery Information</h3>
              <p><strong>Delivery Address:</strong></p>
              <p>${orderDetails.customerInfo?.address || 'Address not provided'}</p>
              <p><strong>Contact:</strong> ${orderDetails.customerInfo?.phone || 'N/A'}</p>
            </div>

            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">Payment Method: <strong>${orderDetails.paymentInfo?.method || 'Cash on Delivery'}</strong></p>
            <p style="color: #666; font-size: 14px;">We'll send you a shipping notification as soon as your order is dispatched. You can track your order status on our website.</p>
            <p style="color: #666; font-size: 14px;">Thank you for choosing Eco-Friendly E-Commerce! Together, we're making a difference for our planet. 🌱</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px;">
            <p>© 2026 Eco-Friendly E-Commerce. All rights reserved.</p>
            <p>For support, contact us at support@ecocommerce.com</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending order confirmation email: ${error.message}`);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2d7a4c;">Password Reset Request</h1>
          <p>We received a request to reset your password.</p>
          <p><a href="${resetUrl}" style="background-color: #2d7a4c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>Or copy this link: <code>${resetUrl}</code></p>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Error sending password reset email: ${error.message}`);
    throw error;
  }
};

// Send blog published notification
export const sendBlogPublishedNotification = async (email, blogTitle) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: `📚 New Blog: ${blogTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2d7a4c;">New Blog Published!</h1>
          <p>A new blog has been published: <strong>${blogTitle}</strong></p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/blog" style="background-color: #2d7a4c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Read the Blog</a></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`❌ Error sending blog notification: ${error.message}`);
  }
};


// Helper to get all active subscribers
const getActiveSubscribers = async () => {
  try {
    const subscribers = await Newsletter.find({ isActive: true });
    return subscribers.map(s => s.email);
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
};

// Broadcast new product notification
export const broadcastNewProduct = async (product) => {
  try {
    const emails = await getActiveSubscribers();
    if (emails.length === 0) return;

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      bcc: emails.join(','), // Use bcc so subscribers don't see each other's emails
      subject: `🌿 New Product Arrival: ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #6B8E23; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Product Arrival!</h1>
          </div>
          <div style="padding: 30px; background-color: white;">
            <h2 style="color: #6B8E23; margin-top: 0;">${product.name}</h2>
            <p style="color: #444; line-height: 1.6;">${product.description || 'Check out our latest eco-friendly addition to the shop!'}</p>
            <div style="margin: 25px 0; padding: 20px; background-color: #f8faf5; border-radius: 8px;">
              <p style="margin: 0; color: #5B6F1E; font-weight: bold; font-size: 18px;">Price: ₹${product.price}</p>
              <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Category: ${product.category}</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products/${product._id}" 
                 style="background-color: #6B8E23; color: white; padding: 12px 25px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                 View Product
              </a>
            </div>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #888; margin: 0;">
              © 2026 TerraKind. All rights reserved.<br>
              You're receiving this because you're a valued member of our green community.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Broadcast: New product email sent to ${emails.length} subscribers`);
  } catch (error) {
    console.error(`❌ Error broadcasting product email: ${error.message}`);
  }
};

// Broadcast new offer notification
export const broadcastNewOffer = async (offer) => {
  try {
    const emails = await getActiveSubscribers();
    if (emails.length === 0) return;

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      bcc: emails.join(','),
      subject: `🎉 Special Offer: ${offer.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ffe8e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #FF6B35; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Special Offer Just for You!</h1>
          </div>
          <div style="padding: 30px; background-color: white;">
            <h2 style="color: #FF6B35; margin-top: 0;">${offer.title}</h2>
            <p style="color: #444; line-height: 1.6;">${offer.description || 'Huge savings on your favorite eco-friendly products!'}</p>
            <div style="margin: 25px 0; padding: 30px; background-color: #fff9f6; border: 2px dashed #FF6B35; border-radius: 8px; text-align: center;">
              <span style="display: block; font-size: 16px; color: #666; margin-bottom: 5px;">GET</span>
              <span style="display: block; font-size: 42px; font-weight: bold; color: #FF6B35;">${offer.discount}% OFF</span>
            </div>
            <p style="color: #666; font-size: 14px; text-align: center;">
              <strong>Valid until:</strong> ${new Date(offer.validTo).toLocaleDateString()}
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                 style="background-color: #FF6B35; color: white; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                 Shop & Save Now
              </a>
            </div>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #888; margin: 0;">
              © 2026 TerraKind. All rights reserved.<br>
              Don't miss out on these sustainable deals!
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Broadcast: New offer email sent to ${emails.length} subscribers`);
  } catch (error) {
    console.error(`❌ Error broadcasting offer email: ${error.message}`);
  }
};

// Broadcast new blog notification
export const broadcastNewBlog = async (blog) => {
  try {
    const emails = await getActiveSubscribers();
    if (emails.length === 0) return;

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      bcc: emails.join(','),
      subject: `📚 Fresh Reading: ${blog.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0f2f1; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #2d7a4c; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Article on TerraKind Blog</h1>
          </div>
          <div style="padding: 30px; background-color: white;">
            <h2 style="color: #2d7a4c; margin-top: 0;">${blog.title}</h2>
            <div style="color: #666; font-size: 14px; margin-bottom: 20px;">
              By ${blog.author || 'Admin'} • ${blog.readingTime || 5} min read
            </div>
            <p style="color: #444; line-height: 1.6; font-style: italic; border-left: 4px solid #2d7a4c; padding-left: 15px; margin-bottom: 25px;">
              ${blog.excerpt || 'Explore our latest insights on sustainable living and environmental impact.'}
            </p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/blog/${blog._id}" 
                 style="background-color: #2d7a4c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                 Read Full Article
              </a>
            </div>
          </div>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 12px; color: #888; margin: 0;">
              © 2026 TerraKind. Stay informed, stay green.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Broadcast: New blog email sent to ${emails.length} subscribers`);
  } catch (error) {
    console.error(`❌ Error broadcasting blog email: ${error.message}`);
  }
};

export default transporter;
