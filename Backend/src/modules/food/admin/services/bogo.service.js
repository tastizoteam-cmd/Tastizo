import mongoose from 'mongoose';
import { FoodBogoOffer } from '../models/bogoOffer.model.js';
import { ValidationError, NotFoundError } from '../../../../core/auth/errors.js';
import { buildPaginatedResult } from '../../../../utils/helpers.js';

export async function createBogoOffer(body) {
    const offer = new FoodBogoOffer(body);
    await offer.save();
    return offer;
}

export async function getBogoOffers(query) {
    const { page = 1, limit = 20, status } = query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    
    const [docs, total] = await Promise.all([
        FoodBogoOffer.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        FoodBogoOffer.countDocuments(filter)
    ]);
    
    return buildPaginatedResult({ docs, total, page, limit });
}

export async function getBogoOfferById(id) {
    const offer = await FoodBogoOffer.findById(id).lean();
    if (!offer) throw new NotFoundError('BOGO Offer not found');
    return offer;
}

export async function updateBogoOffer(id, body) {
    const offer = await FoodBogoOffer.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true, runValidators: true }
    );
    if (!offer) throw new NotFoundError('BOGO Offer not found');
    return offer;
}

export async function deleteBogoOffer(id) {
    const offer = await FoodBogoOffer.findByIdAndDelete(id);
    if (!offer) throw new NotFoundError('BOGO Offer not found');
    return { success: true };
}

export async function getActiveBogoOffersForCustomer(restaurantId) {
    const now = new Date();
    
    const filter = {
        status: 'active',
        $and: [
            { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
            { $or: [{ endDate: null }, { endDate: { $gt: now } }] },
            { 
                $or: [
                    { campaignBudget: { $exists: false } },
                    { campaignBudget: null },
                    { $expr: { $lt: ["$usedBudget", "$campaignBudget"] } }
                ]
            }
        ]
    };
    
    if (restaurantId) {
        let restaurantMatch = { restaurantScope: 'all' };
        
        if (mongoose.Types.ObjectId.isValid(restaurantId)) {
            restaurantMatch = {
                $or: [
                    { restaurantScope: 'all' },
                    { restaurantScope: 'selected', restaurantIds: new mongoose.Types.ObjectId(restaurantId) }
                ]
            };
        } else {
            // If it's not a valid ObjectId (e.g., custom ID), we either fall back to 'all' or try matching as string
            // depending on schema. Here we just use 'all' or let it fail gracefully.
            restaurantMatch = {
                $or: [
                    { restaurantScope: 'all' }
                ]
            };
        }

        filter.$and.push(restaurantMatch);
    }
    
    const offers = await FoodBogoOffer.find(filter).lean();
    return offers;
}
