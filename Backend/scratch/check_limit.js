import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGODB_URI;
await mongoose.connect(url);

const FoodDeliveryCashLimit = mongoose.model('FoodDeliveryCashLimit', new mongoose.Schema({}, { collection: 'delivery_cash_limits', strict: false }));
const FoodDeliveryPartner = mongoose.model('FoodDeliveryPartner', new mongoose.Schema({}, { collection: 'food_delivery_partners', strict: false }));
const FoodOrder = mongoose.model('FoodOrder', new mongoose.Schema({}, { collection: 'food_orders', strict: false }));

async function run() {
  try {
    const limits = await FoodDeliveryCashLimit.find({}).lean();
    console.log("ALL CASH LIMITS:");
    console.log(limits);

    const activeLimit = await FoodDeliveryCashLimit.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
    console.log("\nACTIVE CASH LIMIT:");
    console.log(activeLimit);

    // Let's find one or two delivery partners and print their cash info
    const partners = await FoodDeliveryPartner.find({ status: 'approved' }).limit(5).lean();
    console.log("\nSOME APPROVED PARTNERS:");
    for (const p of partners) {
      console.log(`Rider: ${p.name || p.fullName} (_id: ${p._id}, availabilityStatus: ${p.availabilityStatus})`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
