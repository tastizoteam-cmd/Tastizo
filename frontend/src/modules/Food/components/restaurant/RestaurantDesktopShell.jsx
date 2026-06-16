import { useEffect, useMemo, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  CirclePercent,
  Clock3,
  FileText,
  LayoutList,
  Megaphone,
  MessageCircleWarning,
  MapPin,
  Package,
  Settings,
  Store,
  Wallet,
} from "lucide-react"
import { restaurantAPI } from "@food/api"
import { getCachedSettings, loadBusinessSettings } from "@food/utils/businessSettings"

const DESKTOP_QUERY = "(min-width: 1024px)"

const menuItems = [
  { label: "Orders", icon: Package, to: "/restaurant", match: (pathname) => pathname === "/restaurant" },
  { label: "Menu", icon: FileText, to: "/restaurant/inventory", match: (pathname) => pathname.startsWith("/restaurant/inventory") || pathname.startsWith("/restaurant/hub-menu") },
  { label: "Menu categories", icon: Settings, to: "/restaurant/menu-categories", match: (pathname) => pathname.startsWith("/restaurant/menu-categories") },
  { label: "Order history", icon: LayoutList, to: "/restaurant/orders/all", match: (pathname) => pathname.startsWith("/restaurant/orders/all") },
  { label: "Offers", icon: CirclePercent, to: "/restaurant/offers", match: (pathname) => pathname.startsWith("/restaurant/offers") },
  { label: "Ads", icon: Megaphone, to: "/restaurant/ads", match: (pathname) => pathname.startsWith("/restaurant/ads") },
  { label: "Finance", icon: Wallet, to: "/restaurant/hub-finance", match: (pathname) => pathname.startsWith("/restaurant/hub-finance") || pathname.startsWith("/restaurant/withdrawal-history") },
  { label: "Bank details", icon: Wallet, to: "/restaurant/update-bank-details", match: (pathname) => pathname.startsWith("/restaurant/update-bank-details") },
  { label: "Outlet info", icon: Store, to: "/restaurant/outlet-info", match: (pathname) => pathname.startsWith("/restaurant/outlet-info") },
  { label: "Outlet timings", icon: Clock3, to: "/restaurant/outlet-timings", match: (pathname) => pathname.startsWith("/restaurant/outlet-timings") },
  { label: "Dining reservations", icon: CalendarDays, to: "/restaurant/reservations", match: (pathname) => pathname.startsWith("/restaurant/reservations") },
  { label: "Delivery settings", icon: Package, to: "/restaurant/delivery-settings", match: (pathname) => pathname.startsWith("/restaurant/delivery-settings") },
  { label: "Zone setup", icon: MapPin, to: "/restaurant/zone-setup", match: (pathname) => pathname.startsWith("/restaurant/zone-setup") },
  { label: "Customer complaints", icon: MessageCircleWarning, to: "/restaurant/customer-complaints", match: (pathname) => pathname.startsWith("/restaurant/customer-complaints") || pathname.startsWith("/restaurant/feedback?tab=complaints") },
  { label: "Reviews", icon: BookOpen, to: "/restaurant/reviews", match: (pathname) => pathname.startsWith("/restaurant/reviews") || pathname.startsWith("/restaurant/feedback") },
  { label: "Help centre", icon: CircleHelp, to: "/restaurant/help-centre/support", match: (pathname) => pathname.startsWith("/restaurant/help-centre/support") },
  { label: "Share your feedback", icon: FileText, to: "/restaurant/share-feedback", match: (pathname) => pathname.startsWith("/restaurant/share-feedback") },
  { label: "Learning centre", icon: CircleHelp, to: "/restaurant/explore", match: (pathname) => pathname.startsWith("/restaurant/explore") },
]

