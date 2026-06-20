import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/tastizo';

async function run() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const restaurants = await db.collection('food_restaurants').find({}).toArray();
    console.log('FoodRestaurants:', JSON.stringify(restaurants.map(r => ({
      _id: r._id,
      name: r.restaurantName || r.name,
      status: r.status,
      isActive: r.isActive,
      isAcceptingOrders: r.isAcceptingOrders,
      zoneId: r.zoneId,
      zone: r.zone,
      profileImage: r.profileImage,
      coverImages: r.coverImages,
      image: r.image
    })), null, 2));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
