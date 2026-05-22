import { useEffect, useRef } from 'react';
import { useTrackingStore } from './useTrackingStore';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { getHaversineDistance, calculateETA } from '../../utils/geo';

/**
 * useRouteManager - Handles local ETA and distance calculations.
 */
export const useRouteManager = () => {
  const riderLocation = useTrackingStore(state => state.riderLocation);
  const setDistanceToTarget = useTrackingStore(state => state.setDistanceToTarget);
  const setEta = useTrackingStore(state => state.setEta);

  const activeOrder = useDeliveryStore(state => state.activeOrder);
  const tripStatus = useDeliveryStore(state => state.tripStatus);

  useEffect(() => {
    if (!riderLocation || !activeOrder) {
      setDistanceToTarget(Infinity);
      setEta(null);
      return;
    }

    let targetLoc = null;
    if (['PICKING_UP', 'REACHED_PICKUP'].includes(tripStatus)) {
      targetLoc = activeOrder.restaurantLocation;
    } else if (['PICKED_UP', 'REACHED_DROP'].includes(tripStatus)) {
      targetLoc = activeOrder.customerLocation;
    }

    if (targetLoc && targetLoc.lat && targetLoc.lng) {
      const distance = getHaversineDistance(
        riderLocation.lat, riderLocation.lng,
        targetLoc.lat, targetLoc.lng
      );
      
      setDistanceToTarget(distance);
      
      // Calculate ETA using current speed or fallback to 8 m/s (~28 km/h)
      const speed = riderLocation.speed && riderLocation.speed > 2 ? riderLocation.speed : 8;
      setEta(calculateETA(distance, speed));
    }
  }, [riderLocation, activeOrder, tripStatus, setDistanceToTarget, setEta]);
};
