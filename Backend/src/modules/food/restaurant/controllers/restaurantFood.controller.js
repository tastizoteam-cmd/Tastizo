import { sendResponse, sendError } from '../../../../utils/response.js';
import { createRestaurantFood, updateRestaurantFood, deleteRestaurantFood } from '../services/restaurantFood.service.js';
import { FoodItem } from '../../admin/models/food.model.js';
import { FoodBogoOffer } from '../../admin/models/bogoOffer.model.js';

export const createRestaurantFoodController = async (req, res, next) => {
    try {
        const restaurantId = req.user?.userId;
        const food = await createRestaurantFood(restaurantId, req.body || {});
        return sendResponse(res, 201, 'Food created successfully', { food });
    } catch (error) {
        next(error);
    }
};

export const updateRestaurantFoodController = async (req, res, next) => {
    try {
        const restaurantId = req.user?.userId;
        const food = await updateRestaurantFood(restaurantId, req.params.id, req.body || {});
        if (!food) return sendError(res, 404, 'Food not found');
        return sendResponse(res, 200, 'Food updated successfully', { food });
    } catch (error) {
        next(error);
    }
};

export const deleteRestaurantFoodController = async (req, res, next) => {
    try {
        const restaurantId = req.user?.userId;
        const food = await deleteRestaurantFood(restaurantId, req.params.id);
        if (!food) return sendError(res, 404, 'Food not found');
        return sendResponse(res, 200, 'Food deleted successfully', { food });
    } catch (error) {
        next(error);
    }
};

export const getPublicB1G1FoodsController = async (req, res, next) => {
    try {
        const now = new Date();
        const activeBogoOffers = await FoodBogoOffer.find({
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).lean();

        if (activeBogoOffers.length === 0) {
            return sendResponse(res, 200, 'B1G1 foods retrieved', { foods: [] });
        }

        const bogoRestaurantIds = [];
        const bogoFoodIds = [];
        let hasGlobalOffer = false;

        for (const offer of activeBogoOffers) {
            if (offer.applyTo === 'all_restaurants') {
                hasGlobalOffer = true;
            } else {
                bogoRestaurantIds.push(...(offer.restaurantIds || []));
            }
            if (offer.eligibleItems && offer.eligibleItems.length > 0) {
                bogoFoodIds.push(...offer.eligibleItems);
            }
        }

        const query = { 
            isAvailable: true, 
            approvalStatus: 'approved' 
        };

        const orConditions = [ { isB1G1: true } ];
        if (bogoFoodIds.length > 0) orConditions.push({ _id: { $in: bogoFoodIds } });
        if (bogoRestaurantIds.length > 0) orConditions.push({ restaurantId: { $in: bogoRestaurantIds } });
        
        if (!hasGlobalOffer) {
            query.$or = orConditions;
        }

        const foods = await FoodItem.find(query)
            .populate('restaurantId', 'restaurantName image isVerified rating location')
            .limit(30)
            .lean();
        
        return sendResponse(res, 200, 'B1G1 foods retrieved', { foods });
    } catch (error) {
        next(error);
    }
};

export const getPublicBogoOffersController = async (req, res, next) => {
    try {
        const { restaurantId } = req.query;
        if (!restaurantId) {
            return sendResponse(res, 400, 'restaurantId is required');
        }

        const now = new Date();
        const offers = await FoodBogoOffer.find({
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
            $or: [
                { applyTo: 'all_restaurants' },
                { restaurantIds: restaurantId }
            ]
        }).lean();

        return sendResponse(res, 200, 'BOGO offers retrieved', { offers });
    } catch (error) {
        next(error);
    }
};
