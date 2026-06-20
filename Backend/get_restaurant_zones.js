import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const rCollection = mongoose.connection.db.collection('food_restaurants');
  const restaurant = await rCollection.findOne({ _id: new mongoose.Types.ObjectId("69edec2622bce67ccf21242e") });
  console.log("Atha Bakes details:", JSON.stringify(restaurant, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);
