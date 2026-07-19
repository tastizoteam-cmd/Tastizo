import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/tastizo';

async function run() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const banners = await db.collection('food_under250_banners').find({}).toArray();
    console.log('Banners in DB:', JSON.stringify(banners.map(b => ({
      _id: b._id,
      imageUrl: b.imageUrl,
      publicId: b.publicId,
      isActive: b.isActive
    })), null, 2));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
