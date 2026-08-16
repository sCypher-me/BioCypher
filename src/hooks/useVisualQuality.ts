import { useSyncExternalStore } from "react"
import { useReducedMotionPreference } from "./useReducedMotionPreference"

export type VisualQuality = "high" | "balanced" | "reduced"

type NavigatorCapabilities = Navigator & {
  deviceMemory?: number
  connection?: EventTarget & { saveData?: boolean; effectiveType?: string }
}

function subscribeCapabilities(notify: () => void) {
  if (typeof window === "undefined") return () => undefined
  const connection = (navigator as NavigatorCapabilities).connection
  window.addEventListener("resize", notify, { passive: true })
  connection?.addEventListener("change", notify)
  return () => {
    window.removeEventListener("resize", notify)
    connection?.removeEventListener("change", notify)
  }
}

function capabilitySnapshot() {
  if (typeof window === "undefined") return "server"
  const capabilities = navigator as NavigatorCapabilities
  return [
    window.innerWidth >= 1280 ? "desktop" : "compact",
    Math.min(3, Math.round((window.devicePixelRatio || 1) * 2) / 2),
    capabilities.deviceMemory ?? 4,
    capabilities.connection?.saveData === true ? "save" : "full",
    capabilities.connection?.effectiveType ?? "unknown",
  ].join(":")
}

export function useVisualQuality(): VisualQuality {
  const reducedMotion = useReducedMotionPreference()
  useSyncExternalStore(subscribeCapabilities, capabilitySnapshot, () => "server")
  if (reducedMotion || typeof window === "undefined") return "reduced"
  const capabilities = navigator as NavigatorCapabilities
  const memory = capabilities.deviceMemory ?? 4
  const saveData = capabilities.connection?.saveData === true
  const slowNetwork = capabilities.connection?.effectiveType === "2g" || capabilities.connection?.effectiveType === "slow-2g"
  if (saveData || slowNetwork || memory <= 2) return "reduced"
  if (memory >= 8 && window.innerWidth >= 1280 && window.devicePixelRatio <= 2) return "high"
  return "balanced"
}
