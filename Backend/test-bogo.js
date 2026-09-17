import mongoose from 'mongoose';
import { FoodBogoOffer } from './src/modules/food/admin/models/bogoOffer.model.js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function runTests() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected.");
        
        // 1. Create a BOGO offer
        console.log("1. Creating BOGO Offer...");
        const offer = await FoodBogoOffer.create({
            name: "Test BOGO 1",
            description: "Buy 1 Get 1 Free",
            buyQuantity: 1,
            freeQuantity: 1,
            maxFreeItemsPerOrder: 1,
            campaignBudget: 1000,
            reimbursementType: 'full_price',
            status: 'active'
        });
        console.log("Created BOGO Offer:", offer._id);

        const fetchedOffer = await FoodBogoOffer.findById(offer._id).lean();
        console.log("Fetched Offer Budget:", fetchedOffer.campaignBudget);
        console.log("Fetched Offer Used Budget:", fetchedOffer.usedBudget);
        
        console.log("3. Testing atomic budget reservation...");
        const subsidyAmount = 250;
        const updatedOffer = await FoodBogoOffer.findOneAndUpdate(
            { _id: offer._id, $expr: { $lte: [{ $add: ["$usedBudget", subsidyAmount] }, "$campaignBudget"] }, status: 'active' },
            { $inc: { usedBudget: subsidyAmount } },
            { new: true }
        );
        
        if (updatedOffer) {
            console.log("SUCCESS: Budget reserved! New usedBudget:", updatedOffer.usedBudget);
        } else {
            console.log("Failed to reserve budget!");
        }

        console.log("4. Testing budget exhaustion block...");
        const hugeSubsidyAmount = 1000;
        const failedOffer = await FoodBogoOffer.findOneAndUpdate(
            { _id: offer._id, $expr: { $lte: [{ $add: ["$usedBudget", hugeSubsidyAmount] }, "$campaignBudget"] }, status: 'active' },
            { $inc: { usedBudget: hugeSubsidyAmount } },
            { new: true }
        );
        
        if (!failedOffer) {
            console.log("SUCCESS: Budget exhaustion blocked correctly!");
        } else {
            console.log("FAIL: Budget was allowed to be exhausted!");
        }

        // Cleanup
        await FoodBogoOffer.findByIdAndDelete(offer._id);
        console.log("Test completed successfully.");
    } catch (err) {
        console.error("Test failed:", err);
    } finally {
        await mongoose.disconnect();
    }
}

runTests();
