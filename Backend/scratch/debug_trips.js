import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

import { FoodOrder } from '../src/modules/food/orders/models/order.model.js';

async function run() {
  const url = process.env.MONGODB_URI;
  await mongoose.connect(url);
  
  try {
    const partnerId = new mongoose.Types.ObjectId('69ede66f5a71d40fb051cb2d');
    const orders = await FoodOrder.find({
      'dispatch.deliveryPartnerId': partnerId
    }).lean();
    
    console.log(`Total orders for partner 69ede66f5a71d40fb051cb2d: ${orders.length}`);
    
    orders.forEach((o, i) => {
      console.log(`Order ${i + 1}:`);
      console.log(`  orderId: ${o.orderId}`);
      console.log(`  orderStatus: ${o.orderStatus}`);
      console.log(`  createdAt: ${o.createdAt ? o.createdAt.toISOString() : 'undefined'}`);
      console.log(`  deliveredAt: ${o.deliveryState?.deliveredAt ? o.deliveryState.deliveredAt.toISOString() : (o.deliveredAt ? o.deliveredAt.toISOString() : 'undefined')}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
