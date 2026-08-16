import { useMotionPreference } from "./useMotionPreference"

export function useReducedMotionPreference() {
  return useMotionPreference().reducedMotion
}
