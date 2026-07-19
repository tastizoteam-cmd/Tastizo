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
    
    for (const coll of collections) {
      if (coll.name.toLowerCase().includes('banner') || coll.name.toLowerCase().includes('under250')) {
        const count = await db.collection(coll.name).countDocuments({});
        console.log(`Collection: ${coll.name}, count: ${count}`);
        if (count > 0) {
          const sample = await db.collection(coll.name).find({}).limit(2).toArray();
          console.log('Sample:', JSON.stringify(sample, null, 2));
        }
      }
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

run();
