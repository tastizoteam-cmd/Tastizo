import OrdersMain from "./OrdersMain"
import { DesktopOrdersView } from "@food/components/restaurant/RestaurantDesktopViews"
import { useRestaurantDesktopView } from "@food/components/restaurant/RestaurantDesktopShell"
import { useRestaurantDesktopFrame } from "@food/components/restaurant/RestaurantDesktopLayout"

export default function RestaurantOrdersEntry() {
  const isDesktop = useRestaurantDesktopView()
  const desktopFrame = useRestaurantDesktopFrame()
  return isDesktop ? <DesktopOrdersView embedded={Boolean(desktopFrame?.embedded)} /> : <OrdersMain />
}
