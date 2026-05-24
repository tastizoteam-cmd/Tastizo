import { useState, useMemo, useEffect, useCallback } from "react"
import { Search, Download, ChevronDown, DollarSign, Calendar, Filter, Loader2, FileText, FileSpreadsheet, Code } from "lucide-react"
import { adminAPI } from "@food/api"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@food/components/ui/dropdown-menu"
import { toast } from "sonner"
const debugError = (...args) => {}

const formatCurrency = (amount) => {
  return `₹${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function DiningEarnings() {
  const [searchQuery, setSearchQuery] = useState("")
  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 })
  const [summary, setSummary] = useState({
    totalEarnings: 0,
    totalCommission: 0,
    platformNetProfit: 0,
    restaurantShare: 0,
    couponDiscount: 0,
    totalOrders: 0
  })
  const [filters, setFilters] = useState({
    period: 'all',
    fromDate: '',
    toDate: ''
  })

  // Fetch earnings from API
  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        period: filters.period,
        ...(filters.fromDate && { fromDate: filters.fromDate }),
        ...(filters.toDate && { toDate: filters.toDate }),
        ...(searchQuery.trim() && { search: searchQuery.trim() })
      }

      const response = await adminAPI.getDiningEarnings(params)
      
      if (response.data?.success) {
        setEarnings(response.data.data.earnings || [])
        setSummary(response.data.data.summary || {})
        setPagination(response.data.data.pagination || pagination)
      } else {
        setError(response.data?.message || "Failed to fetch dining earnings")
        setEarnings([])
      }
    } catch (err) {
      debugError("Error fetching dining earnings:", err)
      const errorMessage = err.response?.data?.message || "Failed to fetch dining earnings. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
      setEarnings([])
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters, searchQuery])

  useEffect(() => {
    fetchEarnings()
  }, [fetchEarnings])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleExport = (format) => {
    if (earnings.length === 0) {
      toast.info("No data to export")
      return
    }

    const headers = [
      { key: "sl", label: "SI" },
      { key: "bookingId", label: "Booking ID" },
      { key: "restaurantName", label: "Restaurant" },
      { key: "customerName", label: "Customer" },
      { key: "customerPhone", label: "Phone" },
      { key: "grossBill", label: "Gross Bill" },
      { key: "discount", label: "Discount" },
      { key: "customerPaid", label: "Customer Paid" },
      { key: "restaurantShare", label: "Restaurant Share" },
      { key: "commission", label: "Commission" },
      { key: "platformNetProfit", label: "Platform Net Profit" },
      { key: "status", label: "Status" },
      { key: "createdAt", label: "Date" },
    ]

    const data = earnings.map((earning, index) => ({
      sl: (pagination.page - 1) * pagination.limit + index + 1,
      bookingId: earning.bookingId || 'N/A',
      restaurantName: earning.restaurantName || 'N/A',
      customerName: earning.customerName || 'N/A',
      customerPhone: earning.customerPhone || 'N/A',
      grossBill: formatCurrency(earning.grossBill),
      discount: formatCurrency(earning.discount),
      customerPaid: formatCurrency(earning.customerPaid),
      restaurantShare: formatCurrency(earning.restaurantShare),
      commission: formatCurrency(earning.commission),
      platformNetProfit: formatCurrency(earning.platformNetProfit),
      status: earning.status || 'N/A',
      createdAt: formatDate(earning.createdAt)
    }))

    switch (format) {
      case "csv":
        const csvContent = [
          headers.map(h => h.label).join(","),
          ...data.map(row => headers.map(h => `"${row[h.key] || ''}"`).join(","))
        ].join("\n")
        const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const csvLink = document.createElement("a")
        csvLink.href = URL.createObjectURL(csvBlob)
        csvLink.download = `dining_earnings_${new Date().toISOString().split('T')[0]}.csv`
        csvLink.click()
        toast.success("CSV exported successfully")
        break
      case "excel":
        toast.info("Excel export coming soon")
        break
      case "pdf":
        toast.info("PDF export coming soon")
        break
      case "json":
        const jsonContent = JSON.stringify(data, null, 2)
        const jsonBlob = new Blob([jsonContent], { type: "application/json" })
        const jsonLink = document.createElement("a")
        jsonLink.href = URL.createObjectURL(jsonBlob)
        jsonLink.download = `dining_earnings_${new Date().toISOString().split('T')[0]}.json`
        jsonLink.click()
        toast.success("JSON exported successfully")
        break
      default:
        toast.error("Invalid export format")
    }
  }

  if (loading && earnings.length === 0) {
    return (
      <div className="p-4 lg:p-6 bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading dining earnings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="w-full mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dining Earnings</h1>
                <p className="text-sm text-slate-600">View real-time dining-related earnings and transactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Total Orders</p>
            <p className="text-xl font-bold text-slate-900">{summary.totalOrders || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Total Earnings</p>
            <p className="text-xl font-bold text-indigo-600">{formatCurrency(summary.totalEarnings || 0)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Total Commission</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(summary.totalCommission || 0)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Net Profit</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(summary.platformNetProfit || 0)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Restaurant Share</p>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(summary.restaurantShare || 0)}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600 mb-1">Discounts</p>
            <p className="text-xl font-bold text-red-500">{formatCurrency(summary.couponDiscount || 0)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Period</label>
              <select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Search and Export */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by booking ID, readable ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")}>
                  <Code className="w-4 h-4 mr-2" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase">SI</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase">Booking ID</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase">Restaurant</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase">Customer</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Gross Bill</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase">Discount</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Customer Paid</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Rest. Share</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase">Commission</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase">Net Profit</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-700 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {earnings.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-lg font-semibold text-slate-700 mb-1">No Dining Earnings Found</p>
                        <p className="text-sm text-slate-500">No earnings match your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  earnings.map((earning, index) => (
                    <tr key={earning.transactionId || index} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                        {earning.bookingId || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-800 font-medium">
                        {earning.restaurantName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <div>{earning.customerName || 'N/A'}</div>
                        <div className="text-xs text-slate-500">{earning.customerPhone || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {formatCurrency(earning.grossBill)}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-500">
                        {formatCurrency(earning.discount)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">
                        {formatCurrency(earning.customerPaid)}
                      </td>
                      <td className="px-4 py-3 text-sm text-amber-600 font-medium">
                        {formatCurrency(earning.restaurantShare)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                        {formatCurrency(earning.commission)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                        {formatCurrency(earning.platformNetProfit)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          ['paid', 'captured', 'successful'].includes(earning.status?.toLowerCase())
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {earning.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                        {formatDate(earning.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} earnings
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm rounded border border-slate-300 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.pages) }).map((_, idx) => {
                  const pageNum = pagination.page <= 3 
                    ? idx + 1 
                    : pagination.page >= pagination.pages - 2 
                      ? pagination.pages - 4 + idx 
                      : pagination.page - 2 + idx
                  if (pageNum < 1 || pageNum > pagination.pages) return null
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm rounded border ${
                        pagination.page === pageNum
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-1 text-sm rounded border border-slate-300 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
