const fs = require('fs');
const path = 'src/modules/DeliveryV2/pages/DeliveryHomeV2.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
content = content.replace(
  "import { deliveryAPI } from '@food/api';",
  "import { deliveryAPI } from '@food/api';\nimport { useTrackingStore } from '@/modules/DeliveryV2/hooks/tracking/useTrackingStore';\nimport { useGpsTracker } from '@/modules/DeliveryV2/hooks/tracking/useGpsTracker';\nimport { useRealtimeSync } from '@/modules/DeliveryV2/hooks/tracking/useRealtimeSync';\nimport { useRouteManager } from '@/modules/DeliveryV2/hooks/tracking/useRouteManager';"
);

// 2. Fix Destructuring
content = content.replace(
  "const { isOnline, toggleOnline, riderLocation, activeOrder, tripStatus, setRiderLocation, setActiveOrder, updateTripStatus, clearActiveOrder } = useDeliveryStore();",
  "const { isOnline, toggleOnline, activeOrder, tripStatus, setActiveOrder, updateTripStatus, clearActiveOrder } = useDeliveryStore();\n  const riderLocation = useTrackingStore(state => state.riderLocation);\n  const setRiderLocation = useTrackingStore(state => state.setRiderLocation);\n  const activePolyline = useTrackingStore(state => state.activePolyline);\n  const setActivePolyline = useTrackingStore(state => state.setActivePolyline);\n  const eta = useTrackingStore(state => state.eta);"
);

// 3. Remove local duplicate states
content = content.replace("const [eta, setEta] = useState(null);\n", "");
content = content.replace("const [activePolyline, setActivePolyline] = useState(null);\n", "");

// 4. Remove tracking useEffect blocks
const startTrackingToken = `  useEffect(() => {
    trackingDepsRef.current = {
      activeOrder,`;

const endTrackingToken = `    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOnline, setRiderLocation, syncUsingFallbackLocation]);`;

const startIndex = content.indexOf(startTrackingToken);
const endIndex = content.indexOf(endTrackingToken);

if (startIndex !== -1 && endIndex !== -1) {
  const finalEndIndex = endIndex + endTrackingToken.length;
  const before = content.substring(0, startIndex);
  const after = content.substring(finalEndIndex);
  
  const replacement = `  // 3. Location logic (Smart Frequency Tracking) - Handled by Headless Engine
  useGpsTracker({ isOnline, isSimMode, syncUsingFallbackLocation });
  useRouteManager();
  useRealtimeSync({ isOnline, syncDeliveryZoneState, emitLocation });`;

  content = before + replacement + after;
} else {
  console.error("Could not find tracking block indices");
}

fs.writeFileSync(path, content, 'utf8');
console.log("SUCCESS");
