import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lost_and_found';
    const conn = await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || 'lost_and_found',
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    process.exit(1);
  }
};
