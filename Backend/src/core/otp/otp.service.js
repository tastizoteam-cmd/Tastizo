import crypto from 'crypto';
import ms from 'ms';
import { FoodOtp } from './otp.model.js';
import { config } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { ValidationError } from '../auth/errors.js';

const generateOtpCode = () => {
    const code = crypto.randomInt(1000, 9999);
    return String(code);
};

const buildOtpMessage = (otp) => {
    const template = config.smsOtpTemplate || 'Your OTP is {{OTP}}';
    return template.replace(/\{\{\s*OTP\s*\}\}/gi, otp);
};

const normalizePhoneDigits = (phone) => String(phone || '').replace(/\D/g, '');
const getDefaultOtpPhone = () => normalizePhoneDigits(config.defaultOtpPhone);
const getDefaultOtpCode = () =>
    String(config.defaultOtpCode || '1234').replace(/\D/g, '').slice(0, 4) || '1234';
const getComparablePhoneDigits = (phone) => normalizePhoneDigits(phone).slice(-10);
const isDefaultOtpPhoneMatch = (phone) => {
    const defaultPhone = getDefaultOtpPhone();
    const normalizedPhone = normalizePhoneDigits(phone);

    if (!normalizedPhone) {
        return false;
    }

    const staticPhones = [
        defaultPhone,
        '9889358225',
        '8299727770',
        '8604560988',
        '9235302905'
    ].filter(Boolean);

    const comparableInput = getComparablePhoneDigits(normalizedPhone);

    return staticPhones.some((p) => {
        const normalizedP = normalizePhoneDigits(p);
        return (
            normalizedPhone === normalizedP ||
            comparableInput === getComparablePhoneDigits(normalizedP)
        );
    });
};

/**
 * Sends SMS via StartMessaging API
 * @param {string} phone - 10-digit mobile number (will be prefixed with +91)
 * @param {string} otp
 */
const sendOtpViaStartMessaging = async (phone, otp) => {
    try {
        if (!config.startMessagingApiKey) {
            logger.error('StartMessaging config missing: api key is not set.');
            return;
        }

        const digits = String(phone || '').replace(/\D/g, '');
        const msisdn = digits.startsWith('91') ? `+${digits}` : `+91${digits}`;

        logger.info(`[SMS] Sending OTP to ${msisdn} via StartMessaging...`);

        const response = await fetch('https://api.startmessaging.com/otp/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': config.startMessagingApiKey
            },
            body: JSON.stringify({
                phoneNumber: msisdn,
                templateId: config.startMessagingTemplateId,
                variables: { otp, appName: "Tastizo" }
            })
        });

        const resultText = await response.text();
        let parsed = null;
        try {
            parsed = JSON.parse(resultText);
        } catch (_) {}

        if (!response.ok) {
            logger.error(`StartMessaging API HTTP error for ${phone}: ${response.status} - ${resultText}`);
        } else {
            logger.info(`SMS sent successfully to ${msisdn} via StartMessaging, response: ${resultText}`);
        }
    } catch (error) {
        logger.error(`Error sending SMS to ${phone} via StartMessaging: ${error.message}`);
        // Do not throw: OTP is already stored in DB; SMS failure should not block the flow.
    }
};

export const createOrUpdateOtp = async (phone) => {
    const existing = await FoodOtp.findOne({ phone })
        .select('requestCount lastRequestAt')
        .lean();
    const now = new Date();
    const defaultOtpCode = getDefaultOtpCode();
    const isDefaultOtpPhone = isDefaultOtpPhoneMatch(phone);

    if (existing && !isDefaultOtpPhone) {
        const windowMs = (config.otpRateWindow || 600) * 1000;
        const isInWindow = now - existing.lastRequestAt < windowMs;

        if (isInWindow) {
            if (existing.requestCount >= (config.otpRateLimit || 3)) {
                logger.warn(`Rate limit exceeded for phone ${phone}`);
                throw new ValidationError(`Too many OTP requests. Please try again after ${Math.ceil(windowMs / 60000)} minutes.`);
            }
            existing.requestCount += 1;
        } else {
            existing.requestCount = 1;
        }
    }

    let otp;

    if (config.useDefaultOtp || isDefaultOtpPhone) {
        otp = isDefaultOtpPhone ? defaultOtpCode : '1234';
        logger.info(`Default OTP mode enabled - OTP is ${otp} for phone ${phone}`);
    } else {
        otp = generateOtpCode();
        logger.info(`OTP generated for ${phone}: ${otp}`);
    }

    let ttlMs;
    if (config.otpExpirySeconds) {
        ttlMs = config.otpExpirySeconds * 1000;
    } else if (config.otpExpiryMinutes) {
        ttlMs = config.otpExpiryMinutes * 60 * 1000;
    } else {
        ttlMs = ms(config.otpExpiry || '5m');
    }
    const expiresAt = new Date(now.getTime() + ttlMs);

    if (existing) {
        await FoodOtp.updateOne(
            { phone },
            {
                $set: {
                    otp,
                    expiresAt,
                    attempts: 0,
                    lastRequestAt: now,
                    requestCount: isDefaultOtpPhone ? 0 : existing.requestCount
                }
            }
        );
    } else {
        await FoodOtp.create({
            phone,
            otp,
            expiresAt,
            requestCount: isDefaultOtpPhone ? 0 : 1,
            lastRequestAt: now
        });
    }

    if (!config.useDefaultOtp && !isDefaultOtpPhone) {
        await sendOtpViaStartMessaging(phone, otp);
    }

    return otp;
};

export const verifyOtp = async (phone, otp) => {
    const normalizedOtp = String(otp || '').replace(/\D/g, '').slice(0, 4);
    const isDefaultOtpMatch =
        isDefaultOtpPhoneMatch(phone) && normalizedOtp === getDefaultOtpCode();

    if (isDefaultOtpMatch) {
        return { valid: true };
    }

    const record = await FoodOtp.findOne({ phone });
    if (!record) {
        return { valid: false, reason: 'OTP not found' };
    }

    if (record.expiresAt < new Date()) {
        return { valid: false, reason: 'OTP expired' };
    }

    if (record.attempts >= config.otpMaxAttempts) {
        return { valid: false, reason: 'Max attempts exceeded' };
    }

    record.attempts += 1;

    if (record.otp !== normalizedOtp) {
        await record.save();
        return { valid: false, reason: 'Invalid OTP' };
    }

    await record.deleteOne();
    return { valid: true };
};
