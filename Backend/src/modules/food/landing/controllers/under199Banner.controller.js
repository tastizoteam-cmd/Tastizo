import {
    listUnder199Banners,
    createUnder199BannersFromFiles,
    deleteUnder199Banner,
    updateUnder199BannerOrder,
    toggleUnder199BannerStatus
} from '../services/under199Banner.service.js';
import { sendResponse } from '../../../../utils/response.js';
import { ValidationError } from '../../../../core/auth/errors.js';

export const listUnder199BannersController = async (req, res, next) => {
    try {
        const data = await listUnder199Banners();
        return sendResponse(res, 200, 'Under 199 banners fetched successfully', { banners: data });
    } catch (error) {
        next(error);
    }
};

export const uploadUnder199BannersController = async (req, res, next) => {
    try {
        if (!req.files || !req.files.length) {
            throw new ValidationError('No files uploaded');
        }

        const meta = {
            title: req.body.title,
            ctaText: req.body.ctaText,
            ctaLink: req.body.ctaLink,
            zoneId: req.body.zoneId,
        };

        const results = await createUnder199BannersFromFiles(req.files, meta);
        const banners = results.filter(r => r.success).map(r => r.banner);
        const errors = results.filter(r => !r.success).map(r => r.error);

        return sendResponse(res, 201, 'Under 199 banners processed', { banners, errors, results });
    } catch (error) {
        next(error);
    }
};

export const deleteUnder199BannerController = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new ValidationError('Banner id is required');
        }
        const result = await deleteUnder199Banner(id);
        return sendResponse(res, 200, result.deleted ? 'Under 199 banner deleted' : 'Under 199 banner not found', result);
    } catch (error) {
        next(error);
    }
};

export const updateUnder199BannerOrderController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { order } = req.body;
        const sortOrder = Number(order);
        if (!id || Number.isNaN(sortOrder)) {
            throw new ValidationError('id and numeric order are required');
        }
        const updated = await updateUnder199BannerOrder(id, sortOrder);
        return sendResponse(res, 200, 'Under 199 banner order updated', updated);
    } catch (error) {
        next(error);
    }
};

export const toggleUnder199BannerStatusController = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new ValidationError('Banner id is required');
        }
        // Frontend sends empty body, so toggle based on current
        const banner = await listUnder199Banners().then(list => list.find(b => b._id.toString() === id));
        if (!banner) {
            throw new ValidationError('Under 199 banner not found');
        }
        const updated = await toggleUnder199BannerStatus(id, !banner.isActive);
        return sendResponse(res, 200, 'Under 199 banner status updated', updated);
    } catch (error) {
        next(error);
    }
};

