import mongoose from 'mongoose';

const foodUnder199BannerSchema = new mongoose.Schema(
    {
        imageUrl: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        title: {
            type: String
        },
        ctaText: {
            type: String
        },
        ctaLink: {
            type: String
        },
        zoneId: {
            type: String
        },
        sortOrder: {
            type: Number,
            default: 0,
            index: true
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        collection: 'food_under199_banners',
        timestamps: true
    }
);

foodUnder199BannerSchema.index({ isActive: 1, sortOrder: 1 });

export const FoodUnder199Banner = mongoose.model('FoodUnder199Banner', foodUnder199BannerSchema);

