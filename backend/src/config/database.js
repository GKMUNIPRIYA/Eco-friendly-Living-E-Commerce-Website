import mongoose from 'mongoose';

const connectDB = async () => {
  // Prefer 127.0.0.1 to avoid IPv6/localhost resolution issues on Windows
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eco-commerce';
  mongoose.set('strictQuery', false);

  const connectWithRetry = async (retries = 5, delay = 2000) => {
    try {
      const conn = await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`MongoDB connection failed: ${err.message}`);
      if (retries > 0) {
        console.log(`Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(r => setTimeout(r, delay));
        return connectWithRetry(retries - 1, delay);
      } else {
        console.error('Could not connect to MongoDB, exiting.');
        process.exit(1);
      }
    }
  };

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
  });

  return connectWithRetry();
};

export default connectDB;