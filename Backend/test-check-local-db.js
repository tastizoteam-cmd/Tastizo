import mongoose from 'mongoose';

const connectionString = 'mongodb://localhost:27017/tastizo';

async function run() {
  try {
    await mongoose.connect(connectionString);
    console.log('Connected to Local MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in Local DB:', collections.map(c => c.name));
    
    for (const name of ['food_under250_banners', 'food_dining_banners']) {
      const count = await db.collection(name).countDocuments({});
      console.log(`Local Collection: ${name}, count: ${count}`);
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Failed to connect to local MongoDB:', err.message);
  }
}

run();
