import { useEffect, useState } from "react"
import { useReducedMotionPreference } from "./useReducedMotionPreference"

export function usePageActivity() {
  const reducedMotion = useReducedMotionPreference()
  const [visible, setVisible] = useState(() =>
    typeof document === "undefined" || document.visibilityState === "visible",
  )

  useEffect(() => {
    const update = () => setVisible(document.visibilityState === "visible")
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])

  return { visible, reducedMotion, animate: visible && !reducedMotion }
}
