import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, Clock, Gift } from "lucide-react"
import { Button } from "@food/components/ui/button"
import { customerAPI } from "@food/api"
import useAppBackNavigation from "@food/hooks/useAppBackNavigation"
import { toast } from "sonner"
import { RestaurantGridSkeleton } from "@food/components/ui/loading-skeletons"
import { useDelayedLoading } from "@food/hooks/useDelayedLoading"
import OptimizedImage from "@food/components/OptimizedImage"

export default function B1G1Offers() {
  const navigate = useNavigate()
  const goBack = useAppBackNavigation()
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const showSkeleton = useDelayedLoading(loading)

  // Fetch B1G1 foods from API
  useEffect(() => {
    const fetchB1G1Foods = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await customerAPI.getPublicB1G1Foods()
        const data = response?.data?.data?.foods || []
        setFoods(data)
      } catch (err) {
        console.error('Error fetching B1G1 foods:', err)
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load B1G1 foods'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchB1G1Foods()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Minimal Banner Section */}
      <div className="relative w-full pt-16 pb-8 md:pt-20 md:pb-10 flex flex-col items-center justify-center bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 shadow-sm">
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
            Buy 1 Get 1
          </h1>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium max-w-lg mx-auto">
            Amazing B1G1 free deals on top restaurants
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-8 md:py-10 lg:py-12 space-y-8 md:space-y-10">
        <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        {/* Loading State */}
        {showSkeleton && <RestaurantGridSkeleton count={4} compact />}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30">
            <p className="text-red-500 dark:text-red-400 text-center font-medium text-lg">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">Try Again</Button>
          </div>
        )}

        {/* Foods Section */}
        {!showSkeleton && !error && (
          <>
            {foods.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
                <Gift className="w-12 h-12 text-teal-300 dark:text-teal-700 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active B1G1 Foods</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Check back soon for amazing Buy 1 Get 1 Free food items.</p>
                <Link to="/user">
                  <Button variant="outline">Explore Restaurants</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
                {foods.map((food) => (
                  <div key={food._id} className="group bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-teal-300/50 dark:hover:border-teal-700/50 transition-all duration-300 flex flex-col relative">
                    {/* B1G1 Badge */}
                    <div className="absolute top-3 right-3 z-10 bg-teal-500 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-md shadow-teal-500/30 transform rotate-3 group-hover:rotate-0 transition-transform">
                      B1G1 FREE
                    </div>

                    <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                       {food.image ? (
                         <OptimizedImage
                           src={food.image}
                           alt={food.name}
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                         />
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
                           <span className="text-gray-300 dark:text-gray-600 font-bold text-xl">No Image</span>
                         </div>
                       )}
                       
                       <div className="absolute bottom-3 left-3 flex gap-2">
                         {food.foodType === 'Veg' ? (
                           <div className="bg-white p-1 rounded shadow-sm border border-gray-200 flex items-center justify-center">
                             <div className="w-3 h-3 rounded-full bg-green-500 border border-green-700"></div>
                           </div>
                         ) : (
                           <div className="bg-white p-1 rounded shadow-sm border border-gray-200 flex items-center justify-center">
                             <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-red-600"></div>
                           </div>
                         )}
                       </div>
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight line-clamp-1">
                          {food.name}
                        </h3>
                        <div className="flex flex-col items-end">
                          <span className="font-black text-gray-900 dark:text-white">₹{food.price}</span>
                          <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 line-through opacity-70">₹{food.price * 2}</span>
                        </div>
                      </div>
                      
                      {food.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                          {food.description}
                        </p>
                      )}
                       
                      <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                         <div className="flex flex-col">
                           <span className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">
                             {food.restaurantId?.name || 'Restaurant'}
                           </span>
                           {food.restaurantId?.location?.address && (
                             <span className="text-[10px] text-gray-500 line-clamp-1">
                               {food.restaurantId.location.address}
                             </span>
                           )}
                         </div>
                         
                         <Link to={`/user/restaurants/${food.restaurantId?._id || ''}`}>
                           <Button size="sm" className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800 rounded-full h-8 px-4 text-xs font-bold transition-all shadow-sm">
                             Order
                           </Button>
                         </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  )
}
