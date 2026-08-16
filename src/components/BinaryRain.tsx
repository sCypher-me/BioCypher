import { useEffect, useRef } from "react"
import { usePageActivity } from "../hooks/usePageActivity"
import { useVisualQuality } from "../hooks/useVisualQuality"

export default function BinaryRain() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const { visible, reducedMotion } = usePageActivity()
  const quality = useVisualQuality()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !visible) return
    const context = canvas.getContext("2d")
    if (!context) return
    const rootStyles = getComputedStyle(document.documentElement)
    const colors = {
      void: rootStyles.getPropertyValue("--color-void").trim(),
      silver: rootStyles.getPropertyValue("--color-silver").trim(),
      azure: rootStyles.getPropertyValue("--color-azure").trim(),
      ash: rootStyles.getPropertyValue("--color-ash").trim(),
    }
    const fontSize = quality === "reduced" ? 21 : quality === "balanced" ? 18 : 15
    const targetFps = quality === "high" ? 24 : quality === "balanced" ? 18 : 12
    let width = 0
    let height = 0
    let columns = 0
    let drops: number[] = []
    let speeds: number[] = []
    let raf = 0
    let last = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width || window.innerWidth
      height = rect.height || window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, quality === "high" ? 1.5 : 1)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      columns = Math.ceil(width / fontSize)
      drops = Array.from({ length: columns }, () => Math.random() * -height)
      speeds = Array.from({ length: columns }, () => 0.4 + Math.random() * 0.9)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    const glyph = () => Math.random() > 0.5 ? "1" : "0"
    const drawColumn = (index: number, staticRow?: number) => {
      const x = index * fontSize
      const y = staticRow === undefined ? drops[index] : (staticRow + 1) * fontSize * 3
      context.globalAlpha = staticRow === undefined ? 0.38 : 0.14
      context.fillStyle = staticRow === undefined ? colors.silver : colors.ash
      context.fillText(glyph(), x, y)
      if (staticRow !== undefined) return
      context.globalAlpha = 0.2
      context.fillStyle = colors.azure
      context.fillText(glyph(), x, y - fontSize)
      context.globalAlpha = 0.1
      context.fillStyle = colors.ash
      context.fillText(glyph(), x, y - fontSize * 2)
      drops[index] += fontSize * speeds[index] * 0.45
      if (drops[index] > height && Math.random() > 0.97) drops[index] = Math.random() * -120
    }

    const drawStatic = () => {
      context.clearRect(0, 0, width, height)
      context.font = `${fontSize}px "TerminalVision", ui-monospace, monospace`
      for (let index = 0; index < columns; index += 1) for (let row = 0; row < 6; row += 1) drawColumn(index, row)
      context.globalAlpha = 1
    }

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw)
      if (time - last < 1000 / targetFps) return
      last = time
      context.globalAlpha = 0.14
      context.fillStyle = colors.void
      context.fillRect(0, 0, width, height)
      context.font = `${fontSize}px "TerminalVision", ui-monospace, monospace`
      context.textBaseline = "top"
      for (let index = 0; index < columns; index += 1) drawColumn(index)
      context.globalAlpha = 1
    }

    if (reducedMotion) drawStatic()
    else raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
    }
  }, [quality, reducedMotion, visible])

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-20" />
}
