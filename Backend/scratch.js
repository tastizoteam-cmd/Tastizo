import mongoose from 'mongoose';
import { FoodOrder } from './src/modules/food/orders/models/order.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const order = await FoodOrder.findOne({
    orderStatus: { $in: ['confirmed', 'preparing', 'ready', 'ready_for_pickup'] },
    'dispatch.status': { $in: ['unassigned', 'offered'] }
  }); // NO .lean()
  
  if (order) {
    const dispatchProp = { ...order.dispatch };
    console.log('Keys of spread:', Object.keys(dispatchProp));
    console.log('JSON.stringify of spread:', JSON.stringify(dispatchProp));
  }

  process.exit(0);
}
check();
