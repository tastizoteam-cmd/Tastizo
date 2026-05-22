/**
 * 2D Kalman Filter for GPS coordinates
 * Mathematically smooths signal noise and jitter from raw GPS coordinates.
 */
export class KalmanFilter {
  constructor(minAccuracy = 1) {
    this.minAccuracy = minAccuracy;
    this.qMs = 0.001; // Process noise covariance (meters per second)
    this.timeStampMs = 0;
    this.lat = 0;
    this.lng = 0;
    this.variance = -1; // -1 means uninitialized
  }

  process(latMeasurement, lngMeasurement, accuracy, timeStampMs) {
    if (accuracy < this.minAccuracy) {
      accuracy = this.minAccuracy;
    }

    if (this.variance < 0) {
      // Uninitialized
      this.lat = latMeasurement;
      this.lng = lngMeasurement;
      this.variance = accuracy * accuracy;
      this.timeStampMs = timeStampMs;
      return { lat: this.lat, lng: this.lng };
    }

    const timeIncMs = timeStampMs - this.timeStampMs;
    if (timeIncMs > 0) {
      // Time has moved on, noise has increased
      this.variance += (timeIncMs * this.qMs * this.qMs) / 1000.0;
      this.timeStampMs = timeStampMs;
    }

    const k = this.variance / (this.variance + accuracy * accuracy);
    this.lat += k * (latMeasurement - this.lat);
    this.lng += k * (lngMeasurement - this.lng);
    this.variance = (1 - k) * this.variance;

    return { lat: this.lat, lng: this.lng };
  }
}
