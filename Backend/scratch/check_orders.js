import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('.env') });

async function checkOrders() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const FoodOrder = mongoose.model('FoodOrder', new mongoose.Schema({}, { strict: false, collection: 'food_orders' }));

    const restaurantId = '69edec2622bce67ccf21242e'; // atha bakes
    const orders = await FoodOrder.find({ restaurantId }).lean();
    console.log('Total orders in DB for Atha Bakes:', orders.length);

    orders.forEach((o, i) => {
      console.log(`Order ${i + 1}: ID: ${o._id}, Status: ${o.orderStatus}, Customer: ${o.customerName}, Phone: ${o.customerPhone}, Total: ${o.pricing?.total}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkOrders();