export function useRestaurantDesktopView() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(DESKTOP_QUERY).matches : false,
  )

  useEffect(() => {
    if (typeof window === "undefined") return undefined
    const mediaQuery = window.matchMedia(DESKTOP_QUERY)
    const update = (event) => setIsDesktop(event.matches)
    setIsDesktop(mediaQuery.matches)
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  return isDesktop
}

export default function RestaurantDesktopShell({
  title,
  subtitle,
  toolbar,
  children,
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const [companyName, setCompanyName] = useState("tastizo")
  const [restaurantName, setRestaurantName] = useState("Restaurant")
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    let isMounted = true

    const syncBrand = async () => {
      const cached = getCachedSettings()
      if (cached?.companyName && isMounted) {
        setCompanyName(String(cached.companyName).toLowerCase())
        return
      }
      const settings = await loadBusinessSettings()
      if (isMounted && settings?.companyName) {
        setCompanyName(String(settings.companyName).toLowerCase())
      }
    }

    const syncRestaurant = async () => {
      try {
        const response = await restaurantAPI.getCurrentRestaurant()
        const restaurant =
          response?.data?.data?.restaurant ||
          response?.data?.restaurant ||
          response?.data?.data ||
          null
        if (!isMounted || !restaurant) return
        setRestaurantName(restaurant.name || "Restaurant")
        if (typeof restaurant.isAcceptingOrders === "boolean") {
          setIsOnline(restaurant.isAcceptingOrders)
        }
      } catch {
        const savedStatus = typeof window !== "undefined" ? window.localStorage.getItem("restaurant_online_status") : null
        if (savedStatus && isMounted) {
          setIsOnline(savedStatus === "true")
        }
      }
    }

    syncBrand()
    syncRestaurant()

    return () => {
      isMounted = false
    }
  }, [])

  const profileInitial = useMemo(
    () => String(restaurantName || "R").trim().charAt(0).toUpperCase(),
    [restaurantName],
  )

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#1d2433]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
        <aside className="sticky top-0 hidden h-screen w-[220px] shrink-0 border-r border-[#e6e8ef] bg-white lg:flex lg:flex-col">
          <button
            type="button"
            onClick={() => navigate("/restaurant")}
            className="border-b border-[#eceef5] px-7 py-4 text-left text-[2.2rem] font-black italic leading-none tracking-tight text-[#16181d]"
          >
            {companyName}
          </button>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {menuItems.map((item) => {
              const active = item.match(location.pathname)
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[14px] font-medium transition ${
                    active
                      ? "bg-[#f0f2f7] text-[#1b2230]"
                      : "text-[#5f6777] hover:bg-[#f7f8fb] hover:text-[#202737]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[#e6e8ef] bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-8 py-4">
              <div>
                <h1 className="text-[24px] font-bold tracking-[-0.02em] text-[#202737]">{title}</h1>
                {subtitle ? <p className="mt-1 text-sm text-[#7a8396]">{subtitle}</p> : null}
              </div>

              <div className="flex items-center gap-3">
                {toolbar}
                <button
                  type="button"
                  onClick={() => navigate("/restaurant/notifications")}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-[#e7eaf1] text-[#5d6473] transition hover:bg-[#f6f7fb]"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/restaurant/outlet-info")}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-[#e7eaf1] text-[#5d6473] transition hover:bg-[#f6f7fb]"
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/restaurant/share-feedback")}
                  className="rounded-xl border border-[#e7eaf1] px-4 py-2 text-sm font-medium text-[#4e5667] transition hover:bg-[#f6f7fb]"
                >
                  Share feedback
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/restaurant/status")}
                  className="flex items-center gap-2 rounded-xl border border-[#e7eaf1] px-3 py-2 text-sm transition hover:bg-[#f6f7fb]"
                  aria-label="Restaurant online status"
                >
                  <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-[#23b26b]" : "bg-[#f97316]"}`} />
                  <span className={`${isOnline ? "text-[#239960]" : "text-[#d46a11]"}`}>{isOnline ? "Online" : "Offline"}</span>
                  <ChevronDown className="h-4 w-4 text-[#7e8798]" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/restaurant/outlet-info")}
                  className="flex items-center gap-3 rounded-xl border border-[#e7eaf1] px-3 py-2 transition hover:bg-[#f6f7fb]"
                  aria-label="Restaurant profile and outlet info"
                >
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#7165f0] text-xs font-semibold text-white">
                    {profileInitial}
                  </div>
                  <span className="max-w-[120px] truncate text-sm font-medium text-[#3b4353]">{restaurantName}</span>
                  <ChevronDown className="h-4 w-4 text-[#7e8798]" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
