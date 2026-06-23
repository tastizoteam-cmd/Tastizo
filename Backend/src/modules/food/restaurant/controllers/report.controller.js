import { getLiveTrackingMetrics } from '../services/report.service.js';

export const getLiveTracking = async (req, res) => {
    try {
        const restaurantId = req.restaurant?._id || req.user?.restaurantId || req.user?.userId;
        if (!restaurantId) {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }

        const result = await getLiveTrackingMetrics(restaurantId);
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
