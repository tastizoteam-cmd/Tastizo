import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Setup Counter model
const counterSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        seq: { type: Number, default: 0 }
    },
    { collection: 'counters' }
);
const Counter = mongoose.model('Counter', counterSchema);

// Setup basic Restaurant model for this script
const restaurantSchema = new mongoose.Schema({
    displayId: { type: String }
}, { collection: 'food_restaurants', strict: false });
const FoodRestaurant = mongoose.model('FoodRestaurantBackfill', restaurantSchema);

async function run() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tastizo');
        console.log('Connected.');

        // Find restaurants without a displayId
        const restaurants = await FoodRestaurant.find({ 
            $or: [
                { displayId: { $exists: false } },
                { displayId: null },
                { displayId: "" }
            ]
        });

        console.log(`Found ${restaurants.length} restaurants needing a displayId.`);

        for (const restaurant of restaurants) {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'restaurantId' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            
            const newId = `RES-${1000 + counter.seq}`;
            restaurant.displayId = newId;
            await restaurant.save();
            console.log(`Updated restaurant ${restaurant._id} with ${newId}`);
        }

        console.log('Backfill completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error during backfill:', error);
        process.exit(1);
    }
}

run();
