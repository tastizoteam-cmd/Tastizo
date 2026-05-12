
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@food/components/ui/dialog"
import { Button } from "@food/components/ui/button"

export default function ReplaceCartDialog({
  open,
  onOpenChange,
  currentRestaurantName,
  nextRestaurantName,
  onConfirm,
  onCancel,
}) {
  const currentRestaurant = currentRestaurantName || "another restaurant"
  const nextRestaurant = nextRestaurantName || "this restaurant"

  const handleOpenChange = (nextOpen) => {
    onOpenChange?.(nextOpen)
    if (!nextOpen) {
      onCancel?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[320px] rounded-2xl border-0 bg-white p-0 shadow-2xl sm:max-w-sm">
        <DialogHeader className="space-y-0 px-5 pb-2 pt-5 text-left">
          <DialogTitle className="text-xl font-bold leading-none tracking-tight text-neutral-900">
            Replace cart item?
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-5">
          <p className="text-sm leading-relaxed text-neutral-600">
            Your cart contains dishes from {currentRestaurant}. Do you want to discard the selection and add dishes from {nextRestaurant}?
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="h-11 rounded-xl bg-[#EAF5F0] text-base font-bold text-[#2A9C64] hover:bg-[#D5EBDD] hover:text-[#2A9C64]"
            >
              No
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="h-11 rounded-xl bg-[#2A9C64] text-base font-bold text-white hover:bg-[#238253]"
            >
              Replace
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
