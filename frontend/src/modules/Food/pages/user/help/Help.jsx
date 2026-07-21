import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Search,
  HelpCircle,
  Package,
  CreditCard,
  User,
  Truck,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  FileText,
  Shield,
  Clock,
  MapPin
} from "lucide-react"
import AnimatedPage from "@food/components/user/AnimatedPage"
import ScrollReveal from "@food/components/user/ScrollReveal"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@food/components/ui/card"
import { Button } from "@food/components/ui/button"
import { Input } from "@food/components/ui/input"
import { Badge } from "@food/components/ui/badge"

const helpCategories = [
  {
    id: "ordering",
    title: "Ordering",
    icon: Package,
    color: "text-[#2A9C64]",
    bgColor: "bg-orange-50",
    description: "Learn how to place and manage orders",
    topics: [
      {
        question: "How do I place an order?",
        answer: "To place an order, browse restaurants, add items to your cart, and proceed to checkout. Select your delivery address and payment method, then confirm your order."
      },
      {
        question: "Can I modify or cancel my order?",
        answer: "You can modify or cancel your order within 5 minutes of placing it. After that, please contact support for assistance."
      },
      {
        question: "How do I track my order?",
        answer: "Go to 'My Orders' in your profile, select the order you want to track, and you'll see real-time updates on your order status."
      },
      {
        question: "What is the minimum order amount?",
        answer: "The minimum order amount varies by restaurant, typically ranging from ₹10 to ₹15. This information is displayed on each restaurant's page."
      }
    ]
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    color: "text-[#2A9C64]",
    bgColor: "bg-orange-50",
    description: "Payment methods and billing questions",
    topics: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, debit cards, digital wallets (Apple Pay, Google Pay), and cash on delivery in select areas."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, we use industry-standard encryption to protect your payment information. We never store your full card details."
      },
      {
        question: "Can I get a refund?",
        answer: "Refunds are processed for cancelled orders, incorrect items, or quality issues. Contact support within 24 hours of delivery for assistance."
      },
      {
        question: "Why was my payment declined?",
        answer: "Payment can be declined due to insufficient funds, incorrect card details, or bank restrictions. Please verify your payment method and try again."
      }
    ]
  },
  {
    id: "delivery",
    title: "Delivery",
    icon: Truck,
    color: "text-#1E7A4A",
    bgColor: "bg-orange-50",
    description: "Delivery times, fees, and tracking",
    topics: [
      {
        question: "What are your delivery times?",
        answer: "Delivery times typically range from 30-60 minutes, depending on the restaurant and your location. Estimated time is shown before checkout."
      },
      {
        question: "How much is the delivery fee?",
        answer: "Delivery fees vary by restaurant and distance, typically ranging from ₹2.99 to ₹5.99. The exact fee is shown before you place your order."
      },
      {
        question: "Can I schedule a delivery for later?",
        answer: "Yes, you can schedule orders for up to 7 days in advance during checkout. Select your preferred delivery time."
      },
      {
        question: "What if my order is late?",
        answer: "If your order is significantly delayed, contact support. We'll investigate and may provide compensation or a refund."
      }
    ]
  },
  {
    id: "account",
    title: "Account & Profile",
    icon: User,
    color: "text-[#2A9C64]",
    bgColor: "bg-orange-50",
    description: "Manage your account and preferences",
    topics: [
      {
        question: "How do I update my profile?",
        answer: "Go to 'Profile' in the menu, then select 'Edit Profile' to update your name, email, phone number, and other information."
      },
      {
        question: "How do I change my password?",
        answer: "Go to Profile > Settings > Security to change your password. You'll need to verify your current password first."
      },
      {
        question: "How do I manage my addresses?",
        answer: "Navigate to Profile > Addresses to view, add, edit, or delete delivery addresses. Set a default address for faster checkout."
      },
      {
        question: "How do I save my favorite restaurants?",
        answer: "Click the heart icon on any restaurant page to add it to your favorites. View all favorites in Profile > Favorites."
      }
    ]
  },
  {
    id: "refunds",
    title: "Refunds & Returns",
    icon: Shield,
    color: "text-[#2A9C64]",
    bgColor: "bg-orange-50",
    description: "Refund policy and return process",
    topics: [
      {
        question: "What is your refund policy?",
        answer: "We offer full refunds for cancelled orders, incorrect items, or quality issues reported within 24 hours of delivery."
      },
      {
        question: "How long do refunds take?",
        answer: "Refunds are typically processed within 5-7 business days, depending on your payment method. You'll receive a confirmation email."
      },
      {
        question: "Can I return food items?",
        answer: "Due to food safety regulations, we cannot accept returns of food items. However, we'll provide a full refund for quality issues."
      },
      {
        question: "What if I received the wrong order?",
        answer: "Contact support immediately with your order number. We'll arrange a replacement or full refund, and you can keep the incorrect order."
      }
    ]
  },
  {
    id: "general",
    title: "General Questions",
    icon: HelpCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    description: "Other frequently asked questions",
    topics: [
      {
        question: "Do you offer discounts or promotions?",
        answer: "Yes! Check the 'Offers' section for current promotions, discount codes, and special deals from restaurants."
      },
      {
        question: "How do I contact customer support?",
        answer: "You can contact us via phone, email, or live chat. Visit the 'Contact Support' section below for all contact options."
      },
      {
        question: "Is there a mobile app?",
        answer: "Yes, our mobile app is available for iOS and Android. Download it from the App Store or Google Play for the best experience."
      },
      {
        question: "Do you deliver to my area?",
        answer: "Enter your delivery address to see available restaurants in your area. We're constantly expanding our delivery zones."
      }
    ]
  }
]

