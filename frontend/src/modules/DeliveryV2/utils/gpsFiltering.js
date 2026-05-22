import { KalmanFilter } from './kalmanFilter';
import { getHaversineDistance } from './geo';

const MAX_ACCURACY_METERS = 60; // Reject points with accuracy worse than 60m
const MAX_SPEED_MPS = 45; // ~160 km/h, reject teleportation
const kalmanFilter = new KalmanFilter();

let lastValidLocation = null;

export const filterGpsSignal = (lat, lng, accuracy, timestamp) => {
  if (accuracy > MAX_ACCURACY_METERS) {
    return { valid: false, reason: 'accuracy_too_low' };
  }

  const now = timestamp || Date.now();

  if (lastValidLocation) {
    const timeDiffMs = now - lastValidLocation.timestamp;
    if (timeDiffMs > 0) {
      const dist = getHaversineDistance(lastValidLocation.lat, lastValidLocation.lng, lat, lng);
      const speed = dist / (timeDiffMs / 1000); // meters per second

      if (speed > MAX_SPEED_MPS) {
        return { valid: false, reason: 'teleportation_detected' };
      }
    }
  }

  const smoothed = kalmanFilter.process(lat, lng, accuracy, now);
  
  lastValidLocation = {
    lat: smoothed.lat,
    lng: smoothed.lng,
    timestamp: now,
  };

  return { valid: true, location: lastValidLocation };
};

export const resetGpsFilter = () => {
  lastValidLocation = null;
  kalmanFilter.variance = -1; // Reset Kalman state
};
