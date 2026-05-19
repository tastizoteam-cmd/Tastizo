import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useRestaurantBackNavigation from "@food/hooks/useRestaurantBackNavigation"
import Lenis from "lenis"
import { ArrowLeft, ChevronDown } from "lucide-react"
import BottomPopup from "@delivery/components/BottomPopup"
import { restaurantAPI } from "@food/api"
const debugLog = (...args) => {}
const debugWarn = (...args) => {}
const debugError = (...args) => {}

const ADDRESS_STORAGE_KEY = "restaurant_address"

// Default coordinates for Indore
const DEFAULT_LAT = 22.7196
const DEFAULT_LNG = 75.8577

export default function EditRestaurantAddress() {
  const navigate = useNavigate()
  const goBack = useRestaurantBackNavigation()
  const [address, setAddress] = useState("")
  const [restaurantName, setRestaurantName] = useState("")
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSelectOptionDialog, setShowSelectOptionDialog] = useState(false)
  const [selectedOption, setSelectedOption] = useState("minor_correction") // "update_address" or "minor_correction"
  const [lat, setLat] = useState(DEFAULT_LAT)
  const [lng, setLng] = useState(DEFAULT_LNG)

  // Form states for detailed address editing
  const [addressLine1, setAddressLine1] = useState("")
  const [addressLine2, setAddressLine2] = useState("")
  const [area, setArea] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [pincode, setPincode] = useState("")
  const [landmark, setLandmark] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Format address from location object
  const formatAddress = (loc) => {
    if (!loc) return ""
    const parts = []
    if (loc.addressLine1) parts.push(loc.addressLine1.trim())
    if (loc.addressLine2) parts.push(loc.addressLine2.trim())
    if (loc.area) parts.push(loc.area.trim())
    if (loc.city) {
      const city = loc.city.trim()
      if (!loc.area || !loc.area.includes(city)) {
        parts.push(city)
      }
    }
    if (loc.landmark) parts.push(loc.landmark.trim())
    return parts.join(", ") || ""
  }

  // Fetch restaurant data from backend
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true)
        const response = await restaurantAPI.getCurrentRestaurant()
        const data = response?.data?.data?.restaurant || response?.data?.restaurant
        if (data) {
          setRestaurantName(data.name || "")
          if (data.location) {
            setLocation(data.location)
            const formatted = formatAddress(data.location)
            setAddress(formatted)
            setAddressLine1(data.location.addressLine1 || "")
            setAddressLine2(data.location.addressLine2 || "")
            setArea(data.location.area || "")
            setCity(data.location.city || "")
            setState(data.location.state || "")
            setPincode(data.location.pincode || "")
            setLandmark(data.location.landmark || "")
            // Set coordinates if available
            if (data.location.latitude && data.location.longitude) {
              setLat(data.location.latitude)
              setLng(data.location.longitude)
            }
          } else {
            // Fallback to localStorage
            try {
              const savedAddress = localStorage.getItem(ADDRESS_STORAGE_KEY)
              if (savedAddress) {
                setAddress(savedAddress)
              }
            } catch (error) {
              debugError("Error loading address from storage:", error)
            }
          }
        }
      } catch (error) {
        // Only log error if it's not a network/timeout error (backend might be down/slow)
        if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNABORTED' && !error.message?.includes('timeout')) {
          debugError("Error fetching restaurant data:", error)
        }
        // Fallback to localStorage
        try {
          const savedAddress = localStorage.getItem(ADDRESS_STORAGE_KEY)
          if (savedAddress) {
            setAddress(savedAddress)
          }
          const savedName = localStorage.getItem("restaurant_name") || 
                           localStorage.getItem("restaurantName") ||
                           ""
          setRestaurantName(savedName)
        } catch (e) {
          debugError("Error loading from localStorage:", e)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurantData()

    // Listen for address updates
    const handleAddressUpdate = () => {
      fetchRestaurantData()
    }

    window.addEventListener("addressUpdated", handleAddressUpdate)
    return () => window.removeEventListener("addressUpdated", handleAddressUpdate)
  }, [])

  // Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Handle Update button click
  const handleUpdateClick = () => {
    setShowSelectOptionDialog(true)
  }

  // Handle Proceed to update
  const handleProceedUpdate = () => {
    setShowSelectOptionDialog(false)
    setIsEditing(true)
  }

  const handleSaveAddress = async () => {
    try {
      const formattedParts = [addressLine1, addressLine2, area, city, landmark].filter(Boolean)
      const formattedAddress = formattedParts.join(", ")

      const updatedLocation = {
        ...location,
        addressLine1,
        addressLine2,
        area,
        city,
        state,
        pincode,
        landmark,
        latitude: lat,
        longitude: lng,
        coordinates: [lng, lat],
        formattedAddress
      }

      const response = await restaurantAPI.updateProfile({ location: updatedLocation })

      if (response?.data?.data?.restaurant) {
        setLocation(updatedLocation)
        setAddress(formattedAddress)
        window.dispatchEvent(new Event("addressUpdated"))
        setIsEditing(false)
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (error) {
      debugError("Error updating address:", error)
      alert(`Failed to update address: ${error.response?.data?.message || error.message || "Please try again."}`)
    }
  }

  // Get simplified address for navbar
  const getSimplifiedAddress = (fullAddress) => {
    const parts = fullAddress.split(",").map(p => p.trim())
    if (parts.length >= 2) {
      return parts.slice(-2).join(", ")
    }
    return fullAddress
  }
  
  const simplifiedAddress = getSimplifiedAddress(address)

  // Interactive Form Rendering
  if (isEditing) {
    return (
      <div className="h-screen bg-white overflow-hidden flex flex-col">
        {/* Sticky Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsEditing(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            aria-label="Cancel editing"
          >
            <ArrowLeft className="w-6 h-6 text-[#2A9C64]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">Edit Outlet Address</h1>
            <p className="text-xs text-gray-600 truncate">{restaurantName}</p>
          </div>
        </div>

        {/* Scrollable Form Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-xl p-4 text-sm leading-relaxed">
            Please provide accurate address details and coordinates. The coordinates (latitude and longitude) must fall within one of the active service zones.
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Address Line 1</label>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g. Shop No 4, Ground Floor"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#2A9C64] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Address Line 2</label>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="e.g. Near Vijay Nagar Square"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#2A9C64] focus:bg-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Area / Locality</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Vijay Nagar"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#2A9C64] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Indore"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#2A9C64] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Madhya Pradesh"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#2A9C64] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 452010"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#2A9C64] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Landmark</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Megapolis Mall"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-[#2A9C64] focus:bg-white transition-colors"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
              <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Map Coordinates</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    placeholder="e.g. 22.7196"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-[#2A9C64] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    placeholder="e.g. 75.8577"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-[#2A9C64] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-gray-200 p-4 shrink-0 flex gap-3">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 text-base rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAddress}
            className="flex-1 bg-[#2A9C64] hover:bg-[#238253] text-white font-bold py-4 text-base rounded-xl shadow-lg shadow-[#2A9C64]/20 transition-all active:scale-[0.98]"
          >
            Save Changes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50 flex items-center gap-3 shrink-0">
        <button
          onClick={goBack}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6 text-[#2A9C64]" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h1 className="text-base font-bold text-gray-900 truncate">{restaurantName}</h1>
            <ChevronDown className="w-4 h-4 text-gray-900 shrink-0" />
          </div>
          <p className="text-xs text-gray-600 truncate">{simplifiedAddress}</p>
        </div>
      </div>

      {/* Map Section - Takes remaining space */}
      <div className="relative flex-1 min-h-0 overflow-hidden">
        {/* Google Maps Embed */}
        <iframe
          src={`https://www.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0"
        />
        
        {/* Custom Marker Tooltip Overlay */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="bg-black text-white px-3 py-2 rounded-lg mb-2 whitespace-nowrap shadow-lg">
            <p className="text-xs font-semibold">Your outlet location</p>
            <p className="text-[10px] text-gray-300">Orders will be picked up from here</p>
          </div>
          <div className="w-6 h-6 bg-[#2A9C64] rounded-full border-2 border-white shadow-lg mx-auto"></div>
        </div>

        {/* Address Details Section - Overlays map at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl z-20 px-4 pt-6">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-3">Outlet address</h2>
          
          <div className="bg-blue-100 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm text-gray-900">
              Customers and delivery partners will use this to locate your outlet.
            </p>
          </div>

          <div className="mb-4">
            <p className="text-base text-gray-900">{address}</p>
          </div>

          <div className="pb-4">
            <button
              onClick={handleUpdateClick}
              className="w-full bg-[#2A9C64] text-white font-bold py-4 text-base rounded-xl shadow-lg shadow-[#2A9C64]/20 transition-all active:scale-[0.98]"
            >
              Update Address
            </button>
          </div>
        </div>
      </div>

      {/* Select Option Bottom Popup */}
      <BottomPopup
        isOpen={showSelectOptionDialog}
        onClose={() => setShowSelectOptionDialog(false)}
        title="Select an option"
        maxHeight="auto"
      >
        <div className=" space-y-0">
          <button
            onClick={() => setSelectedOption("update_address")}
            className="w-full flex items-start justify-between py-4 border-b border-dashed border-gray-300"
          >
            <div className="flex-1 text-left">
              <p className="text-base font-semibold text-gray-900 mb-1">
                Update outlet address
              </p>
              <p className="text-sm text-gray-500">{address}</p>
            </div>
            <div className="ml-4 shrink-0">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === "update_address"
                    ? "border-[#2A9C64] bg-[#2A9C64]"
                    : "border-gray-300"
                }`}
              >
                {selectedOption === "update_address" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedOption("minor_correction")}
            className="w-full flex items-start justify-between py-4"
          >
            <div className="flex-1 text-left">
              <p className="text-base font-semibold text-gray-900 mb-1">
                Make a minor correction to the location pin
              </p>
              <p className="text-sm text-gray-500">
                If location pin on the map is slightly misplaced
              </p>
            </div>
            <div className="ml-4 shrink-0">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedOption === "minor_correction"
                    ? "border-[#2A9C64] bg-[#2A9C64]"
                    : "border-gray-300"
                }`}
              >
                {selectedOption === "minor_correction" && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
            </div>
          </button>

          <button
            onClick={handleProceedUpdate}
            className="w-full bg-[#2A9C64] text-white font-bold py-4 rounded-xl mt-6 shadow-lg shadow-[#2A9C64]/20 transition-all active:scale-[0.98]"
          >
            Proceed to update
          </button>
        </div>
      </BottomPopup>
    </div>
  )
}