export default function Help() {
  const location = useLocation()
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [expandedQuestion, setExpandedQuestion] = useState(null)

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.topics.some(topic =>
      topic.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
    setExpandedQuestion(null)
  }

  const toggleQuestion = (questionIndex) => {
    setExpandedQuestion(expandedQuestion === questionIndex ? null : questionIndex)
  }

  return (
    <AnimatedPage className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a0a] pb-20">
      {/* Premium Hero Section */}
      <div className="bg-gradient-to-b from-white via-slate-50 to-[#f8fafc] dark:from-[#121212] dark:via-[#0e0e0e] dark:to-[#0a0a0a] border-b border-slate-200/60 dark:border-gray-800/80 pt-6 pb-10 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <ScrollReveal>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2A9C64]/10 text-[#2A9C64] text-xs font-semibold mb-1">
              <Shield className="h-3.5 w-3.5" />
              <span>24/7 Support Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Help & Support Center
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto pt-1">
              Find instant answers to common questions or connect with our support team directly.
            </p>
          </ScrollReveal>

          {/* Search Bar */}
          <ScrollReveal delay={0.1}>
            <div className="pt-3 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <Input
                  type="text"
                  placeholder="Search questions, topics, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 h-13 sm:h-14 bg-white dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 rounded-2xl shadow-sm text-base sm:text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#2A9C64] focus-visible:border-transparent transition-all"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 mt-8 space-y-8">
        {/* Quick Actions Grid */}
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/user/orders" state={{ from: location.pathname, backTo: location.pathname }} className="block">
              <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-[#2A9C64]/50 transition-all duration-200 group h-full">
                <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-[#2A9C64]/10 dark:bg-[#2A9C64]/20 text-[#2A9C64] rounded-xl group-hover:bg-[#2A9C64] group-hover:text-white transition-colors duration-200">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Track Your Order</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Check real-time delivery status</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#2A9C64] group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>

            <Link to="/user/profile" state={{ from: location.pathname, backTo: location.pathname }} className="block">
              <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-[#2A9C64]/50 transition-all duration-200 group h-full">
                <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors duration-200">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Manage Account</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Profile, settings & security</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>

            <div
              onClick={() => document.getElementById("contact-support")?.scrollIntoView({ behavior: "smooth" })}
              className="block cursor-pointer"
            >
              <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-[#2A9C64]/50 transition-all duration-200 group h-full">
                <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Contact Support</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Reach our dedicated team</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollReveal>

        {/* Browse by Category */}
        <ScrollReveal delay={0.25}>
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Browse by Category</h2>
            {filteredCategories.length === 0 ? (
              <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm">
                <CardContent className="py-12 text-center">
                  <HelpCircle className="h-14 w-14 mx-auto text-slate-400 mb-3" />
                  <p className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No results found</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Try searching with different keywords or check all categories below.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="border-slate-300 dark:border-gray-700"
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredCategories.map((category) => {
                  const Icon = category.icon
                  const isExpanded = expandedCategory === category.id

                  return (
                    <Card
                      key={category.id}
                      className={`bg-white dark:bg-[#1a1a1a] rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? "border-[#2A9C64] shadow-md md:col-span-2"
                          : "border-slate-200/80 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-gray-700"
                      }`}
                    >
                      <CardHeader
                        onClick={() => toggleCategory(category.id)}
                        className="p-4 sm:p-5 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-gray-900/30 transition-colors select-none"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className={`p-3 rounded-xl ${category.bgColor} dark:bg-slate-800/80`}>
                              <Icon className={`h-5 w-5 ${category.color}`} />
                            </div>
                            <div>
                              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                {category.title}
                              </CardTitle>
                              <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                {category.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="p-1.5 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-400 flex-shrink-0">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent className="p-4 sm:p-5 pt-0 space-y-2.5 border-t border-slate-100 dark:border-gray-800/60 bg-slate-50/50 dark:bg-gray-900/20">
                          <div className="pt-3 space-y-2.5">
                            {category.topics.map((topic, topicIndex) => {
                              const questionIndex = `${category.id}-${topicIndex}`
                              const isQuestionExpanded = expandedQuestion === questionIndex

                              return (
                                <div
                                  key={topicIndex}
                                  className="border border-slate-200/80 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] shadow-2xs transition-all"
                                >
                                  <button
                                    onClick={() => toggleQuestion(questionIndex)}
                                    className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-gray-900/40 transition-colors"
                                  >
                                    <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                                      {topic.question}
                                    </span>
                                    {isQuestionExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-[#2A9C64] flex-shrink-0" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    )}
                                  </button>
                                  {isQuestionExpanded && (
                                    <div className="p-4 pt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-gray-800/60 bg-slate-50/60 dark:bg-gray-900/40 leading-relaxed">
                                      {topic.answer}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Contact Support Section */}
        <ScrollReveal delay={0.35}>
          <Card id="contact-support" className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-sm overflow-hidden scroll-mt-24">
            <div className="bg-gradient-to-r from-[#2A9C64]/10 via-[#2A9C64]/5 to-transparent p-5 sm:p-6 border-b border-slate-200/60 dark:border-gray-800">
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#2A9C64] text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <span>Still Need Help?</span>
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Our customer support team is available 24/7 to resolve any order or account queries.
              </CardDescription>
            </div>

            <CardContent className="p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Email Support Card */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="p-2.5 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-lg">
                        <Mail className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">Email Support</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Official support & inquiries
                    </p>
                  </div>
                  <div className="space-y-1">
                    <a
                      href="mailto:support@tastizo.com"
                      className="text-sm font-semibold text-[#2A9C64] hover:underline block truncate"
                    >
                      support@tastizo.com
                    </a>
                    <a
                      href="mailto:tastizoteam@gmail.com"
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline block truncate transition-colors"
                    >
                      tastizoteam@gmail.com
                    </a>
                  </div>
                </div>

                {/* In-App Tickets Card */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="p-2.5 bg-[#2A9C64]/10 dark:bg-[#2A9C64]/20 text-[#2A9C64] rounded-lg">
                        <MessageCircle className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">In-App Tickets</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Raise & track issues in-app
                    </p>
                  </div>
                  <Link to="/user/profile/support" state={{ from: location.pathname, backTo: location.pathname }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full font-semibold border-[#2A9C64] text-[#2A9C64] hover:bg-[#2A9C64] hover:text-white transition-all rounded-lg"
                    >
                      Raise Support Ticket
                    </Button>
                  </Link>
                </div>

                {/* Order Assistance Card */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-900/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="p-2.5 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Package className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">Order Status</h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      Need help with an order?
                    </p>
                  </div>
                  <Link to="/user/orders" state={{ from: location.pathname, backTo: location.pathname }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full font-semibold border-slate-300 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all rounded-lg"
                    >
                      View All Orders
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200/60 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#2A9C64]" />
                  <span>Average response time: <strong>Under 5 minutes</strong></span>
                </div>
                <span>Available 24 hours a day, 7 days a week</span>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Legal & Privacy Policies */}
        <ScrollReveal delay={0.45}>
          <Card className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#2A9C64]" />
                <span>Legal & Privacy Policies</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Important policies, terms of service, and user rights for the Tastizo platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <Link
                  to="/privacy"
                  state={{ from: location.pathname, backTo: location.pathname }}
                  className="p-3 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-200/60 dark:border-gray-800 hover:bg-[#2A9C64]/10 hover:border-[#2A9C64]/40 transition-all text-center group"
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#2A9C64] transition-colors">
                    Privacy Policy
                  </p>
                </Link>
                <Link
                  to="/terms"
                  state={{ from: location.pathname, backTo: location.pathname }}
                  className="p-3 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-200/60 dark:border-gray-800 hover:bg-[#2A9C64]/10 hover:border-[#2A9C64]/40 transition-all text-center group"
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#2A9C64] transition-colors">
                    Terms of Service
                  </p>
                </Link>
                <Link
                  to="/data-deletion"
                  state={{ from: location.pathname, backTo: location.pathname }}
                  className="p-3 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-200/60 dark:border-gray-800 hover:bg-[#2A9C64]/10 hover:border-[#2A9C64]/40 transition-all text-center group"
                >
                  <p className="text-xs sm:text-sm font-semibold text-[#2A9C64] group-hover:underline transition-all">
                    Data Deletion
                  </p>
                </Link>
                <Link
                  to="/refund"
                  state={{ from: location.pathname, backTo: location.pathname }}
                  className="p-3 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-200/60 dark:border-gray-800 hover:bg-[#2A9C64]/10 hover:border-[#2A9C64]/40 transition-all text-center group"
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#2A9C64] transition-colors">
                    Refund Policy
                  </p>
                </Link>
                <Link
                  to="/shipping"
                  state={{ from: location.pathname, backTo: location.pathname }}
                  className="p-3 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-200/60 dark:border-gray-800 hover:bg-[#2A9C64]/10 hover:border-[#2A9C64]/40 transition-all text-center group"
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#2A9C64] transition-colors">
                    Shipping Policy
                  </p>
                </Link>
                <Link
                  to="/cancellation"
                  state={{ from: location.pathname, backTo: location.pathname }}
                  className="p-3 bg-slate-50 dark:bg-gray-900/50 rounded-xl border border-slate-200/60 dark:border-gray-800 hover:bg-[#2A9C64]/10 hover:border-[#2A9C64]/40 transition-all text-center group"
                >
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#2A9C64] transition-colors">
                    Cancellation
                  </p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </AnimatedPage>
  )
}

