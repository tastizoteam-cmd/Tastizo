import { useState, useCallback, useEffect } from 'react';
import { restaurantAPI } from "@food/api";

export const useUnder199Data = (zoneId) => {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [restRes] = await Promise.all([
        restaurantAPI.getRestaurantsUnder199(zoneId),
      ]);

      if (restRes.data?.success) setRestaurants(restRes.data.data.restaurants || []);
      // Old backend endpoints (categories + under-199 banner) removed.
      setCategories([]);
      setBanner(null);
    } catch (err) {
      console.error("Failed to fetch Under 199 data", err);
    } finally {
      setLoading(false);
    }
  }, [zoneId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { restaurants, categories, banner, loading };
};
