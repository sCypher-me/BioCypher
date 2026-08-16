import { useEffect } from "react"

const BLOCKED_EVENTS = ["copy", "cut", "paste", "dragstart"] as const

/** Barreira de interface. Não substitui proteção de conteúdo no servidor. */
export function useContentProtection() {
  useEffect(() => {
    const prevent = (event: Event) => event.preventDefault()
    for (const eventName of BLOCKED_EVENTS) document.addEventListener(eventName, prevent, { capture: true })
    return () => {
      for (const eventName of BLOCKED_EVENTS) document.removeEventListener(eventName, prevent, { capture: true })
    }
  }, [])
}
