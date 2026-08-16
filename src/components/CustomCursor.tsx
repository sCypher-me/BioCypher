import { useEffect, useRef } from "react"

const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, [role='button'], [role='tab'], [data-cursor-interactive]"

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    window.sessionStorage.removeItem("cypher:cursor-preview")
    const cursor = cursorRef.current
    const media = window.matchMedia("(pointer: fine) and (min-width: 768px)")
    if (!cursor || !media.matches) return

    const root = document.documentElement
    let frame = 0
    let x = -40
    let y = -40
    root.dataset.customCursor = "ready"

    const render = () => {
      frame = 0
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    }
    const move = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      cursor.dataset.visible = "true"
      cursor.dataset.interactive = String(Boolean((event.target as Element | null)?.closest?.(INTERACTIVE_SELECTOR)))
      if (!frame) frame = requestAnimationFrame(render)
    }
    const press = () => { cursor.dataset.pressed = "true" }
    const release = () => { cursor.dataset.pressed = "false" }
    const leave = (event: MouseEvent) => {
      if (!event.relatedTarget) cursor.dataset.visible = "false"
    }

    window.addEventListener("pointermove", move, { passive: true })
    window.addEventListener("pointerdown", press, { passive: true })
    window.addEventListener("pointerup", release, { passive: true })
    window.addEventListener("mouseout", leave)
    return () => {
      cancelAnimationFrame(frame)
      delete root.dataset.customCursor
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerdown", press)
      window.removeEventListener("pointerup", release)
      window.removeEventListener("mouseout", leave)
    }
  }, [])

  return <div ref={cursorRef} className="cypher-cursor" aria-hidden><span className="cypher-cursor__reticle"><i /><i /><i /><i /><b /></span></div>
}
