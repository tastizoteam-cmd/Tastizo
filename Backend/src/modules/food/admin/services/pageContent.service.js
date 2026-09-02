import { FoodPageContent } from '../models/pageContent.model.js';
import { ValidationError } from '../../../../core/auth/errors.js';

const normalizeKey = (key) => String(key || '').trim().toLowerCase();

const decodeHtmlEntities = (value) => {
    if (value === null || value === undefined) return value;
    let s = String(value);
    if (!s.includes('&')) return s;
    return s
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");
};

const normalizeLegalForResponse = (legal) => {
    if (!legal || typeof legal !== 'object') return legal;
    const title = legal.title ?? '';
    const content = decodeHtmlEntities(legal.content ?? '');
    return { ...legal, title, content };
};

const normalizeAboutForResponse = (about) => {
    if (!about || typeof about !== 'object') return about;
    return {
        ...about,
        appName: decodeHtmlEntities(about.appName ?? ''),
        version: decodeHtmlEntities(about.version ?? ''),
        description: decodeHtmlEntities(about.description ?? ''),
        logo: decodeHtmlEntities(about.logo ?? '')
    };
};

const DEFAULT_LEGAL_TITLES = {
    terms: 'Terms and Conditions',
    privacy: 'Privacy Policy',
    refund: 'Refund Policy',
    shipping: 'Shipping Policy',
    cancellation: 'Cancellation Policy'
};

export const getPublicPageByKey = async (key) => {
    const k = normalizeKey(key);
    const doc = await FoodPageContent.findOne({ key: k }).lean();
    if (!doc) {
        if (k === 'about') {
            return {
                key: k,
                data: {
                    appName: 'Tastizo',
                    version: '1.0.0',
                    description: '',
                    logo: '',
                    features: []
                }
            };
        }
        if (DEFAULT_LEGAL_TITLES[k]) {
            return {
                key: k,
                data: {
                    title: DEFAULT_LEGAL_TITLES[k],
                    content: ''
                }
            };
        }
        return { key: k, data: null };
    }
    if (k === 'about') return { key: k, data: normalizeAboutForResponse(doc.about || null) };
    return { key: k, data: normalizeLegalForResponse(doc.legal || null) };
};

export const getAdminPageByKey = async (key) => getPublicPageByKey(key);

export const upsertLegalPage = async (key, payload, updatedBy) => {
    const k = normalizeKey(key);
    if (!['terms', 'privacy', 'refund', 'shipping', 'cancellation'].includes(k)) {
        throw new ValidationError('Invalid page key');
    }
    const title = String(payload?.title || '').trim();
    const content = decodeHtmlEntities(String(payload?.content || '')).trim();

    const doc = await FoodPageContent.findOneAndUpdate(
        { key: k },
        {
            $set: {
                key: k,
                legal: { title, content },
                about: undefined,
                updatedBy: updatedBy || null,
                updatedByRole: 'ADMIN'
            }
        },
        { upsert: true, new: true }
    ).lean();

    return { key: k, data: normalizeLegalForResponse(doc?.legal || null) };
};

export const upsertAboutPage = async (payload, updatedBy) => {
    const appName = decodeHtmlEntities(String(payload?.appName || '')).trim() || 'Tastizo Food';
    const version = decodeHtmlEntities(String(payload?.version || '')).trim() || '1.0.0';
    const description = decodeHtmlEntities(String(payload?.description || '')).trim();
    const logo = decodeHtmlEntities(String(payload?.logo || '')).trim();
    const features = Array.isArray(payload?.features) ? payload.features : [];
    const stats = Array.isArray(payload?.stats) ? payload.stats : [];

    const normalizedFeatures = features.map((f, idx) => ({
        icon: String(f?.icon || 'Heart'),
        title: String(f?.title || ''),
        description: String(f?.description || ''),
        color: String(f?.color || ''),
        bgColor: String(f?.bgColor || ''),
        order: Number.isFinite(Number(f?.order)) ? Number(f.order) : idx
    }));

    const doc = await FoodPageContent.findOneAndUpdate(
        { key: 'about' },
        {
            $set: {
                key: 'about',
                about: { appName, version, description, logo, features: normalizedFeatures, stats },
                legal: undefined,
                updatedBy: updatedBy || null,
                updatedByRole: 'ADMIN'
            }
        },
        { upsert: true, new: true }
    ).lean();

    return { key: 'about', data: normalizeAboutForResponse(doc?.about || null) };
};

