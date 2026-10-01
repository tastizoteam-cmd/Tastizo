import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Clock, Copy, CheckCircle } from "lucide-react"
import { Button } from "@food/components/ui/button"
import { restaurantAPI } from "@food/api"
import useAppBackNavigation from "@food/hooks/useAppBackNavigation"
import { toast } from "sonner"
import { RestaurantGridSkeleton } from "@food/components/ui/loading-skeletons"
import { useDelayedLoading } from "@food/hooks/useDelayedLoading"

const debugLog = (...args) => {}
const debugWarn = (...args) => {}
const debugError = (...args) => {}

export default function Offers() {
  const navigate = useNavigate()
  const goBack = useAppBackNavigation()
  const [offers, setOffers] = useState([])
  const [groupedOffers, setGroupedOffers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const showOffersSkeleton = useDelayedLoading(loading)
  const [copiedCode, setCopiedCode] = useState(null)

  const handleCopy = (code) => {
    if (!code || code === "-") return
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.success("Coupon code copied!")
    setTimeout(() => setCopiedCode(null), 2000)
  }

  // Fetch offers from API
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await restaurantAPI.getPublicOffers()
        const data = response?.data?.data
        
        if (data) {
          const allOffers = Array.isArray(data.allOffers)
            ? data.allOffers.filter((offer) => String(offer?.couponType || "delivery").toLowerCase() !== "dining")
            : []
          const grouped = Object.entries(data.groupedByOffer || {}).reduce((acc, [key, dishes]) => {
            acc[key] = Array.isArray(dishes)
              ? dishes.filter((dish) => String(dish?.couponType || "delivery").toLowerCase() !== "dining")
              : []
            return acc
          }, {})
          setOffers(allOffers)
          setGroupedOffers(grouped)
        }
      } catch (err) {
        debugError('Error fetching offers:', err)
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load offers'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

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
            Great Offers
          </h1>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium max-w-lg mx-auto">
            Save big on your next meal
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-8 md:py-10 lg:py-12 space-y-8 md:space-y-10">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Loading State */}
        {showOffersSkeleton && <RestaurantGridSkeleton count={4} compact />}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30">
            <p className="text-red-500 dark:text-red-400 text-center font-medium text-lg">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">Try Again</Button>
          </div>
        )}

        {/* Offers Sections */}
        {!showOffersSkeleton && !error && (
          <>
            {/* Grouped Offers Sections */}
            {Object.keys(groupedOffers).length > 0 && Object.entries(groupedOffers).map(([offerText, dishes]) => (
              <section key={offerText}>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  {offerText}
                </h2>
                
                {/* Restaurant Cards - Grid Layout */}
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
                  {dishes.slice(0, 8).map((dish) => (
                    <Link 
                      key={dish.id} 
                      to={`/user/restaurants/${dish.restaurantSlug}`}
                      className="w-full block"
                    >
                      <div className="group bg-white dark:bg-[#111] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-sm transition-shadow">
                        <div className="relative h-32 sm:h-40">
                          <img 
                            src={dish.dishImage || dish.restaurantImage || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"} 
                            alt={dish.dishName}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm dark:bg-black/90 text-gray-900 dark:text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded shadow-sm">
                            {dish.offer}
                          </div>
                        </div>
                        
                        <div className="p-3">
                           <div className="flex justify-between items-start mb-1">
                             <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-1">
                               {dish.restaurantName}
                             </h3>
                             <div className="flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                               {dish.restaurantRating?.toFixed(1) || '0.0'}
                               <Star className="h-2.5 w-2.5 fill-current text-gray-700 dark:text-gray-300" />
                             </div>
                           </div>
                           
                           <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                             {dish.dishName} • ₹{dish.discountedPrice}
                           </p>
                           
                           <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                             <Clock className="h-3 w-3" />
                             <span>{dish.deliveryTime}</span>
                           </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}

            {/* Minimal Coupon-style offers */}
            {Object.keys(groupedOffers).length === 0 && offers.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Available Coupons
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offers.map((o) => {
                    const titleParts = (o.title || "Special Deal").split(' ');
                    const highlightText = titleParts[0];
                    const subText = titleParts.slice(1).join(' ');

                    return (
                      <div 
                        key={o.id || o.offerId} 
                        className="group bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800 p-5 transition-shadow hover:shadow-sm"
                      >
                        <div className="flex flex-col h-full justify-between space-y-4">
                          
                          {/* Top: Discount & Expiry */}
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-2xl font-black text-red-500 dark:text-red-400">{highlightText}</span>
                              {subText && <span className="ml-1 text-sm font-bold text-red-500/80 uppercase">{subText}</span>}
                            </div>
                            {o.endDate && (
                               <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded">
                                 Valid till {new Date(o.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                               </span>
                            )}
                          </div>
                          
                          {/* Middle: Restaurant Info */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {o.restaurantName || "Valid on all restaurants"}
                            </p>
                          </div>

                          {/* Bottom: Coupon Code */}
                          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</span>
                              
                              <button 
                                onClick={() => handleCopy(o.couponCode)}
                                className="flex items-center gap-2 group/btn hover:opacity-80 transition-opacity"
                              >
                                <span className="font-mono text-base font-bold text-gray-900 dark:text-white tracking-widest bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded border border-gray-100 dark:border-gray-800">
                                  {o.couponCode || "TASTIZO"}
                                </span>
                                {copiedCode === o.couponCode ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="h-4 w-4 text-gray-400 group-hover/btn:text-gray-600" />
                                )}
                              </button>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {offers.length === 0 && !loading && (
              <div className="text-center py-20 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Offers</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Please check back later for discounts.</p>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  )
}
