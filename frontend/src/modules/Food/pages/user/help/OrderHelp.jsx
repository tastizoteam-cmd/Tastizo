import { useParams, Link, useNavigate, useLocation } from "react-router-dom"
import {
  ArrowLeft,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  RefreshCw,
  CreditCard,
  MapPin,
  HelpCircle
} from "lucide-react"
import AnimatedPage from "@food/components/user/AnimatedPage"
import ScrollReveal from "@food/components/user/ScrollReveal"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@food/components/ui/card"
import { Button } from "@food/components/ui/button"
import { Badge } from "@food/components/ui/badge"
import { useOrders } from "@food/context/OrdersContext"

const commonIssues = [
  {
    id: "late-delivery",
    title: "Order is Late",
    icon: Clock,
    description: "Your order hasn't arrived within the estimated time",
    solutions: [
      "Check the order tracking page for real-time updates",
      "Contact the delivery driver if contact information is available",
      "Wait an additional 15-20 minutes as delays can occur",
      "Contact support if the order is more than 30 minutes late"
    ],
    actions: [
      { label: "Track Order", path: "track" },
      { label: "Contact Support", path: "support" }
    ]
  },
  {
    id: "missing-items",
    title: "Missing Items",
    icon: Package,
    description: "Some items from your order are missing",
    solutions: [
      "Check your order receipt to verify what was ordered",
      "Check if items were delivered separately",
      "Contact support immediately with your order number",
      "Take photos if possible to help with the investigation"
    ],
    actions: [
      { label: "View Invoice", path: "invoice" },
      { label: "Report Issue", path: "support" }
    ]
  },
  {
    id: "wrong-order",
    title: "Wrong Order Received",
    icon: XCircle,
    description: "You received items different from what you ordered",
    solutions: [
      "Keep the incorrect order - you won't be charged for it",
      "Contact support immediately with your order number",
      "We'll arrange a replacement or full refund",
      "You may be eligible for a discount on your next order"
    ],
    actions: [
      { label: "View Order Details", path: "track" },
      { label: "Report Issue", path: "support" }
    ]
  },
  {
    id: "quality-issue",
    title: "Quality Issue",
    icon: AlertCircle,
    description: "Food quality doesn't meet expectations",
    solutions: [
      "Contact support within 24 hours of delivery",
      "Describe the issue in detail",
      "Take photos if possible",
      "We'll process a full refund or replacement"
    ],
    actions: [
      { label: "Report Issue", path: "support" },
      { label: "Request Refund", path: "refund" }
    ]
  },
  {
    id: "payment-issue",
    title: "Payment Problem",
    icon: CreditCard,
    description: "Issues with payment or billing",
    solutions: [
      "Check your payment method in your profile",
      "Verify the charge on your bank statement",
      "Contact support if you were charged incorrectly",
      "We'll investigate and process a refund if needed"
    ],
    actions: [
      { label: "View Invoice", path: "invoice" },
      { label: "Contact Support", path: "support" }
    ]
  },
  {
    id: "cancel-order",
    title: "Cancel Order",
    icon: RefreshCw,
    description: "Need to cancel your order",
    solutions: [
      "Orders can be cancelled within 5 minutes of placement",
      "After 5 minutes, contact support for cancellation",
      "If the order is already being prepared, cancellation may not be possible",
      "Refunds are processed automatically for cancelled orders"
    ],
    actions: [
      { label: "Contact Support", path: "support" },
      { label: "View Order", path: "track" }
    ]
  }
]

