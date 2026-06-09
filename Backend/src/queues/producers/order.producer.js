import { getOrderQueue } from '../index.js';
import { logger } from '../../utils/logger.js';

/**
 * Add an order processing job to the queue. No-op if BullMQ is disabled.
 * @param {object} data - Job data (e.g. { orderId, action })
 * @param {object} [options] - BullMQ job options override
 * @returns {Promise<import('bullmq').Job | null>}
 */
export const addOrderJob = async (data, options = {}) => {
    const queue = getOrderQueue();
    if (!queue) {
        logger.warn('BullMQ order queue not available. Using in-memory fallback.');
        const delay = options.delay || 0;
        
        // Use setTimeout to mock BullMQ delay
        setTimeout(async () => {
            try {
                // Dynamically import processor to avoid circular dependency
                const { processOrderJob } = await import('../processors/order.processor.js');
                
                // Mock BullMQ job object structure
                const mockJob = {
                    id: `in-memory-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                    name: 'process-order',
                    data: data,
                    timestamp: Date.now()
                };
                
                await processOrderJob(mockJob);
            } catch (err) {
                logger.error(`In-memory order job failed: ${err.message}`);
            }
        }, delay);
        
        return { id: 'in-memory-scheduled' };
    }
    try {
        const job = await queue.add('process-order', data, options);
        logger.info(`Order job added: ${job.id}`);
        return job;
    } catch (err) {
        logger.error(`Failed to add order job: ${err.message}`);
        throw err;
    }
};
