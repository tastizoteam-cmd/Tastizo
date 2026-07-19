import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { FoodUnder250Banner } from './src/modules/food/landing/models/under250Banner.model.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/tastizo';

async function run() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');
    
    const banner = await FoodUnder250Banner.create({
      imageUrl: 'https://res.cloudinary.com/dciu4uawr/image/upload/v1782375835/food/dining-banners/mw8rczi6iznc1psdrk6l.jpg',
      publicId: 'test-public-id-123',
      title: 'Test Dummy Under 250 Banner',
      isActive: true,
      sortOrder: 0
    });
    
    console.log('Created dummy banner:', banner.toObject());
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