export default function OrderHelp() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { getOrderById } = useOrders()
  const order = getOrderById(orderId)

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-[#2A9C64]"
      case "preparing":
        return "bg-[#2A9C64]"
      case "outForDelivery":
        return "bg-[#2A9C64]"
      case "delivered":
        return "bg-[#2A9C64]"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "confirmed":
        return "Confirmed"
      case "preparing":
        return "Preparing"
      case "outForDelivery":
        return "Out for Delivery"
      case "delivered":
        return "Delivered"
      default:
        return status
    }
  }

  const handleAction = (action) => {
    switch (action) {
      case "track":
        navigate(`/user/orders/${orderId}`)
        break
      case "invoice":
        navigate(`/user/orders/${orderId}/invoice`)
        break
      case "support":
        document.getElementById("contact-support")?.scrollIntoView({ behavior: "smooth" })
        break
      case "refund":
        navigate("/user/profile/support", { state: { from: location.pathname, backTo: location.pathname } })
        break
      default:
        break
    }
  }

  if (!order) {
    return (
      <AnimatedPage className="min-h-screen bg-gradient-to-b from-yellow-50/30 via-white to-orange-50/20 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find an order with ID: {orderId}
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/user/orders">
                  <Button variant="outline">View All Orders</Button>
                </Link>
                <Link to="/user/help">
                  <Button>Go to Help Center</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a0a] pb-20 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 dark:border-gray-800 pb-5">
            <div className="flex items-center gap-3">
              <Link to="/user/help">
                <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-slate-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shadow-2xs hover:bg-slate-50 dark:hover:bg-gray-800">
                  <ArrowLeft className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Order Help</h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Assistance for Order #{order.id}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(order.status)} text-white px-3 py-1 text-xs sm:text-sm font-semibold rounded-full shadow-2xs`}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </ScrollReveal>

        {/* Order Summary */}
        <ScrollReveal delay={0.1}>
          <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-5 bg-slate-50/60 dark:bg-gray-900/40 border-b border-slate-100 dark:border-gray-800/60">
              <CardTitle className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                <div className="p-2 bg-[#2A9C64]/10 text-[#2A9C64] rounded-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/30 border border-slate-100 dark:border-gray-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Order ID</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm truncate">#{order.id}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/30 border border-slate-100 dark:border-gray-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Placed On</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{formatDate(order.createdAt)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/30 border border-slate-100 dark:border-gray-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Total Amount</p>
                  <p className="font-extrabold text-[#2A9C64] text-base">${order.total.toFixed(2)}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/30 border border-slate-100 dark:border-gray-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Items Count</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{order.items?.length || 0} items</p>
                </div>
              </div>

              {order.address && (
                <div className="pt-3 border-t border-slate-100 dark:border-gray-800/60 flex items-start gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-gray-800 rounded-lg text-slate-600 dark:text-slate-400 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Delivery Address</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {order.address.street}
                      {order.address.additionalDetails && `, ${order.address.additionalDetails}`}
                      <br />
                      {order.address.city}, {order.address.state} {order.address.zipCode}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Quick Actions */}
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Link to={`/user/orders/${orderId}`} className="block">
              <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs hover:shadow-sm hover:border-[#2A9C64]/40 transition-all group h-full">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="p-3 bg-[#2A9C64]/10 text-[#2A9C64] rounded-xl group-hover:bg-[#2A9C64] group-hover:text-white transition-colors">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Track Order</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Live delivery map</div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to={`/user/orders/${orderId}/invoice`} className="block">
              <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs hover:shadow-sm hover:border-[#2A9C64]/40 transition-all group h-full">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="p-3 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">View Invoice</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Download receipt</div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <div
              onClick={() => document.getElementById("contact-support")?.scrollIntoView({ behavior: "smooth" })}
              className="block cursor-pointer"
            >
              <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-2xs hover:shadow-sm hover:border-[#2A9C64]/40 transition-all group h-full">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">Contact Support</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Get assistance now</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollReveal>

        {/* Common Issues */}
        <ScrollReveal delay={0.2}>
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">What can we help you with?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonIssues.map((issue) => {
                const Icon = issue.icon
                return (
                  <Card
                    key={issue.id}
                    className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-start gap-3.5">
                          <div className="p-3 bg-slate-100 dark:bg-gray-800 text-[#2A9C64] rounded-xl flex-shrink-0">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{issue.title}</CardTitle>
                            <CardDescription className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{issue.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 pt-2 space-y-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-900/30 border border-slate-100 dark:border-gray-800/60 space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">What to do:</p>
                          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            {issue.solutions.map((solution, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-[#2A9C64] mt-0.5 flex-shrink-0" />
                                <span>{solution}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </div>
                    <div className="p-5 pt-3 border-t border-slate-100 dark:border-gray-800/60 bg-slate-50/40 dark:bg-gray-900/20 flex flex-wrap gap-2">
                      {issue.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant={idx === 0 ? "default" : "outline"}
                          size="sm"
                          className={idx === 0 ? "bg-[#2A9C64] hover:opacity-90 text-white rounded-xl font-semibold text-xs shadow-2xs" : "border-slate-200 dark:border-gray-800 rounded-xl font-semibold text-xs"}
                          onClick={() => handleAction(action.path)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Contact Support Section */}
        <ScrollReveal delay={0.3}>
          <Card id="contact-support" className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-sm overflow-hidden scroll-mt-24">
            <div className="bg-gradient-to-r from-[#2A9C64]/10 via-[#2A9C64]/5 to-transparent p-5 sm:p-6 border-b border-slate-200/60 dark:border-gray-800">
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#2A9C64] text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span>Contact Support for This Order</span>
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Our support team is on standby to help resolve any queries for order #{order.id}.
              </CardDescription>
            </div>

            <CardContent className="p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3.5 p-4 bg-slate-50/50 dark:bg-gray-900/30 rounded-xl border border-slate-200/80 dark:border-gray-800">
                  <div className="p-2.5 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-lg">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">Email Support</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Automated subject header for order #{order.id}
                    </p>
                    <a
                      href={`mailto:support@tastizo.com?subject=Help with Order ${order.id}`}
                      className="text-sm font-semibold text-[#2A9C64] hover:underline block truncate"
                    >
                      support@tastizo.com
                    </a>
                    <a
                      href={`mailto:tastizoteam@gmail.com?subject=Help with Order ${order.id}`}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline block mt-0.5 truncate transition-colors"
                    >
                      tastizoteam@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 bg-slate-50/50 dark:bg-gray-900/30 rounded-xl border border-slate-200/80 dark:border-gray-800">
                  <div className="p-2.5 bg-[#2A9C64]/10 dark:bg-[#2A9C64]/20 text-[#2A9C64] rounded-lg">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-1">In-App Support Ticket</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                      Raise & track tickets inside your account
                    </p>
                    <Link to="/user/profile/support" state={{ from: location.pathname, backTo: location.pathname }}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full font-semibold border-[#2A9C64] text-[#2A9C64] hover:bg-[#2A9C64] hover:text-white rounded-lg transition-all"
                      >
                        Raise Ticket Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/60 dark:border-gray-800">
                <Link to="/user/profile/support" state={{ from: location.pathname, backTo: location.pathname }}>
                  <Button className="w-full bg-[#2A9C64] hover:opacity-90 text-white rounded-xl py-6 font-bold shadow-sm">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Open Support Center & Tickets
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Back Navigation Footer */}
        <ScrollReveal delay={0.4}>
          <div className="flex gap-3 pt-2">
            <Link to="/user/orders" className="flex-1">
              <Button variant="outline" className="w-full rounded-xl py-5 border-slate-200 dark:border-gray-800 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Orders
              </Button>
            </Link>
            <Link to="/user/help" className="flex-1">
              <Button variant="outline" className="w-full rounded-xl py-5 border-slate-200 dark:border-gray-800 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help Center
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </AnimatedPage>
  )
}
