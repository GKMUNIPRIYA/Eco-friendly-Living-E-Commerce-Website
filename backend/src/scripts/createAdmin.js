import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/database.js';
import User from '../models/User.js';

const createOrUpdateAdmin = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';

  let user = await User.findOne({ email });
  if (user) {
    user.role = 'admin';
    user.password = password; // will be hashed by pre-save hook
    user.emailVerified = true;
    await user.save();
    console.log(`✅ Updated existing user to admin: ${email}`);
  } else {
    user = new User({
      firstName: 'Admin',
      lastName: 'User',
      email,
      password,
      role: 'admin',
      emailVerified: true,
    });
    await user.save();
    console.log(`✅ Created new admin user: ${email}`);
  }

  console.log('You can now login using the provided credentials.');
  process.exit(0);
};

createOrUpdateAdmin().catch((err) => {
  console.error('Error creating admin user:', err);
  process.exit(1);
});
