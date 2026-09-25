import { useState, useEffect, useCallback } from "react"
import { Search, Edit2, Plus, Trash2, PauseCircle, PlayCircle } from "lucide-react"
import { adminAPI } from "@food/api"

const formatYMD = (dateString) => {
  if (!dateString) return ""
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return ""
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

export default function BogoOffers() {
  const [offers, setOffers] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingOfferId, setEditingOfferId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState("")
  const [availableFoods, setAvailableFoods] = useState([])
  const [foodsLoading, setFoodsLoading] = useState(false)

  useEffect(() => {
    if (formData.restaurantScope === 'selected' && formData.restaurantIds) {
      setFoodsLoading(true)
      const rIds = formData.restaurantIds.split(',').map(s => s.trim()).filter(Boolean)
      adminAPI.getFoods({ restaurant: rIds[0], limit: 1000 })
        .then(res => {
          setAvailableFoods(res?.data?.docs || res?.data?.data?.foods || res?.data?.data || [])
        })
        .catch(err => console.error("Failed to load foods", err))
        .finally(() => setFoodsLoading(false))
    } else {
      setAvailableFoods([])
    }
  }, [formData.restaurantScope, formData.restaurantIds])


  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
    restaurantScope: "all",
    restaurantIds: "", // Comma separated for now
    buyQuantity: "1",
    freeQuantity: "1",
    maxFreeItemsPerOrder: "1",
    maxRedemptions: "",
    maxRedemptionsPerUser: "1",
    maxDiscountAmount: "",
    eligibleItemsScope: "all",
    minOrderValue: "0",
    campaignBudget: "",
    reimbursementType: "full_price",
    fixedReimbursementAmount: "",
    startDate: "",
    endDate: "",
    eligibleItems: "",
    freeItems: "",
  })

  const fetchOffers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await adminAPI.getBogoOffers({ limit: 100 })
      setOffers(res?.data?.docs || [])
      
      const restRes = await adminAPI.getRestaurants({ limit: 1000 })
      setRestaurants(restRes?.data?.data?.restaurants || restRes?.data?.docs || [])
    } catch (err) {
      setError(err?.message || "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOffers()
  }, [fetchOffers])

  const resetForm = () => {
    setEditingOfferId(null)
    setFormData({
      name: "",
      description: "",
      status: "active",
      restaurantScope: "all",
      restaurantIds: "",
      buyQuantity: "1",
      freeQuantity: "1",
      maxFreeItemsPerOrder: "1",
      maxRedemptions: "",
      maxRedemptionsPerUser: "1",
      maxDiscountAmount: "",
      eligibleItemsScope: "all",
      minOrderValue: "0",
      campaignBudget: "",
      reimbursementType: "full_price",
      fixedReimbursementAmount: "",
      startDate: "",
      endDate: "",
      eligibleItems: "",
      freeItems: "",
    })
  }

  const handleEditClick = (offer) => {
    setEditingOfferId(offer._id)
    setFormData({
      name: offer.name || "",
      description: offer.description || "",
      status: offer.status || "active",
      restaurantScope: offer.restaurantScope || "all",
      restaurantIds: offer.restaurantIds?.join(", ") || "",
      buyQuantity: offer.buyQuantity || 1,
      freeQuantity: offer.freeQuantity || 1,
      maxFreeItemsPerOrder: offer.maxFreeItemsPerOrder || 1,
      maxRedemptions: offer.maxRedemptions || "",
      maxRedemptionsPerUser: offer.maxRedemptionsPerUser || 1,
      maxDiscountAmount: offer.maxDiscountAmount || "",
      eligibleItemsScope: (offer.eligibleItems && offer.eligibleItems.length > 0) ? "selected" : "all",
      minOrderValue: offer.minOrderValue || 0,
      campaignBudget: offer.campaignBudget || "",
      reimbursementType: offer.reimbursementType || "full_price",
      fixedReimbursementAmount: offer.fixedReimbursementAmount || "",
      startDate: formatYMD(offer.startDate),
      endDate: formatYMD(offer.endDate),
      eligibleItems: offer.eligibleItems?.join(", ") || "",
      freeItems: offer.freeItems?.join(", ") || "",
    })
    setIsAddOpen(true)
    setSubmitError("")
    setSubmitSuccess("")
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this BOGO offer?")) return
    try {
      await adminAPI.deleteBogoOffer(id)
      fetchOffers()
    } catch (err) {
      alert("Failed to delete")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError("")
    setSubmitSuccess("")
    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        restaurantScope: formData.restaurantScope,
        buyQuantity: Number(formData.buyQuantity),
        freeQuantity: Number(formData.freeQuantity),
        maxFreeItemsPerOrder: Number(formData.maxFreeItemsPerOrder),
        minOrderValue: Number(formData.minOrderValue),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        campaignBudget: Number(formData.campaignBudget),
        reimbursementType: formData.reimbursementType,
      }
      if (formData.restaurantScope === 'selected' && formData.restaurantIds) {
          payload.restaurantIds = formData.restaurantIds.split(',').map(s => s.trim()).filter(Boolean)
      } else {
          payload.restaurantIds = []
      }
      
      payload.eligibleItems = formData.eligibleItemsScope === 'selected' && formData.eligibleItems ? formData.eligibleItems.split(',').map(s => s.trim()).filter(Boolean) : []
      payload.freeItems = formData.freeItems ? formData.freeItems.split(',').map(s => s.trim()).filter(Boolean) : []

      if (formData.maxRedemptions) payload.maxRedemptions = Number(formData.maxRedemptions)
      if (formData.maxRedemptionsPerUser) payload.maxRedemptionsPerUser = Number(formData.maxRedemptionsPerUser)
      if (formData.reimbursementType === 'fixed') payload.fixedReimbursementAmount = Number(formData.fixedReimbursementAmount)
      
      if (formData.startDate) payload.startDate = new Date(formData.startDate).toISOString()
      if (formData.endDate) {
          const ed = new Date(formData.endDate)
          ed.setHours(23, 59, 59, 999)
          payload.endDate = ed.toISOString()
      }

      if (editingOfferId) {
        await adminAPI.updateBogoOffer(editingOfferId, payload)
        setSubmitSuccess("BOGO Offer updated successfully")
        setIsAddOpen(false)
      } else {
        await adminAPI.createBogoOffer(payload)
        setSubmitSuccess("BOGO Offer created successfully")
      }
      
      resetForm()
      await fetchOffers()
    } catch (err) {
      setSubmitError(err?.response?.data?.message || err.message || "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sponsored BOGO Offers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage admin-funded Buy 1 Get 1 promotions</p>
        </div>
        <button
          onClick={() => {
            setIsAddOpen((prev) => !prev)
            setSubmitError("")
            setSubmitSuccess("")
            if (isAddOpen) resetForm()
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {isAddOpen ? "Close Form" : "Create Offer"}
        </button>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
          {submitSuccess}
        </div>
      )}

      {isAddOpen && (
        <form onSubmit={handleSubmit} className="border border-slate-200 rounded-xl p-5 mb-5 bg-white shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">{editingOfferId ? "Edit BOGO Offer" : "Create BOGO Offer"}</h3>
          
          {submitError && (
            <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Offer Name *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Diwali BOGO" />
            </div>
            <div className="space-y-1 lg:col-span-2">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
            </div>

            {/* Targeting Configuration */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Restaurant Scope</label>
              <select value={formData.restaurantScope} onChange={e => setFormData({...formData, restaurantScope: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-purple-50">
                <option value="all">All Restaurants</option>
                <option value="selected">Selected Restaurants</option>
              </select>
            </div>
            {formData.restaurantScope === 'selected' && (
              <div className="space-y-1 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">Select Restaurants (Hold Ctrl/Cmd to select multiple)</label>
                <select 
                  multiple
                  value={formData.restaurantIds ? formData.restaurantIds.split(',').map(s => s.trim()).filter(Boolean) : []}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({...formData, restaurantIds: selected.join(', ')});
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-purple-50 h-32"
                >
                  {restaurants.map(r => (
                    <option key={r._id || r.id} value={r._id || r.id}>
                      {r.restaurantName || r.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500">Currently selected IDs: {formData.restaurantIds || "None"}</p>
              </div>
            )}

            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Eligible Items Scope</label>
              <select value={formData.eligibleItemsScope} onChange={e => setFormData({...formData, eligibleItemsScope: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-purple-50">
                <option value="all">All Items</option>
                <option value="selected">Selected Items</option>
              </select>
            </div>
            {formData.eligibleItemsScope === 'selected' && (
              <div className="space-y-1 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700">Select Eligible Items (Hold Ctrl/Cmd)</label>
                {foodsLoading ? (
                  <div className="p-2 text-sm text-slate-500">Loading foods...</div>
                ) : availableFoods.length > 0 ? (
                  <select 
                    multiple
                    value={formData.eligibleItems ? formData.eligibleItems.split(',').map(s => s.trim()).filter(Boolean) : []}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setFormData({...formData, eligibleItems: selected.join(', ')});
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-purple-50 h-32"
                  >
                    {availableFoods.map(f => (
                      <option key={f._id || f.id} value={f._id || f.id}>
                        {f.name} (₹{f.price})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-2 text-sm text-slate-500">No foods available. Select a restaurant first.</div>
                )}
                <p className="text-xs text-slate-500">Currently selected IDs: {formData.eligibleItems || "None"}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Specific Free Item IDs</label>
              <input type="text" value={formData.freeItems} onChange={e => setFormData({...formData, freeItems: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="Leave empty to give same item free" />
            </div>
            
            <div className="col-span-full border-t border-slate-200 my-2"></div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Buy Quantity *</label>
              <input type="number" min="1" required value={formData.buyQuantity} onChange={e => setFormData({...formData, buyQuantity: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Free Quantity *</label>
              <input type="number" min="1" required value={formData.freeQuantity} onChange={e => setFormData({...formData, freeQuantity: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Max Free Items / Order *</label>
              <input type="number" min="1" required value={formData.maxFreeItemsPerOrder} onChange={e => setFormData({...formData, maxFreeItemsPerOrder: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Campaign Budget (₹) *</label>
              <input type="number" min="0" required value={formData.campaignBudget} onChange={e => setFormData({...formData, campaignBudget: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-blue-50" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Max Redemptions (Total)</label>
              <input type="number" min="1" value={formData.maxRedemptions} onChange={e => setFormData({...formData, maxRedemptions: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="Unlimited if empty" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Max Discount (₹)</label>
              <input type="number" min="0" value={formData.maxDiscountAmount} onChange={e => setFormData({...formData, maxDiscountAmount: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="Unlimited if empty" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Min Order Value (₹)</label>
              <input type="number" min="0" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Reimbursement Type *</label>
              <select value={formData.reimbursementType} onChange={e => setFormData({...formData, reimbursementType: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                <option value="full_price">Full Item Price</option>
                <option value="fixed">Fixed Amount</option>
                <option value="custom">Custom (JSON Map)</option>
              </select>
            </div>
            {formData.reimbursementType === 'fixed' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Fixed Reimbursement (₹) *</label>
                <input type="number" min="0" required value={formData.fixedReimbursementAmount} onChange={e => setFormData({...formData, fixedReimbursementAmount: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-blue-50" />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Start Date</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">End Date</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (editingOfferId ? "Updating..." : "Creating...") : (editingOfferId ? "Update Offer" : "Create Offer")}
            </button>
            {editingOfferId && (
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setIsAddOpen(false)
                }}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget Utilization</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">Loading BOGO offers...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-red-500">{error}</td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">No BOGO offers found.</td>
                </tr>
              ) : (
                offers.map(offer => (
                  <tr key={offer._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{offer.name}</div>
                      <div className="text-xs text-slate-500">Buy {offer.buyQuantity} Get {offer.freeQuantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                        {offer.reimbursementType === 'full_price' ? 'Full Price' : offer.reimbursementType === 'fixed' ? `Fixed ₹${offer.fixedReimbursementAmount}` : 'Custom'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${((offer.usedBudget || 0) / offer.campaignBudget) > 0.9 ? 'bg-red-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(100, ((offer.usedBudget || 0) / offer.campaignBudget) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-600">
                          ₹{offer.usedBudget || 0} / ₹{offer.campaignBudget}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        offer.status === 'active' ? 'bg-green-100 text-green-700' : 
                        offer.status === 'paused' ? 'bg-amber-100 text-amber-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {offer.startDate ? formatYMD(offer.startDate) : 'Any'} - {offer.endDate ? formatYMD(offer.endDate) : 'Any'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(offer)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(offer._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
