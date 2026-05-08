import AllOrdersPage from "./AllOrdersPage"
import { DesktopOrderHistoryView } from "@food/components/restaurant/RestaurantDesktopViews"
import { useRestaurantDesktopView } from "@food/components/restaurant/RestaurantDesktopShell"
import { useRestaurantDesktopFrame } from "@food/components/restaurant/RestaurantDesktopLayout"

export default function RestaurantOrderHistoryEntry() {
  const isDesktop = useRestaurantDesktopView()
  const desktopFrame = useRestaurantDesktopFrame()
  return isDesktop ? <DesktopOrderHistoryView embedded={Boolean(desktopFrame?.embedded)} /> : <AllOrdersPage />
}
