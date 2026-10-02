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
import StickyCartCard from "@food/components/user/StickyCartCard"
import AddToCartButton from "@food/components/user/AddToCartButton"
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
        
        // Inject 4 dummy foods for preview if no real foods exist
        if (data.length === 0) {
          setFoods([
            {
              _id: "dummy1",
              name: "Cold Iced Coffee",
              image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800",
              foodType: "Veg",
              price: 250,
              rating: "4.6",
              restaurantId: { _id: "r1", name: "Starbucks Coffee", location: { address: "Race Course Road" } }
            },
            {
              _id: "dummy2",
              name: "Special Poha Mix", 
              image: "https://images.unsplash.com/photo-1626804475297-41609ea004eb?auto=format&fit=crop&q=80&w=800",
              foodType: "Veg",
              price: 120,
              rating: "4.5",
              restaurantId: { _id: "r2", name: "Vijay Chaat House", location: { address: "Rajwada" } }
            },
            {
              _id: "dummy3",
              name: "Kachori Sabzi",
              image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=800",
              foodType: "Veg",
              price: 90,
              rating: "4.3",
              restaurantId: { _id: "r3", name: "Ravi Alpahar", location: { address: "Jail Road" } }
            },
            {
              _id: "dummy4",
              name: "Masala Poha",
              image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800",
              foodType: "Veg",
              price: 150,
              rating: "4.1",
              restaurantId: { _id: "r4", name: "Keshar Shree", location: { address: "Tonk Road" } }
            }
          ])
        } else {
          setFoods(data)
        }
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
      <div className="relative w-full pt-16 pb-8 md:pt-20 md:pb-10 flex flex-col items-center justify-center bg-transparent">
        {/* Back Button */}
        <button 
          onClick={goBack}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-20 w-10 h-10 md:w-12 md:h-12 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
        </button>
        
        {/* Banner Content */}
        <div className="relative z-10 text-center px-4 pt-4">
          <div className="inline-flex items-center justify-center space-x-3 mb-3">
            <span className="h-0.5 w-12 rounded-full bg-gradient-to-r from-transparent to-amber-400"></span>
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 flex items-center justify-center shadow-inner border border-amber-200 dark:border-amber-800/50">
              <Gift className="w-6 h-6 md:w-7 md:h-7 text-amber-500 dark:text-amber-400" />
            </div>
            <span className="h-0.5 w-12 rounded-full bg-gradient-to-l from-transparent to-amber-400"></span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 bg-clip-text text-transparent pb-2 uppercase">
            Buy 1 Get 1
          </h1>
          
          <p className="text-[15px] md:text-[17px] text-gray-500 dark:text-gray-400 font-medium max-w-sm mx-auto mt-2 leading-relaxed">
            Double the joy! Explore amazing B1G1 free deals from top restaurants.
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
                {foods.map((food) => (
                  <Link to={`/user/restaurants/${food.restaurantId?._id || ''}`} key={food._id} className="group flex flex-col gap-3 cursor-pointer">
                    {/* Image Container */}
                    <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-sm">
                      <OptimizedImage
                        src={food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                        alt={food.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* B1G1 Badge Overlay */}
                      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3 sm:p-4">
                        <span className="text-white font-bold text-lg sm:text-xl md:text-2xl tracking-tighter uppercase drop-shadow-md">
                          B1G1 Free
                        </span>
                      </div>
                      
                      {/* Veg/Non-veg Indicator */}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1 rounded shadow-sm">
                         {food.foodType === 'Veg' ? (
                           <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500 border-2 border-green-700"></div>
                         ) : (
                           <div className="w-0 h-0 border-l-[6px] sm:border-l-[8px] border-l-transparent border-r-[6px] sm:border-r-[8px] border-r-transparent border-b-[10px] sm:border-b-[14px] border-b-red-600"></div>
                         )}
                      </div>
                    </div>
                    
                    {/* Details Container */}
                    <div className="flex flex-col gap-0.5 px-1">
                      <h3 className="font-medium text-[16px] md:text-[18px] text-gray-900 dark:text-white leading-tight truncate">
                        {food.name}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Star className="w-3 h-3 text-white fill-white" />
                        </div>
                        <span className="font-medium text-[14px] text-gray-800 dark:text-gray-200">
                          {food.rating || "4.5"} • ₹{food.price}
                        </span>
                      </div>
                      
                      <div className="flex items-end justify-between mt-1">
                        <div className="flex flex-col flex-1 min-w-0 pr-2">
                          <p className="text-[14px] md:text-[15px] text-gray-500 dark:text-gray-400 truncate">
                            {food.restaurantId?.restaurantName || food.restaurantId?.name || 'Restaurant'}
                          </p>
                          <p className="text-[13px] md:text-[14px] text-gray-400 dark:text-gray-500 truncate">
                            {food.restaurantId?.location?.address?.split(',')[0] || 'Unknown Location'}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0" onClick={e => { e.preventDefault(); e.stopPropagation(); }}>
                          <AddToCartButton 
                            item={{
                              ...food,
                              id: food._id,
                              price: food.variants?.length > 0 ? food.variants[0].price : food.price,
                              restaurant: food.restaurantId?.restaurantName || food.restaurantId?.name || "Restaurant",
                              restaurantId: food.restaurantId?._id || food.restaurantId,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </div>
      <StickyCartCard />
    </div>
  )
}
