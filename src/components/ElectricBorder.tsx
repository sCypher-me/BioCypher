import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { usePageActivity } from "../hooks/usePageActivity"
import { useVisualQuality } from "../hooks/useVisualQuality"

/* ============================================================
   ElectricBorder
   Borda elétrica estilo ReactBits: raios/zigue-zague irregulares
   (jagged) ao redor de TODO o perímetro + glow.

   CORREÇÃO-CHAVE: o <svg> é renderizado via PORTAL direto no
   document.body (fora da árvore do componente). Assim ele NÃO fica
   dentro do motion.div (Framer Motion) que cria uma camada
   GPU-composited — onde o Chrome "congela" o repaint de um path
   cujo `d` muda (seja por CSS ou rAF). Fora da subtree composta,
   o tremor (rAF setando o atributo `d`) re-rasteriza normalmente.

   - tremor: requestAnimationFrame setando o atributo `d` (força repaint)
   - feixe correndo: CSS @keyframes de stroke-dashoffset (compositor)
   - glow: feGaussianBlur + drop-shadow

   O portal é position:fixed e acompanha o retângulo do wrapper via
   ResizeObserver + scroll/resize da janela.
   ============================================================ */

type ElectricBorderProps = {
  children: ReactNode
  color?: string
  /** velocidade da corrida do raio (maior = mais rápido) */
  speed?: number
  /** intensidade do tremor elétrico (0 = reto, 1 = muito energizado) */
  intensity?: number
  thickness?: number
  borderRadius?: number
  className?: string
  style?: CSSProperties
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildJaggedPath(
  w: number,
  h: number,
  r: number,
  pad: number,
  amp: number,
  step: number,
  seed: number,
): string {
  const x0 = pad
  const y0 = pad
  const x1 = w - pad
  const y1 = h - pad
  const rr = Math.max(0, Math.min(r, (w - 2 * pad) / 2, (h - 2 * pad) / 2))
  const rand = mulberry32(seed)
  const pts: [number, number][] = []
  const pushN = (x: number, y: number, nx: number, ny: number, d: number) => {
    pts.push([x + nx * d, y + ny * d])
  }
  const jag = () => (rand() < 0.5 ? 1 : -1) * (amp * (0.4 + rand() * 0.6))
  const top = pad + rr
  const bottom = h - pad - rr
  const leftX = pad + rr
  const rightX = w - pad - rr

  pushN(leftX, y0, 0, -1, jag())
  for (let x = leftX + step; x < rightX; x += step) pushN(x, y0, 0, -1, jag())
  pushN(rightX, y0, 0, -1, jag())
  pushN(x1, top, 1, 0, jag())
  for (let y = top + step; y < bottom; y += step) pushN(x1, y, 1, 0, jag())
  pushN(x1, bottom, 1, 0, jag())
  pushN(rightX, y1, 0, 1, jag())
  for (let x = rightX - step; x > leftX; x -= step) pushN(x, y1, 0, 1, jag())
  pushN(leftX, y1, 0, 1, jag())
  pushN(x0, bottom, -1, 0, jag())
  for (let y = bottom - step; y > top; y -= step) pushN(x0, y, -1, 0, jag())
  pushN(x0, top, -1, 0, jag())
  pushN(leftX, y0, 0, -1, jag())

  return (
    "M " +
    pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") +
    " Z"
  )
}

function generateFrames(
  w: number,
  h: number,
  r: number,
  pad: number,
  amp: number,
  step: number,
  count: number,
): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    out.push(buildJaggedPath(w, h, r, pad, amp, step, 1000 + i * 97))
  }
  return out
}

