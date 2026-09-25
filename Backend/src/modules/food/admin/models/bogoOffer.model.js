import mongoose from 'mongoose';

const foodBogoOfferSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true, default: '' },
        bannerImage: { type: String, default: '' },
        
        status: { type: String, enum: ['active', 'paused', 'inactive'], default: 'active', index: true },
        
        // Scope
        restaurantScope: { type: String, enum: ['all', 'selected'], default: 'all', index: true },
        restaurantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodRestaurant' }],
        
        // Item specifics (Empty array means applies to ALL items for the scoped restaurants)
        eligibleItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }],
        freeItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }],
        
        // BOGO Configuration
        buyQuantity: { type: Number, default: 1, min: 1 },
        freeQuantity: { type: Number, default: 1, min: 1 },
        maxFreeItemsPerOrder: { type: Number, default: 1, min: 1 },
        
        maxRedemptions: { type: Number, default: null, min: 1 },
        maxRedemptionsPerUser: { type: Number, default: 1, min: 1 },
        minOrderValue: { type: Number, default: 0, min: 0 },
        maxDiscountAmount: { type: Number, default: null, min: 0 },
        
        // Budget & Liability
        campaignBudget: { type: Number, required: true, min: 0 },
        usedBudget: { type: Number, default: 0, min: 0 }, // Reserved + Settled amounts
        
        // Combinability
        combinableWithCoupons: { type: Boolean, default: false },
        
        // Sponsorship Configuration
        reimbursementType: { 
            type: String, 
            enum: ['full_price', 'fixed', 'custom'], 
            required: true,
            default: 'full_price'
        },
        fixedReimbursementAmount: { type: Number, default: 0, min: 0 },
        
        // Map of Restaurant ID (String) to Amount (Number) for custom
        customReimbursementConfig: { 
            type: Map,
            of: Number,
            default: {}
        },
        
        // Validity
        startDate: { type: Date },
        endDate: { type: Date }
    },
    { collection: 'food_bogo_offers', timestamps: true }
);

foodBogoOfferSchema.index({ status: 1, startDate: -1 });

export const FoodBogoOffer = mongoose.model('FoodBogoOffer', foodBogoOfferSchema);
