import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import RestaurantDesktopShell, { useRestaurantDesktopView } from "./RestaurantDesktopShell"

const RestaurantDesktopFrameContext = createContext(null)

const formatSegmentLabel = (segment) =>
  String(segment || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())

const getDefaultDesktopHeader = (pathname) => {
  if (pathname === "/restaurant") {
    return {
      title: "Orders",
      subtitle: "Desktop preparing queue with compact live-order cards.",
      toolbar: null,
    }
  }

  const knownHeaders = [
    { match: (value) => value.startsWith("/restaurant/hub-menu"), title: "Menu" },
    { match: (value) => value.startsWith("/restaurant/orders/all"), title: "Order History" },
    { match: (value) => value.startsWith("/restaurant/customer-complaints"), title: "Customer Complaints" },
    { match: (value) => value.startsWith("/restaurant/reviews"), title: "Customer Reviews" },
    { match: (value) => value.startsWith("/restaurant/offers"), title: "Offers" },
    { match: (value) => value.startsWith("/restaurant/menu-categories"), title: "Menu Categories" },
    { match: (value) => value.startsWith("/restaurant/hub-finance"), title: "Finance" },
    { match: (value) => value.startsWith("/restaurant/update-bank-details"), title: "Bank Details" },
    { match: (value) => value.startsWith("/restaurant/outlet-info"), title: "Outlet Info" },
    { match: (value) => value.startsWith("/restaurant/outlet-timings"), title: "Outlet Timings" },
    { match: (value) => value.startsWith("/restaurant/reservations"), title: "Dining Reservations" },
    { match: (value) => value.startsWith("/restaurant/delivery-settings"), title: "Delivery Settings" },
    { match: (value) => value.startsWith("/restaurant/zone-setup"), title: "Zone Setup" },
    { match: (value) => value.startsWith("/restaurant/notifications"), title: "Notifications" },
    { match: (value) => value.startsWith("/restaurant/share-feedback"), title: "Share Feedback" },
    { match: (value) => value.startsWith("/restaurant/status"), title: "Restaurant Status" },
    { match: (value) => value.startsWith("/restaurant/help-centre/support"), title: "Help Centre" },
    { match: (value) => value.startsWith("/restaurant/explore"), title: "Explore" },
    { match: (value) => value.startsWith("/restaurant/inventory"), title: "Menu" },
  ]

  const matched = knownHeaders.find((item) => item.match(pathname))
  if (matched) {
    return {
      title: matched.title,
      subtitle: "",
      toolbar: null,
    }
  }

  const lastSegment = pathname.split("/").filter(Boolean).pop()
  return {
    title: formatSegmentLabel(lastSegment || "Restaurant"),
    subtitle: "",
    toolbar: null,
  }
}

export function useRestaurantDesktopFrame() {
  return useContext(RestaurantDesktopFrameContext)
}

export default function RestaurantDesktopLayout() {
  const isDesktop = useRestaurantDesktopView()
  const location = useLocation()
  const defaultHeader = useMemo(() => getDefaultDesktopHeader(location.pathname), [location.pathname])
  const [header, setHeader] = useState(defaultHeader)

  useEffect(() => {
    setHeader(defaultHeader)
  }, [defaultHeader])

  const frameValue = useMemo(
    () => ({
      embedded: true,
      setHeader,
    }),
    [],
  )

  if (!isDesktop) {
    return <Outlet />
  }

  return (
    <RestaurantDesktopFrameContext.Provider value={frameValue}>
      <RestaurantDesktopShell title={header.title} subtitle={header.subtitle} toolbar={header.toolbar}>
        <Outlet />
      </RestaurantDesktopShell>
    </RestaurantDesktopFrameContext.Provider>
  )
}
