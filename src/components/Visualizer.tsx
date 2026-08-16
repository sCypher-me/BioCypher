import { useEffect, useRef, useState } from "react"
import { useMusic } from "./MusicProvider"
import { usePageActivity } from "../hooks/usePageActivity"
import { useVisualQuality } from "../hooks/useVisualQuality"

type VisualizerProps = {
  variant?: "standalone" | "embedded"
  className?: string
}

export default function Visualizer({ variant = "standalone", className = "" }: VisualizerProps) {
  const { analyserRef, playing } = useMusic()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const playingRef = useRef(playing)
  const [inView, setInView] = useState(true)
  const { visible, reducedMotion } = usePageActivity()
  const quality = useVisualQuality()
  playingRef.current = playing

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "80px" })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !visible || !inView) return
    const context = canvas.getContext("2d")
    if (!context) return

    const data = new Uint8Array(128)
    let raf = 0
    let width = 1
    let height = 44
    let gradient: CanvasGradient | null = null
    let last = 0
    const styles = getComputedStyle(document.documentElement)
    const cyan = styles.getPropertyValue("--color-cyan").trim()
    const violet = styles.getPropertyValue("--color-violet").trim()
    const azure = styles.getPropertyValue("--color-azure").trim()
    const baseBars = variant === "embedded" ? 22 : 36
    const bars = quality === "reduced" ? Math.round(baseBars * 0.6) : quality === "balanced" ? Math.round(baseBars * 0.82) : baseBars

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      const dprLimit = quality === "high" ? 2 : quality === "balanced" ? 1.5 : 1
      const dpr = Math.min(window.devicePixelRatio || 1, dprLimit)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      gradient = context.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, cyan)
      gradient.addColorStop(0.5, azure)
      gradient.addColorStop(1, violet)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    resize()

    const draw = (time: number) => {
      if (!reducedMotion) raf = requestAnimationFrame(draw)
      const playingFps = quality === "high" ? 30 : quality === "balanced" ? 24 : 12
      const idleFps = quality === "high" ? 15 : quality === "balanced" ? 10 : 1
      const frameInterval = playingRef.current ? 1000 / playingFps : 1000 / idleFps
      if (time - last < frameInterval) return
      last = time
      context.clearRect(0, 0, width, height)
      const analyser = analyserRef.current
      const live = playingRef.current && Boolean(analyser)
      if (live && analyser) analyser.getByteFrequencyData(data)
      const gap = 2
      const barWidth = Math.max(1, (width - gap * (bars - 1)) / bars)
      const middle = height / 2
      context.fillStyle = gradient ?? cyan
      context.shadowBlur = live ? 8 : 3
      context.shadowColor = cyan

      for (let index = 0; index < bars; index += 1) {
        const value = live
          ? data[Math.floor((index / bars) * data.length)] / 255
          : reducedMotion ? 0.14 : 0.16 + 0.07 * (0.5 + 0.5 * Math.sin(time / 700 + index * 0.4))
        const barHeight = Math.max(2, Math.max(value, live ? 0.07 : 0) * height * 0.46)
        const x = index * (barWidth + gap)
        context.fillRect(x, middle - barHeight, barWidth, barHeight)
        context.fillRect(x, middle, barWidth, barHeight)
      }
    }
    if (reducedMotion) draw(performance.now())
    else raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
    }
  }, [analyserRef, inView, quality, reducedMotion, variant, visible])

  const sizeClass = variant === "embedded" ? "h-full w-full" : "h-[44px] w-full"
  return <canvas ref={canvasRef} className={`${sizeClass} ${className}`} aria-hidden />
}
