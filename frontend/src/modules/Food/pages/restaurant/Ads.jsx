import { useEffect, useState, useRef, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Megaphone, Plus, Search, Calendar, Eye, MousePointerClick, 
  TrendingUp, Upload, X, AlertCircle, CheckCircle2, ChevronRight, ArrowLeft,
  Trash2
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@food/components/ui/dialog"
import { restaurantAPI } from "@food/api"
import { initRazorpayPayment } from "@food/utils/razorpay"
import { toast } from "sonner"

export default function Ads() {
  const navigate = useNavigate()
  
  // Dashboard & Form State
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [restaurantData, setRestaurantData] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [adTypeFilter, setAdTypeFilter] = useState("all")
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedAdForDelete, setSelectedAdForDelete] = useState(null)
  
  // Form Inputs
  const [form, setForm] = useState({
    title: "",
    description: "",
    durationDays: "1",
    showReview: true,
    showRatings: true,
  })
  
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  
  const [ratePerDay, setRatePerDay] = useState(() => {
    const rate = localStorage.getItem("ad_rate_per_day")
    return rate ? Number(rate) : 100
  })

  const coverInputRef = useRef(null)

  // Load profile and sync localStorage ads
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true)
        const response = await restaurantAPI.getCurrentRestaurant()
        const data = response?.data?.data?.restaurant || response?.data?.restaurant
        if (data) {
          setRestaurantData(data)
        }
      } catch (err) {
        console.warn("Failed to load restaurant profile, using fallback local settings.", err)
      } finally {
        setLoading(false)
      }
    }
    
    initData()
    
    // Sync localStorage ads
    const stored = localStorage.getItem("restaurant_ads")
    if (stored) {
      setAds(JSON.parse(stored))
    } else {
      // Default populated campaigns for showcase
      const defaultAds = [
        {
          sl: 1,
          adsId: "AD-1001",
          adsTitle: "Super Saver Sunday",
          restaurantName: "Café Monarch",
          restaurantEmail: "owner@cafemonarch.com",
          adsType: "Restaurant Promotion",
          duration: "Valid till 2026-07-01",
          validity: "2026-07-01",
          status: "approved",
          priority: "1",
          clicks: 120,
          impressions: 2400,
          ctr: "5.0%",
          description: "Get 50% off on all main courses.",
          coverImage: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=400&fit=crop",
          zoneId: "6a265702ca46c4c4b769a82b"
        },
        {
          sl: 2,
          adsId: "AD-1002",
          adsTitle: "Monsoon Special Beverages",
          restaurantName: "Hungry Puppets",
          restaurantEmail: "owner@hungrypuppets.com",
          adsType: "Restaurant Promotion",
          duration: "Valid till 2026-08-15",
          validity: "2026-08-15",
          status: "approved",
          priority: "2",
          clicks: 85,
          impressions: 1900,
          ctr: "4.5%",
          description: "Buy 1 Get 1 Free on all hot beverages.",
          coverImage: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&h=400&fit=crop",
          zoneId: "6a26572bca46c4c4b769a837"
        },
        {
          sl: 3,
          adsId: "AD-1003",
          adsTitle: "Weekend Biryani Feast",
          restaurantName: "Café Monarch",
          restaurantEmail: "owner@cafemonarch.com",
          adsType: "Restaurant Promotion",
          duration: "Valid till 2026-06-30",
          validity: "2026-06-30",
          status: "new",
          priority: "N/A",
          clicks: 0,
          impressions: 0,
          ctr: "0.0%",
          description: "Flat 20% off on Family Biryani packs.",
          coverImage: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&h=400&fit=crop",
          zoneId: "6a265702ca46c4c4b769a82b"
        }
      ]
      localStorage.setItem("restaurant_ads", JSON.stringify(defaultAds))
      setAds(defaultAds)
    }
  }, [])

  // Filtered ads list
  const filteredAds = useMemo(() => {
    // If restaurant logs in, only show ads belonging to their restaurant
    const restName = restaurantData?.restaurantName || restaurantData?.name || "Café Monarch"
    let result = ads.filter(ad => ad.restaurantName?.toLowerCase() === restName.toLowerCase())
    
    // In case no matches, show all mock ads so the panel doesn't look empty for any other restaurant account
    if (result.length === 0) {
      result = ads
    }

    if (adTypeFilter !== "all") {
      result = result.filter(ad => ad.adsType === adTypeFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(ad =>
        ad.adsId?.toLowerCase().includes(query) ||
        ad.adsTitle?.toLowerCase().includes(query)
      )
    }

    // Sort: newest first
    result.sort((a, b) => (b.sl || 0) - (a.sl || 0))

    return result
  }, [ads, restaurantData, adTypeFilter, searchQuery])

  // Stats calculation
  const stats = useMemo(() => {
    const approved = filteredAds.filter(ad => ad.status === "approved")
    const totalImpressions = approved.reduce((sum, ad) => sum + (ad.impressions || 0), 0)
    const totalClicks = approved.reduce((sum, ad) => sum + (ad.clicks || 0), 0)
    const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) + "%" : "0.0%"
    
    return {
      total: filteredAds.length,
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: avgCtr
    }
  }, [filteredAds])

  // Form Validation & Submit
  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  const handleFileUpload = (type, file) => {
    const maxSize = 2 * 1024 * 1024 // 2MB
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"]

    if (!allowed.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, cover: "PNG, JPG, JPEG, or WEBP only." }))
      return
    }

    if (file.size > maxSize) {
      setFormErrors(prev => ({ ...prev, cover: "Max size limit is 2MB." }))
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverImage(file)
      setCoverPreview(reader.result)
    }
    reader.readAsDataURL(file)
    
    setFormErrors(prev => {
      const copy = { ...prev }
      delete copy.cover
      return copy
    })
  }

  const handleRemoveImage = () => {
    setCoverImage(null)
    setCoverPreview(null)
    if (coverInputRef.current) coverInputRef.current.value = ""
  }

  const handleRequestSubmit = (e) => {
    e.preventDefault()
    const errors = {}

    if (!form.title.trim()) errors.title = "Campaign title is required."
    if (!coverPreview) errors.cover = "Campaign banner image is required."

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsPaymentModalOpen(true)
  }

  const handlePaymentConfirm = async () => {
    setPaymentProcessing(true)
    setSubmitting(true)
    try {
      const days = Number(form.durationDays) || 1
      const totalAmount = days * ratePerDay

      // Get user info if available to prefill
      let userInfo = {}
      try {
        const storedUser = localStorage.getItem("user_info")
        if (storedUser) {
          userInfo = JSON.parse(storedUser)
        }
      } catch (e) { }

      const userName = userInfo.name || restaurantData?.name || "Restaurant Partner"
      const userEmail = userInfo.email || restaurantData?.email || "partner@tastizo.com"
      const userPhone = (userInfo.phone || "9999999999").replace(/\D/g, "").slice(-10)

      await initRazorpayPayment({
        key: "rzp_test_SiDMCPfJWp5SWc",
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "Tastizo Ads & Promotions",
        description: `Payment for Campaign: ${form.title}`,
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone
        },
        notes: {
          type: "ads_promotion_payment",
          campaignTitle: form.title,
          durationDays: days.toString()
        },
        handler: async (response) => {
          try {
            const stored = localStorage.getItem("restaurant_ads")
            const currentAds = stored ? JSON.parse(stored) : []
            
            const validityDate = new Date()
            validityDate.setDate(validityDate.getDate() + days)
            const validityStr = validityDate.toISOString().split("T")[0]

            const newAd = {
              sl: currentAds.length + 1,
              adsId: `AD-${1000 + currentAds.length + 1}`,
              adsTitle: form.title,
              restaurantId: restaurantData?._id || restaurantData?.id || null,
              restaurantName: restaurantData?.restaurantName || restaurantData?.name || "Café Monarch",
              restaurantEmail: restaurantData?.ownerEmail || restaurantData?.email || "owner@cafemonarch.com",
              adsType: "Restaurant Promotion",
              duration: `Valid for ${days} ${days === 1 ? "day" : "days"} (till ${validityStr})`,
              validity: validityStr,
              status: "new", // Sent for review
              priority: "Normal",
              clicks: 0,
              impressions: 0,
              ctr: "0.0%",
              description: form.description,
              coverImage: coverPreview,
              amountPaid: totalAmount,
              isPaid: true,
              razorpayPaymentId: response.razorpay_payment_id,
              zoneId: (restaurantData?.zoneId?._id || restaurantData?.zoneId?.id || restaurantData?.zoneId) || null
            }

            const updatedAds = [...currentAds, newAd]
            localStorage.setItem("restaurant_ads", JSON.stringify(updatedAds))
            setAds(updatedAds)
            
            setIsPaymentModalOpen(false)
            setIsRequestModalOpen(false)
            setIsSuccessOpen(true)
            
            // Reset Form
            setForm({
              title: "",
              description: "",
              durationDays: "1",
              showReview: true,
              showRatings: true,
            })
            setCoverImage(null)
            setCoverPreview(null)
            setFormErrors({})
            
            toast.success("Payment completed successfully!")
          } catch (err) {
            console.error(err)
            toast.error("Failed to complete campaign registration")
          } finally {
            setPaymentProcessing(false)
            setSubmitting(false)
          }
        },
        onError: (error) => {
          setFormErrors({ submit: error?.description || "Payment failed. Please try again." })
          toast.error(error?.description || "Payment failed or cancelled")
          setPaymentProcessing(false)
          setSubmitting(false)
        },
        onClose: () => {
          setPaymentProcessing(false)
          setSubmitting(false)
        }
      })
      
    } catch (err) {
      console.error(err)
      setFormErrors({ submit: "Failed to initialize payment. Please try again." })
      toast.error("Failed to initialize payment. Please try again.")
      setPaymentProcessing(false)
      setSubmitting(false)
    }
  }

  const handleDeleteClick = (ad) => {
    setSelectedAdForDelete(ad)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedAdForDelete) {
      const updatedAds = ads.filter(ad => ad.sl !== selectedAdForDelete.sl)
      setAds(updatedAds)
      localStorage.setItem("restaurant_ads", JSON.stringify(updatedAds))
      setIsDeleteOpen(false)
      setSelectedAdForDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-5 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/restaurant/explore")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
            >
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>
            <div className="p-2 bg-[#2A9C64]/10 rounded-xl">
              <Megaphone className="w-6 h-6 text-[#2A9C64]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Ads & Promotions</h1>
              <p className="text-xs text-slate-500 mt-1">Request, monitor, and configure active target marketing campaigns</p>
            </div>
          </div>
          
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#2A9C64] hover:bg-[#238b57] text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-[#2A9C64]/20"
          >
            <Plus className="w-4 h-4" />
            New Campaign Request
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Campaigns", value: stats.total, icon: Megaphone, color: "bg-blue-50 text-blue-600 border-blue-100" },
            { label: "Total Impressions", value: stats.impressions.toLocaleString(), icon: Eye, color: "bg-purple-50 text-purple-600 border-purple-100" },
            { label: "Total Clicks", value: stats.clicks.toLocaleString(), icon: MousePointerClick, color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
            { label: "Avg. Click Through Rate", value: stats.ctr, icon: TrendingUp, color: "bg-amber-50 text-amber-600 border-amber-100" },
          ].map((card, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{card.label}</p>
                <h3 className="text-2xl font-black text-slate-800 mt-2">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color}`}>
                <card.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
            </div>
          ))}
        </div>

        {/* Filters and List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-base font-bold text-slate-800">Your Advertisements</h2>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={adTypeFilter}
                onChange={(e) => setAdTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2A9C64]/20 focus:border-[#2A9C64]"
              >
                <option value="all">All Campaign Types</option>
                <option value="Restaurant Promotion">Restaurant Promotion</option>
                <option value="Video promotion">Video promotion</option>
              </select>

              <div className="relative flex-1 md:flex-initial md:min-w-[240px]">
                <input
                  type="text"
                  placeholder="Search by ID or Title"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#2A9C64]/20 focus:border-[#2A9C64]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ads ID</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Title</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ad Type</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Validity</th>
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Impressions</th>
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Clicks</th>
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">CTR</th>
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAds.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center text-slate-500">
                      <Megaphone className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p className="font-semibold text-slate-700">No Advertisements Found</p>
                      <p className="text-xs text-slate-400 mt-1">Submit a new request to start advertising.</p>
                    </td>
                  </tr>
                ) : (
                  filteredAds.map((ad) => (
                    <tr key={ad.sl} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm font-bold text-[#2A9C64]">{ad.adsId}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800">{ad.adsTitle}</span>
                          {ad.description && <span className="text-xs text-slate-400 mt-0.5 max-w-[220px] truncate">{ad.description}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-slate-600">{ad.adsType}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          ad.status === "approved" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : ad.status === "denied"
                            ? "bg-red-50 text-red-700 border border-red-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {ad.status === "approved" ? "Approved" : ad.status === "denied" ? "Denied" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-slate-600">{ad.duration}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center text-sm text-slate-700 font-medium">{ad.impressions?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center text-sm text-slate-700 font-medium">{ad.clicks?.toLocaleString() || 0}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center text-sm text-slate-800 font-bold">{ad.ctr || "0.0%"}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(ad)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="max-w-4xl bg-white p-0 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-bold text-slate-900">Request New Promotion Campaign</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit details to Tastizo administration for promotional banner approval.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Form Inputs (3 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Campaign Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g. Weekend Biryani Bonanza"
                    className={`w-full px-4 py-2.5 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2A9C64]/20 focus:border-[#2A9C64] text-sm ${
                      formErrors.title ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Short Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Provide a promotional description..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2A9C64]/20 focus:border-[#2A9C64] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Campaign Duration *</label>
                  <select
                    value={form.durationDays}
                    onChange={(e) => handleInputChange("durationDays", e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2A9C64]/20 focus:border-[#2A9C64] text-sm font-semibold text-slate-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(days => (
                      <option key={days} value={days}>{days} {days === 1 ? "Day" : "Days"}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase">Rate per Day:</span>
                    <span className="text-sm font-black text-slate-800">₹{ratePerDay}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-slate-200">
                    <span className="text-sm font-bold text-slate-700">Total Amount:</span>
                    <span className="text-lg font-black text-[#2A9C64]">₹{(Number(form.durationDays) || 1) * ratePerDay}</span>
                  </div>
                </div>
              </div>

              {/* Upload & Preview (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Campaign Banner (2:1 Ratio) *</label>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload("cover", e.target.files[0])}
                  />
                  {coverPreview ? (
                    <div className="relative border border-slate-200 rounded-lg overflow-hidden h-44 bg-slate-50">
                      <img src={coverPreview} alt="Cover" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => coverInputRef.current?.click()}
                      className={`border border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors bg-slate-50/50 flex flex-col justify-center items-center h-44 ${
                        formErrors.cover ? "border-red-500 hover:border-red-600" : "border-slate-300 hover:border-[#2A9C64]"
                      }`}
                    >
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-xs font-bold text-[#2A9C64]">Upload Campaign Banner</span>
                      <span className="text-[10px] text-slate-400 mt-1">PNG, JPG or WEBP (Max 2MB)</span>
                    </div>
                  )}
                  {formErrors.cover && <p className="text-xs text-red-500 mt-1">{formErrors.cover}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 text-sm font-bold rounded-lg bg-[#2A9C64] hover:bg-[#238b57] text-white disabled:opacity-50 transition-all shadow-md shadow-[#2A9C64]/10"
              >
                {submitting ? "Processing..." : "Pay & Submit"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Checkout / Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl text-center">
          <DialogHeader className="pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-bold text-slate-900">Tastizo Secure Checkout</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Complete payment to launch your marketing campaign
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4 text-left">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Campaign Title:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">{form.title}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Duration:</span>
              <span className="font-semibold text-slate-800">{form.durationDays} {Number(form.durationDays) === 1 ? "Day" : "Days"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Gateway:</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                💳 Card / UPI Simulation
              </span>
            </div>
            
            <div className="bg-[#2A9C64]/5 p-4 rounded-xl border border-[#2A9C64]/10 flex justify-between items-center mt-2">
              <span className="text-sm font-bold text-slate-700">Amount to Pay:</span>
              <span className="text-xl font-black text-[#2A9C64]">₹{(Number(form.durationDays) || 1) * ratePerDay}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={paymentProcessing}
              onClick={() => setIsPaymentModalOpen(false)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={paymentProcessing}
              onClick={handlePaymentConfirm}
              className="flex-1 py-2.5 rounded-lg bg-[#2A9C64] hover:bg-[#238b57] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {paymentProcessing ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : (
                `Confirm & Pay`
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="max-w-md bg-white p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald-50 rounded-full p-3 border border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 mb-1">Campaign Submitted Successfully</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Your campaign request has been submitted to Tastizo administrators for review. You will receive notifications once updated.
          </DialogDescription>
          <button
            onClick={() => setIsSuccessOpen(false)}
            className="mt-5 w-full py-2.5 bg-[#2A9C64] hover:bg-[#238b57] text-white rounded-lg font-bold text-sm transition-all"
          >
            Acknowledge
          </button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-white p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-50 rounded-full p-3 border border-red-100 animate-pulse">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 mb-1">Delete Campaign?</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Are you sure you want to delete the campaign "{selectedAdForDelete?.adsTitle}"? This action cannot be undone.
          </DialogDescription>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/10"
            >
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
