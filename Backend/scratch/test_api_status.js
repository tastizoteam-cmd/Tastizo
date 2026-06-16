import mongoose from 'mongoose';
import { FoodOrder } from '../src/modules/food/orders/models/order.model.js';
import { listOrdersRestaurant } from '../src/modules/food/orders/services/order.service.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const restaurantId = '69edec2622bce67ccf21242e'; // Atha Bakes
  
  // 1. Without status filter
  const allOrdersResult = await listOrdersRestaurant(restaurantId, { page: 1, limit: 100 });
  console.log('All orders count returned by service (no status filter):', allOrdersResult.data.length);

  // 2. With status=delivered filter
  const deliveredOrdersResult = await listOrdersRestaurant(restaurantId, { page: 1, limit: 100, status: 'delivered' });
  console.log('Delivered orders count returned by service (status=delivered):', deliveredOrdersResult.data.length);
  console.log('Delivered orders details (should be 5 in backend response):', deliveredOrdersResult.data.map(d => ({
    id: d._id,
    status: d.status,
    orderStatus: d.orderStatus,
    userId: d.userId
  })));

  process.exit(0);
}
check().catch(console.error);