export default function ElectricBorder({
  children,
  color = "var(--color-cyan)",
  speed = 1,
  intensity = 0.6,
  thickness = 2.4,
  borderRadius = 16,
  className = "",
  style,
}: ElectricBorderProps) {
  const id = useId().replace(/:/g, "")
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const mainPathRef = useRef<SVGPathElement | null>(null)
  const sparkPathRef = useRef<SVGPathElement | null>(null)
  const [size, setSize] = useState({ w: 360, h: 480 })
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [frames, setFrames] = useState<string[]>([])
  const [sparkFrames, setSparkFrames] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const { visible, reducedMotion } = usePageActivity()
  const quality = useVisualQuality()
  useEffect(() => setMounted(true), [])

  // mede tamanho + posição do wrapper (para o portal fixed)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    let positionRaf = 0
    const position = () => {
      const r = el.getBoundingClientRect()
      if (overlayRef.current) {
        overlayRef.current.style.transform = `translate3d(${r.left}px, ${r.top}px, 0)`
        overlayRef.current.style.visibility = r.bottom < 0 || r.top > window.innerHeight ? "hidden" : "visible"
      }
    }
    const measure = () => {
      const r = el.getBoundingClientRect()
      setSize((current) => current.w === r.width && current.h === r.height ? current : { w: r.width, h: r.height })
      setRect({ x: r.left, y: r.top, w: r.width, h: r.height })
      position()
    }
    const schedulePosition = () => {
      cancelAnimationFrame(positionRaf)
      positionRaf = requestAnimationFrame(position)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener("scroll", schedulePosition, true)
    window.addEventListener("resize", measure)
    return () => {
      cancelAnimationFrame(positionRaf)
      ro.disconnect()
      window.removeEventListener("scroll", schedulePosition, true)
      window.removeEventListener("resize", measure)
    }
  }, [])

  // gera variações de path
  useEffect(() => {
    const { w, h } = size
    if (w < 10 || h < 10) return
    const pad = thickness + 2
    const amp = 2 + intensity * 7
    const frameCount = quality === "high" ? 10 : quality === "balanced" ? 7 : 1
    setFrames(generateFrames(w, h, borderRadius, pad, amp, quality === "high" ? 11 : 15, frameCount))
    setSparkFrames(generateFrames(w, h, borderRadius, pad, amp * 0.5, quality === "high" ? 18 : 22, frameCount))
  }, [size, intensity, borderRadius, thickness, quality])

  // TREMOR via rAF (fora da subtree composta, via portal) -> repaint ok
  useEffect(() => {
    if (frames.length === 0 || sparkFrames.length === 0 || reducedMotion || !visible) return
    const main = mainPathRef.current
    const spark = sparkPathRef.current
    if (!main || !spark) return
    const ceiling = quality === "high" ? 24 : quality === "balanced" ? 16 : 0
    if (ceiling === 0) return
    const fps = Math.max(8, Math.min(ceiling, Math.round(10 * Math.max(0.2, speed))))
    const interval = 1000 / fps
    let raf = 0
    let last = 0
    let idx = 0
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      if (t - last < interval) return
      last = t
      main.setAttribute("d", frames[idx % frames.length])
      spark.setAttribute("d", sparkFrames[idx % sparkFrames.length])
      idx++
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [frames, quality, reducedMotion, sparkFrames, speed, visible])

  const beamDur = Math.max(1.2, 3.2 / Math.max(0.2, speed))
  const borderEl =
    rect && frames.length > 0 ? (
      <div
        ref={overlayRef}
        className="pointer-events-none fixed z-[60]"
        style={{
          left: 0,
          top: 0,
          width: rect.w,
          height: rect.h,
          borderRadius,
          transform: `translate3d(${rect.x}px, ${rect.y}px, 0)`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius,
            border: `${thickness * 0.6}px solid color-mix(in oklab, ${color} 16%, transparent)`,
            boxShadow: `0 0 16px -4px color-mix(in oklab, ${color} 34%, transparent)`,
          }}
        />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ borderRadius, overflow: "visible" }}
          aria-hidden
          preserveAspectRatio="none"
        >
          <defs>
            <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={`${id}-glow2`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            ref={mainPathRef}
            d={frames[0]}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinejoin="miter"
            strokeMiterlimit={2}
            strokeLinecap="round"
            opacity={0.95}
            pathLength={100}
            filter={`url(#${id}-glow)`}
            style={{ animation: reducedMotion || !visible ? "none" : `electric-border-beam ${beamDur}s linear infinite` }}
          />
          <path
            ref={sparkPathRef}
            d={sparkFrames[0]}
            fill="none"
            stroke="var(--color-silver)"
            strokeWidth={thickness * 0.7}
            strokeLinejoin="miter"
            strokeMiterlimit={2}
            strokeLinecap="round"
            opacity={0.85}
            pathLength={100}
            filter={`url(#${id}-glow2)`}
            style={{ animation: reducedMotion || !visible ? "none" : `electric-border-spark ${(beamDur * 0.6).toFixed(2)}s linear infinite` }}
          />
        </svg>
      </div>
    ) : null

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${className}`}
      style={{ borderRadius, ...style }}
    >
      {mounted && typeof document !== "undefined"
        ? createPortal(borderEl, document.body)
        : null}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}
