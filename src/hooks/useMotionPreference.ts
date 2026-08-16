import { useCallback, useSyncExternalStore } from "react"

export type MotionPreference = "system" | "enabled" | "paused"

const STORAGE_KEY = "cypher:motion"
const QUERY = "(prefers-reduced-motion: reduce)"
const listeners = new Set<() => void>()

function readPreference(): MotionPreference {
  if (typeof window === "undefined") return "system"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === "enabled" || stored === "paused" ? stored : "system"
}

let preference: MotionPreference = readPreference()

function syncDocumentState() {
  if (typeof document === "undefined") return
  const systemReduced = window.matchMedia(QUERY).matches
  const reduced = preference === "paused" || (preference === "system" && systemReduced)
  document.documentElement.dataset.motion = reduced ? "paused" : "enabled"
}

export function subscribeMotionPreference(listener: () => void) {
  listeners.add(listener)
  if (typeof window === "undefined") return () => listeners.delete(listener)
  const media = window.matchMedia(QUERY)
  const notify = () => {
    syncDocumentState()
    listeners.forEach((entry) => entry())
  }
  media.addEventListener("change", notify)
  return () => {
    listeners.delete(listener)
    media.removeEventListener("change", notify)
  }
}

function snapshot() {
  const systemReduced = typeof window !== "undefined" && window.matchMedia(QUERY).matches
  return `${preference}:${systemReduced ? "reduce" : "full"}`
}

function setPreference(next: MotionPreference) {
  preference = next
  if (next === "system") window.localStorage.removeItem(STORAGE_KEY)
  else window.localStorage.setItem(STORAGE_KEY, next)
  syncDocumentState()
  listeners.forEach((listener) => listener())
}

export function useMotionPreference() {
  useSyncExternalStore(subscribeMotionPreference, snapshot, () => "system:reduce")
  const reducedMotion = isMotionReduced()
  const toggleMotion = useCallback(() => setPreference(reducedMotion ? "enabled" : "paused"), [reducedMotion])

  return {
    preference,
    reducedMotion,
    paused: reducedMotion,
    toggleMotion,
  }
}

export function isMotionReduced() {
  const systemReduced = typeof window !== "undefined" && window.matchMedia(QUERY).matches
  return preference === "paused" || (preference === "system" && systemReduced)
}

syncDocumentState()
