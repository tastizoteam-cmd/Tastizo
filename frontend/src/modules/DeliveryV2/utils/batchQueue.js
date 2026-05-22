const QUEUE_KEY = 'delivery_gps_offline_queue';

export const saveToOfflineQueue = (payload) => {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push(payload);
    // Limit queue size to prevent local storage overflow (e.g. max 1000 points)
    if (queue.length > 1000) queue.shift();
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('Failed to save GPS to offline queue', e);
  }
};

export const getOfflineQueue = () => {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch (e) {
    return [];
  }
};

export const clearOfflineQueue = () => {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch (e) {}
};
