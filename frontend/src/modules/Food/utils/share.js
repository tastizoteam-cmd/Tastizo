import { toast } from "sonner"

const fallbackCopyText = (text) => {
  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.style.position = "fixed"
  textArea.style.opacity = "0"
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    return document.execCommand("copy")
  } finally {
    document.body.removeChild(textArea)
  }
}

export const copyShareText = async (text, successMessage = "Share link copied") => {
  if (!text) {
    toast.error("Nothing to share")
    return false
  }

  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else if (!fallbackCopyText(text)) {
      throw new Error("Clipboard unavailable")
    }

    toast.success(successMessage)
    return true
  } catch {
    toast.error("Failed to copy share link")
    return false
  }
}

export const buildShareText = ({ text = "", url = "" } = {}) =>
  [String(text || "").trim(), String(url || "").trim()].filter(Boolean).join(" ")

export const shareContent = async (payload, options = {}) => {
  const successMessage = options.successMessage || "Share link copied"
  const sharedMessage = options.sharedMessage || "Shared successfully"
  const copyText =
    options.copyText ||
    buildShareText({
      text: payload?.text,
      url: payload?.url,
    })

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: payload?.title || "",
        text: payload?.text || "",
        url: payload?.url || "",
      })
      toast.success(sharedMessage)
      return true
    } catch (error) {
      if (error?.name === "AbortError") {
        return false
      }
    }
  }

  return copyShareText(copyText, successMessage)
}
