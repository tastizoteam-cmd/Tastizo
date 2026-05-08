import { Navigate } from "react-router-dom"
import { DesktopComplaintsView } from "@food/components/restaurant/RestaurantDesktopViews"
import { useRestaurantDesktopView } from "@food/components/restaurant/RestaurantDesktopShell"
import { useRestaurantDesktopFrame } from "@food/components/restaurant/RestaurantDesktopLayout"

export default function RestaurantComplaintsEntry() {
  const isDesktop = useRestaurantDesktopView()
  const desktopFrame = useRestaurantDesktopFrame()

  if (isDesktop) {
    return <DesktopComplaintsView embedded={Boolean(desktopFrame?.embedded)} />
  }

  return <Navigate to="/restaurant/feedback?tab=complaints" replace />
}
