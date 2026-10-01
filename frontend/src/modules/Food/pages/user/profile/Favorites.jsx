import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"

import { Heart, Star, Clock, MapPin, ArrowLeft, Bookmark } from "lucide-react"
import AnimatedPage from "@food/components/user/AnimatedPage"
import ScrollReveal from "@food/components/user/ScrollReveal"
import { Button } from "@food/components/ui/button"
import { useProfile } from "@food/context/ProfileContext"
import { toast } from "sonner"

export default function Favorites() {
  const { getFavorites, removeFavorite, getDishFavorites, removeDishFavorite } = useProfile()
  const restaurantFavorites = Array.isArray(getFavorites()) ? getFavorites().filter(Boolean) : []
  const dishFavorites = Array.isArray(getDishFavorites()) ? getDishFavorites().filter(Boolean) : []
  const [activeTab, setActiveTab] = useState("restaurants")
  const navigate = useNavigate()

  const handleRemoveFavorite = (e, slug) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm("Remove this restaurant from favorites?")) {
      removeFavorite(slug)
      toast.success("Restaurant removed from favorites")
    }
  }

  const handleRemoveDishFavorite = (e, dishId, restaurantId) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm("Remove this dish from favorites?")) {
      removeDishFavorite(dishId, restaurantId)
      toast.success("Dish removed from favorites")
    }
  }

  const totalFavorites = restaurantFavorites.length + dishFavorites.length

  if (totalFavorites === 0) {
    return (
      <AnimatedPage className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        {/* Minimal Header Section */}
        <div className="relative w-full pt-16 pb-10 flex flex-col items-center justify-center bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 shadow-sm">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 md:top-6 md:left-6 z-20 w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-gray-50 dark:bg-[#1a1a1a] dark:hover:bg-gray-900 rounded-full flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-800"
          >
            <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Header Content */}
          <div className="relative z-10 text-center px-4 space-y-3">
            <div className="mx-auto bg-gray-50 dark:bg-gray-900 w-12 h-12 rounded-full flex items-center justify-center border border-gray-100 dark:border-gray-800 mb-2">
               <Heart className="w-5 h-5 text-gray-800 dark:text-gray-200" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-widest uppercase">
              Favorites
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium tracking-[0.2em] uppercase">
              Your Saved Items
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-8 md:py-10 space-y-6">
          <div className="max-w-7xl mx-auto">
            <div className="col-span-full text-center py-20 bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800">
              <Heart className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">No Favorites Yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">Start exploring restaurants and dishes to build your list.</p>
              <Link to="/user">
                <Button variant="outline">Explore Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Minimal Header Section */}
      <div className="relative w-full pt-16 pb-10 flex flex-col items-center justify-center bg-white dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-6 z-20 w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-gray-50 dark:bg-[#1a1a1a] dark:hover:bg-gray-900 rounded-full flex items-center justify-center transition-colors border border-gray-200 dark:border-gray-800"
        >
          <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Header Content */}
        <div className="relative z-10 text-center px-4 space-y-3">
          <div className="mx-auto bg-gray-50 dark:bg-gray-900 w-12 h-12 rounded-full flex items-center justify-center border border-gray-100 dark:border-gray-800 mb-2">
             <Heart className="w-5 h-5 text-gray-800 dark:text-gray-200 fill-current" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-widest uppercase">
            Favorites
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium tracking-[0.2em] uppercase">
            Your Saved Items
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-8 md:py-10 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("restaurants")}
                className={`pb-4 font-semibold transition-colors relative text-sm sm:text-base ${
                  activeTab === "restaurants"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Restaurants ({restaurantFavorites.length})
                {activeTab === "restaurants" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 dark:bg-white"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("dishes")}
                className={`pb-4 font-semibold transition-colors relative text-sm sm:text-base ${
                  activeTab === "dishes"
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Dishes ({dishFavorites.length})
                {activeTab === "dishes" && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 dark:bg-white"></span>
                )}
              </button>
            </div>
          </div>

          {/* Restaurants Tab */}
          {activeTab === "restaurants" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {restaurantFavorites.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800">
                  <Heart className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white">No Restaurants Saved</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">Start exploring restaurants to build your list.</p>
                  <Link to="/user">
                    <Button variant="outline">Explore Now</Button>
                  </Link>
                </div>
              ) : (
                restaurantFavorites.map((restaurant, index) => (
                  <ScrollReveal key={restaurant.slug} delay={index * 0.1}>
                    <Link to={`/user/restaurants/${restaurant.slug}`}>
                      <div className="group bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
                        <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                            onError={(e) => {
                              e.target.src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80`
                            }}
                          />
                          <button
                            className="absolute top-3 right-3 h-8 w-8 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                            onClick={(e) => handleRemoveFavorite(e, restaurant.slug)}
                          >
                            <Heart className="h-4 w-4 fill-gray-900 text-gray-900 dark:fill-white dark:text-white" strokeWidth={2} />
                          </button>
                        </div>
                        
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 flex-1">
                              {restaurant.name}
                            </h3>
                            <div className="flex-shrink-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded flex items-center gap-1">
                              <span className="text-xs font-bold">{restaurant.rating}</span>
                              <Star className="h-3 w-3 fill-current" />
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">{restaurant.cuisine}</p>

                          <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400 mt-auto tracking-wide uppercase">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{restaurant.deliveryTime}</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{restaurant.distance}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))
              )}
            </div>
          )}

          {/* Dishes Tab */}
          {activeTab === "dishes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dishFavorites.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800">
                  <Bookmark className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white">No Dishes Saved</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">Start exploring menus to build your list.</p>
                  <Link to="/user">
                    <Button variant="outline">Explore Now</Button>
                  </Link>
                </div>
              ) : (
                dishFavorites.map((dish, index) => {
                  const restaurantSlug = dish.restaurantSlug || ""
                  return (
                    <ScrollReveal key={`${dish.id}-${dish.restaurantId}`} delay={index * 0.1}>
                      <Link to={`/food/user/restaurants/${restaurantSlug}?dish=${dish.id}`}>
                        <div className="group bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full">
                          <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                            <img
                              src={dish.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80"}
                              alt={dish.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop&q=80"
                              }}
                            />
                            <button
                              className="absolute top-3 right-3 h-8 w-8 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                              onClick={(e) => handleRemoveDishFavorite(e, dish.id, dish.restaurantId)}
                            >
                              <Bookmark className="h-4 w-4 fill-gray-900 text-gray-900 dark:fill-white dark:text-white" strokeWidth={2} />
                            </button>
                          </div>
                          
                          <div className="p-5 flex flex-col flex-1">
                            <div className="mb-3">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                                {dish.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium line-clamp-1">
                                {dish.restaurantName || "Restaurant"}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                              <div className="flex items-center gap-1.5">
                                {dish.foodType === "Veg" ? (
                                  <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center rounded-sm">
                                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center rounded-sm">
                                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                  </div>
                                )}
                                <span className="text-gray-500 dark:text-gray-400 font-bold text-[10px] tracking-widest uppercase">{dish.foodType || "N/A"}</span>
                              </div>
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                {"\u20B9"}{Math.round(dish.price || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  )
}
