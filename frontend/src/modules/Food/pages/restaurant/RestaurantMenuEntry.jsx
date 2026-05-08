import HubMenu from "./HubMenu"
import { DesktopMenuView } from "@food/components/restaurant/RestaurantDesktopViews"
import { useRestaurantDesktopView } from "@food/components/restaurant/RestaurantDesktopShell"
import { useRestaurantDesktopFrame } from "@food/components/restaurant/RestaurantDesktopLayout"

export default function RestaurantMenuEntry() {
  const isDesktop = useRestaurantDesktopView()
  const desktopFrame = useRestaurantDesktopFrame()
  return isDesktop ? <DesktopMenuView embedded={Boolean(desktopFrame?.embedded)} /> : <HubMenu />
}
