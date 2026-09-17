import { sendResponse } from '../../../../utils/response.js';
import * as bogoService from '../services/bogo.service.js';

export async function createBogoOffer(req, res, next) {
    try {
        const offer = await bogoService.createBogoOffer(req.body);
        return sendResponse(res, 201, 'BOGO Offer created successfully', { offer });
    } catch (err) {
        next(err);
    }
}

export async function getBogoOffers(req, res, next) {
    try {
        const result = await bogoService.getBogoOffers(req.query);
        return sendResponse(res, 200, 'BOGO Offers retrieved', result);
    } catch (err) {
        next(err);
    }
}

export async function getBogoOfferById(req, res, next) {
    try {
        const offer = await bogoService.getBogoOfferById(req.params.id);
        return sendResponse(res, 200, 'BOGO Offer retrieved', { offer });
    } catch (err) {
        next(err);
    }
}

export async function updateBogoOffer(req, res, next) {
    try {
        const offer = await bogoService.updateBogoOffer(req.params.id, req.body);
        return sendResponse(res, 200, 'BOGO Offer updated successfully', { offer });
    } catch (err) {
        next(err);
    }
}

export async function deleteBogoOffer(req, res, next) {
    try {
        await bogoService.deleteBogoOffer(req.params.id);
        return sendResponse(res, 200, 'BOGO Offer deleted successfully');
    } catch (err) {
        next(err);
    }
}

export async function getActiveBogoOffersForCustomer(req, res, next) {
    try {
        const restaurantId = req.query.restaurantId;
        const offers = await bogoService.getActiveBogoOffersForCustomer(restaurantId);
        return sendResponse(res, 200, 'Active BOGO Offers retrieved', { offers });
    } catch (err) {
        next(err);
    }
}
