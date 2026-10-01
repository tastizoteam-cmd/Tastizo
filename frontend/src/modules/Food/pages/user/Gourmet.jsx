import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Clock, Bookmark, BadgePercent, ChefHat } from "lucide-react"
import { Button } from "@food/components/ui/button"
import api from "@food/api"
import useAppBackNavigation from "@food/hooks/useAppBackNavigation"
import { toast } from "sonner"
import { API_BASE_URL } from "@food/api/config"
import OptimizedImage from "@food/components/OptimizedImage"
import { RestaurantGridSkeleton } from "@food/components/ui/loading-skeletons"
import { useDelayedLoading } from "@food/hooks/useDelayedLoading"
import { useLocation } from "@food/hooks/useLocation"

const debugLog = (...args) => {}
const debugWarn = (...args) => {}
const debugError = (...args) => {}

export default function Gourmet() {
  const navigate = useNavigate()
  const goBack = useAppBackNavigation()
  const [favorites, setFavorites] = useState(new Set())
  const [gourmetRestaurants, setGourmetRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { location } = useLocation()
  const showGourmetSkeleton = useDelayedLoading(loading)

  const backendOrigin = (API_BASE_URL || "").replace(/\/api\/v1\/?$/, "")

  const resolveImageUrl = (url) => {
    if (typeof url !== "string") return ""
    const trimmed = url.trim()
    if (!trimmed) return ""
    if (/^(https?:|\/\/|data:|blob:)/i.test(trimmed)) return trimmed
    if (!backendOrigin) return trimmed
    return `${backendOrigin.replace(/\/$/, "")}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`
  }

  // Fetch Gourmet restaurants from public API
  useEffect(() => {
    const fetchGourmetRestaurants = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get('/food/hero-banners/gourmet/public')
        const data = response?.data?.data
        const list = data?.restaurants ?? (Array.isArray(data) ? data : [])
        setGourmetRestaurants(list)
      } catch (err) {
        debugError('Error fetching Gourmet restaurants:', err)
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load Gourmet restaurants'
        setError(errorMessage)
        toast.error(errorMessage)
        setGourmetRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    fetchGourmetRestaurants()
  }, [])

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Minimal Banner Section */}
      <div className="relative w-full pt-16 pb-8 md:pt-20 md:pb-10 flex flex-col items-center justify-center bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800">
        {/* Back Button */}
        <button
          onClick={goBack}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-20 w-10 h-10 md:w-12 md:h-12 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Banner Content */}
        <div className="relative z-10 text-center px-4 space-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Gourmet
          </h1>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium max-w-lg mx-auto">
            Premium Dining Experiences
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-8 md:py-10 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
             <p className="text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase">
               {showGourmetSkeleton ? '...' : gourmetRestaurants.length} Restaurants Available
             </p>
          </div>

          {/* Loading State */}
          {showGourmetSkeleton && <RestaurantGridSkeleton count={4} />}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800">
              <p className="text-red-500 dark:text-red-400 text-center">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Try Again</Button>
            </div>
          )}

          {/* Restaurant Cards */}
          {!showGourmetSkeleton && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {gourmetRestaurants.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800">
                  <ChefHat className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white">No Gourmet Restaurants</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please check back later for premium options.</p>
                </div>
              ) : (
                gourmetRestaurants.map((item) => {
                  const restaurant = item.restaurant || item
                  const restaurantSlug = restaurant.slug || restaurant.restaurantName?.toLowerCase().replace(/\s+/g, "-") || restaurant.name?.toLowerCase().replace(/\s+/g, "-") || ""
                  const restaurantId = restaurant._id || restaurant.restaurantId || restaurant.id
                  const isFavorite = favorites.has(restaurantId)

                  // Calculate distance
                  const calculateDistance = (lat1, lng1, lat2, lng2) => {
                    const R = 6371; 
                    const dLat = ((lat2 - lat1) * Math.PI) / 180;
                    const dLng = ((lng2 - lng1) * Math.PI) / 180;
                    const a =
                      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos((lat1 * Math.PI) / 180) *
                        Math.cos((lat2 * Math.PI) / 180) *
                        Math.sin(dLng / 2) *
                        Math.sin(dLng / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    return R * c; 
                  };

                  let distanceStr = '1.2 km'
                  const restaurantLat = restaurant.location?.latitude || restaurant.location?.coordinates?.[1]
                  const restaurantLng = restaurant.location?.longitude || restaurant.location?.coordinates?.[0]
                  
                  if (location?.latitude && location?.longitude && restaurantLat && restaurantLng) {
                    const d = calculateDistance(location.latitude, location.longitude, restaurantLat, restaurantLng)
                    distanceStr = `${d.toFixed(1)} km`
                  } else if (restaurant.distance) {
                    distanceStr = restaurant.distance
                  }

                  const coverImages = restaurant.coverImages && restaurant.coverImages.length > 0
                    ? restaurant.coverImages.map(img => img.url || img).filter(Boolean)
                    : []

                  const menuImages = restaurant.menuImages && restaurant.menuImages.length > 0
                    ? restaurant.menuImages.map(img => img.url || img).filter(Boolean)
                    : []

                  const rawRestaurantImage =
                    coverImages.length > 0
                      ? coverImages[0]
                      : (menuImages.length > 0
                        ? menuImages[0]
                        : (restaurant.profileImage?.url || restaurant.profileImage || restaurant.image || ""))

                  const restaurantImage = resolveImageUrl(rawRestaurantImage)

                  return (
                    <Link key={restaurantId} to={`/user/restaurants/${restaurantSlug}`}>
                      <div className="group bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
                        {/* Image Section */}
                        <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                          {restaurantImage ? (
                            <OptimizedImage
                              src={restaurantImage}
                              alt={restaurant.restaurantName || restaurant.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <ChefHat className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
                              <span className="text-gray-400 dark:text-gray-600 text-xs font-medium uppercase tracking-widest">
                                No Image
                              </span>
                            </div>
                          )}

                          {/* Bookmark Icon */}
                          <button
                            className="absolute top-3 right-3 h-8 w-8 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleFavorite(restaurantId)
                            }}
                          >
                            <Bookmark className={`h-4 w-4 ${isFavorite ? "fill-gray-900 text-gray-900 dark:fill-white dark:text-white" : "text-gray-500 dark:text-gray-400"}`} strokeWidth={2} />
                          </button>
                        </div>

                        {/* Content Section */}
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 flex-1">
                              {restaurant.restaurantName || restaurant.name}
                            </h3>
                            <div className="flex-shrink-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded flex items-center gap-1">
                              <span className="text-xs font-bold">{restaurant.rating?.toFixed(1) || '0.0'}</span>
                              <Star className="h-3 w-3 fill-current" />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 mb-4 tracking-wide uppercase">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{restaurant.estimatedDeliveryTime || '25-30 mins'}</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                            <span>{distanceStr}</span>
                          </div>

                          {/* Push offer to bottom */}
                          <div className="mt-auto">
                            {restaurant.offer ? (
                              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-2.5 py-1.5 rounded-md border border-green-100 dark:border-green-900/30 uppercase tracking-wider">
                                <BadgePercent className="h-3.5 w-3.5" />
                                <span>{restaurant.offer}</span>
                              </div>
                            ) : (
                              <div className="h-[28px]"></div> /* Placeholder for alignment */
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
