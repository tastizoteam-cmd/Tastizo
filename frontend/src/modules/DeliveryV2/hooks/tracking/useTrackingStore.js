import { create } from 'zustand';

/**
 * useTrackingStore - Transient store for high-frequency GPS data.
 * Components should subscribe to specific fields or use refs to avoid full re-renders.
 */
const readInitialStoredLocation = () => {
  try {
    const raw = localStorage.getItem('deliveryBoyLastLocation');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        const lat = Number(parsed[0]);
        const lng = Number(parsed[1]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          return { lat, lng, heading: 0 };
        }
      }
    }
  } catch (e) {
    // Ignore
  }
  return null; // Let the active order dynamic fallback handle it when GPS is blocked
};

export const useTrackingStore = create((set, get) => ({
  riderLocation: readInitialStoredLocation(),
  activePolyline: null,
  distanceToTarget: Infinity,
  eta: null,
  simPath: [],

  setRiderLocation: (location) => set({ riderLocation: location }),
  setActivePolyline: (polyline) => set({ activePolyline: polyline }),
  setDistanceToTarget: (distance) => set({ distanceToTarget: distance }),
  setEta: (eta) => set({ eta }),
  setSimPath: (path) => set({ simPath: path }),

  // Helpers
  clearTrackingData: () => set({
    activePolyline: null,
    distanceToTarget: Infinity,
    eta: null,
    simPath: [],
  })
}));
