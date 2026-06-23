import { FoodOrder } from '../../orders/models/order.model.js';
import { FoodTransaction } from '../../orders/models/foodTransaction.model.js';
import mongoose from 'mongoose';

export const getLiveTrackingMetrics = async (restaurantId) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        // Define the previous 5 equivalent days (e.g. 5 previous Saturdays)
        // Since we don't have enough data history for an exact trendline, we'll just get the last 5 days
        const trendDays = [];
        for (let i = 4; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            trendDays.push(d);
        }

        const metrics = {
            sales: { current: 0, trend: [] },
            deliveredOrders: { current: 0, trend: [] },
            aov: { current: 0, trend: [] },
            ratings: { current: 0, trend: [] },
            rejectedOrders: { current: 0, trend: [] },
            delayedOrders: { current: 0, trend: [] },
            poorRatedOrders: { current: 0, trend: [] },
        };

        // Helper to get orders for a specific day
        const getDayStats = async (date) => {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const orders = await FoodOrder.find({
                restaurantId: new mongoose.Types.ObjectId(restaurantId),
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            }).lean();

            let sales = 0;
            let delivered = 0;
            let rejected = 0;
            let delayed = 0;
            let poorRated = 0;
            let totalRating = 0;
            let ratingCount = 0;

            for (const order of orders) {
                // Sales and Delivered Orders
                if (order.orderStatus === 'delivered') {
                    delivered++;
                    // We can sum subtotal as sales for the restaurant
                    sales += Number(order.pricing?.subtotal || 0);
                    
                    // Check if delayed (> 45 mins)
                    if (order.deliveryState?.deliveredAt && order.createdAt) {
                        const deliveryTime = (new Date(order.deliveryState.deliveredAt).getTime() - new Date(order.createdAt).getTime()) / (1000 * 60);
                        if (deliveryTime > 45) {
                            delayed++;
                        }
                    }

                    // For now, simulate ratings since rating system might be separate
                    // Normally you'd query a Review collection. We'll leave it as 0 if not present.
                    if (order.rating) {
                        totalRating += order.rating;
                        ratingCount++;
                        if (order.rating < 3) poorRated++;
                    }
                }

                // Rejected Orders
                if (order.orderStatus === 'cancelled_by_restaurant' || order.cancelledBy === 'restaurant') {
                    rejected++;
                }
            }

            const totalOrders = orders.length || 1; // Prevent division by zero
            const aov = delivered > 0 ? Math.round(sales / delivered) : 0;
            const avgRating = ratingCount > 0 ? Number((totalRating / ratingCount).toFixed(1)) : 0;
            const rejectedPct = Number(((rejected / totalOrders) * 100).toFixed(1));
            const delayedPct = delivered > 0 ? Number(((delayed / delivered) * 100).toFixed(1)) : 0;
            const poorRatedPct = ratingCount > 0 ? Number(((poorRated / ratingCount) * 100).toFixed(1)) : 0;

            return { sales, delivered, aov, avgRating, rejectedPct, delayedPct, poorRatedPct };
        };

        // Populate trend data
        for (const date of trendDays) {
            const stats = await getDayStats(date);
            metrics.sales.trend.push(stats.sales);
            metrics.deliveredOrders.trend.push(stats.delivered);
            metrics.aov.trend.push(stats.aov);
            metrics.ratings.trend.push(stats.avgRating);
            metrics.rejectedOrders.trend.push(stats.rejectedPct);
            metrics.delayedOrders.trend.push(stats.delayedPct);
            metrics.poorRatedOrders.trend.push(stats.poorRatedPct);
        }

        // Set current values to today (last item in trend array)
        metrics.sales.current = metrics.sales.trend[metrics.sales.trend.length - 1];
        metrics.deliveredOrders.current = metrics.deliveredOrders.trend[metrics.deliveredOrders.trend.length - 1];
        metrics.aov.current = metrics.aov.trend[metrics.aov.trend.length - 1];
        metrics.ratings.current = metrics.ratings.trend[metrics.ratings.trend.length - 1];
        metrics.rejectedOrders.current = metrics.rejectedOrders.trend[metrics.rejectedOrders.trend.length - 1];
        metrics.delayedOrders.current = metrics.delayedOrders.trend[metrics.delayedOrders.trend.length - 1];
        metrics.poorRatedOrders.current = metrics.poorRatedOrders.trend[metrics.poorRatedOrders.trend.length - 1];

        // Previous week data for comparison
        const prevStats = await getDayStats(lastWeek);

        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Number((((current - previous) / previous) * 100).toFixed(1));
        };

        return {
            success: true,
            data: {
                metrics,
                changes: {
                    sales: calculateChange(metrics.sales.current, prevStats.sales),
                    deliveredOrders: calculateChange(metrics.deliveredOrders.current, prevStats.delivered),
                    aov: calculateChange(metrics.aov.current, prevStats.aov),
                    ratings: calculateChange(metrics.ratings.current, prevStats.avgRating),
                    rejectedOrders: calculateChange(metrics.rejectedOrders.current, prevStats.rejectedPct),
                    delayedOrders: calculateChange(metrics.delayedOrders.current, prevStats.delayedPct),
                    poorRatedOrders: calculateChange(metrics.poorRatedOrders.current, prevStats.poorRatedPct)
                }
            }
        };

    } catch (error) {
        console.error("Error generating live tracking metrics:", error);
        return { success: false, message: "Error generating metrics" };
    }
};
