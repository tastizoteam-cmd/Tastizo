import Feedback from "./Feedback"
import { DesktopReviewsView } from "@food/components/restaurant/RestaurantDesktopViews"
import { useRestaurantDesktopView } from "@food/components/restaurant/RestaurantDesktopShell"
import { useRestaurantDesktopFrame } from "@food/components/restaurant/RestaurantDesktopLayout"

export default function RestaurantReviewsEntry() {
  const isDesktop = useRestaurantDesktopView()
  const desktopFrame = useRestaurantDesktopFrame()
  return isDesktop ? <DesktopReviewsView embedded={Boolean(desktopFrame?.embedded)} /> : <Feedback />
}
