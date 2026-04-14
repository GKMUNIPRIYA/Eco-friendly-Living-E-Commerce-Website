import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import User from './src/models/User.js';
import connectDB from './src/config/database.js';

const getMyToken = async () => {
    await connectDB();
    const user = await User.findOne({ email: 'admin123@gmail.com' });
    if (!user) {
        console.error('User not found');
        process.exit(1);
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
    console.log('TOKEN:', token);
    process.exit(0);
}
getMyToken();
