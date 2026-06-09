import mongoose from 'mongoose';
import { FoodOrder } from './src/modules/food/orders/models/order.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const orders = await FoodOrder.find({
    orderStatus: { $in: ['confirmed', 'preparing', 'ready', 'ready_for_pickup'] },
    'dispatch.status': { $in: ['unassigned', 'offered'] }
  }).lean();
  console.log('Pending orders:', JSON.stringify(orders, null, 2));

  process.exit(0);
}
check();
