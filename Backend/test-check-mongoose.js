import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { FoodUnder250Banner } from './src/modules/food/landing/models/under250Banner.model.js';
import { FoodDiningBanner } from './src/modules/food/landing/models/diningBanner.model.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/tastizo';

async function run() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to MongoDB');
    
    console.log('FoodUnder250Banner collection:', FoodUnder250Banner.collection.name);
    console.log('FoodDiningBanner collection:', FoodDiningBanner.collection.name);
    
    const under250Count = await FoodUnder250Banner.countDocuments({});
    const diningCount = await FoodDiningBanner.countDocuments({});
    
    console.log('FoodUnder250Banner count:', under250Count);
    console.log('FoodDiningBanner count:', diningCount);
    
    const under250Docs = await FoodUnder250Banner.find({});
    console.log('FoodUnder250Banner docs:', JSON.stringify(under250Docs, null, 2));

    const diningDocs = await FoodDiningBanner.find({});
    console.log('FoodDiningBanner docs:', JSON.stringify(diningDocs, null, 2));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
