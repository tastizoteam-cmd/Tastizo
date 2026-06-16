import mongoose from 'mongoose';
import { FoodOrder } from '../src/modules/food/orders/models/order.model.js';
import { FoodUser } from '../src/core/users/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const filter = {
    restaurantId: new mongoose.Types.ObjectId('69edec2622bce67ccf21242e'),
    $or: [
      { "payment.method": { $in: ["cash", "wallet"] } },
      { "payment.status": { $in: ["paid", "authorized", "captured", "settled", "refunded"] } },
    ],
  };

  const docs = await FoodOrder.find(filter).populate('userId').lean();
  console.log('Total orders returned by backend API filter:', docs.length);
  
  const ramOrders = docs.filter(o => o.userId?.name === 'ram');
  console.log('Total orders for ram in backend API response:', ramOrders.length);
  
  const ramDelivered = ramOrders.filter(o => o.orderStatus === 'delivered');
  console.log('Delivered orders for ram in backend API response:', ramDelivered.length);

  const ramSpent = ramOrders.reduce((sum, o) => sum + Number(o.pricing?.total || 0), 0);
  console.log('Total spent by ram (sum of all orders in response):', ramSpent);

  const ramDeliveredSpent = ramDelivered.reduce((sum, o) => sum + Number(o.pricing?.total || 0), 0);
  console.log('Total spent by ram (delivered only):', ramDeliveredSpent);

  process.exit(0);
}
check().catch(console.error);
