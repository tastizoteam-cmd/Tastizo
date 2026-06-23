import mongoose from 'mongoose';
import { FoodOffer } from '../../admin/models/offer.model.js';
import { sendResponse, sendError } from '../../../../utils/response.js';

export const createRestaurantOfferController = async (req, res, next) => {
    try {
        const restaurantId = req.user?.userId;
        const {
            couponCode,
            couponType,
            discountType,
            discountValue,
            minOrderValue,
            maxDiscount,
            usageLimit,
            perUserLimit,
            startDate,
            endDate
        } = req.body;

        if (!couponCode || !discountValue) {
            return sendError(res, 400, 'couponCode and discountValue are required');
        }

        const code = String(couponCode).trim().toUpperCase();

        const existing = await FoodOffer.findOne({ couponCode: code });
        if (existing) {
            return sendError(res, 400, 'Coupon code already exists');
        }

        const offer = new FoodOffer({
            couponCode: code,
            couponType: couponType || 'delivery',
            discountType: discountType || 'percentage',
            discountValue: Number(discountValue),
            customerScope: 'all',
            createdBy: 'restaurant',
            restaurantScope: 'selected',
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            minOrderValue: Number(minOrderValue) || 0,
            maxDiscount: maxDiscount ? Number(maxDiscount) : null,
            usageLimit: usageLimit ? Number(usageLimit) : null,
            perUserLimit: perUserLimit ? Number(perUserLimit) : null,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            status: 'active',
            showInCart: true
        });

        await offer.save();

        return sendResponse(res, 201, 'Offer created successfully', { offer });
    } catch (err) {
        next(err);
    }
};
