import User from '../models/User.js';

// Create an initial admin user based on .env values if it does not exist yet
const initAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD is not set in .env. Skipping admin initialization.');
    return;
  }

  try {
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (existingAdmin) {
      // Ensure the role is admin
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`✅ Updated existing user to admin role: ${adminEmail}`);
      } else {
        console.log(`✅ Admin user already exists: ${adminEmail}`);
      }
      return;
    }

    // No admin exists, create one
    const [firstName, lastName] = adminEmail.split('@')[0].split(/[.\-_]/);

    const adminUser = new User({
      firstName: firstName || 'Admin',
      lastName: lastName || 'User',
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log(`✅ Initial admin user created: ${adminEmail}`);
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔐 Password: ${adminPassword.substring(0, 3)}***`);
  } catch (error) {
    console.error('❌ Failed to initialize admin user:', error.message);
  }
};

export default initAdminUser;

