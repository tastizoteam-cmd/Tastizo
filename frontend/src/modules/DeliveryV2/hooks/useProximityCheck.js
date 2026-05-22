import { useMemo } from 'react';
import { useDeliveryStore } from '@/modules/DeliveryV2/store/useDeliveryStore';
import { useTrackingStore } from '@/modules/DeliveryV2/hooks/tracking/useTrackingStore';
import { calculateDistance } from '@/modules/DeliveryV2/hooks/proximity.utils';

/**
 * useProximityCheck - Professional hook for dynamic range monitoring.
 * Ensures rider can only advance based on Admin-defined ranges.
 * 
 * @returns {Object} { distanceToTarget, isWithinRange, actionLimit }
 */
export const useProximityCheck = () => {
  const riderLocation = useTrackingStore((state) => state.riderLocation);
  const activeOrder = useDeliveryStore((state) => state.activeOrder);
  const tripStatus = useDeliveryStore((state) => state.tripStatus);
  const settings = useDeliveryStore((state) => state.settings);

  // Determine current target based on trip state
  const targetLocation = useMemo(() => {
    if (!activeOrder) return null;
    
    let rawLoc = null;
    // If heading to pickup or arrived at pickup, target is restaurant
    if (['PICKING_UP', 'REACHED_PICKUP'].includes(tripStatus)) {
      rawLoc = activeOrder.restaurantLocation || activeOrder.restaurant_location;
    }
    
    // If heading to drop or arrived at drop, target is customer
    if (['PICKED_UP', 'REACHED_DROP'].includes(tripStatus)) {
      rawLoc = activeOrder.customerLocation || activeOrder.customer_location;
    }
    
    if (!rawLoc) return null;
    
    const lat = parseFloat(rawLoc.lat ?? rawLoc.latitude ?? (Array.isArray(rawLoc.coordinates) ? rawLoc.coordinates[1] : null));
    const lng = parseFloat(rawLoc.lng ?? rawLoc.longitude ?? (Array.isArray(rawLoc.coordinates) ? rawLoc.coordinates[0] : null));
    return (Number.isFinite(lat) && Number.isFinite(lng)) ? { lat, lng } : null;
  }, [activeOrder, tripStatus]);

  // Determine current range limit from admin settings
  const actionLimit = useMemo(() => {
    if (tripStatus === 'PICKING_UP') return settings.pickupRangeLimit || 500;
    if (tripStatus === 'PICKED_UP') return settings.deliveryRangeLimit || 500;
    return 500;
  }, [tripStatus, settings]);

  // Calculate real-time distance
  const distanceToTarget = useMemo(() => {
    if (!riderLocation || !targetLocation) return Infinity;
    
    const rLat = parseFloat(riderLocation.lat ?? riderLocation.latitude);
    const rLng = parseFloat(riderLocation.lng ?? riderLocation.longitude);
    
    if (!Number.isFinite(rLat) || !Number.isFinite(rLng)) return Infinity;
    
    return calculateDistance(
      rLat,
      rLng,
      targetLocation.lat,
      targetLocation.lng
    );
  }, [riderLocation, targetLocation]);

  // Dev mode bypass
  const isDevMode = import.meta.env.VITE_APP_MODE === 'developer' || 
                    import.meta.env.VITE_ENABLE_RANGE_BYPASS === 'true' ||
                    import.meta.env.DEV;

  const isWithinRange = isDevMode ? true : (distanceToTarget <= actionLimit);

  return {
    distanceToTarget,
    isWithinRange,
    actionLimit,
  };
};
