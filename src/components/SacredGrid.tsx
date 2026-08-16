import { motion } from "motion/react"
import { useReducedMotionPreference } from "../hooks/useReducedMotionPreference"

/**
 * Fundo animado: sacred-geometry em linhas finas (estilo blueprint),
 * com rotação lenta + scanline radial. Tudo em SVG p/ escalar sem borrar.
 */
export default function SacredGrid({ intensity = "reading" }: { intensity?: "ritual" | "reading" }) {
  const reducedMotion = useReducedMotionPreference()
  return (
    <div className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-opacity duration-700 ${intensity === "ritual" ? "opacity-100" : "opacity-70"}`}>
      {/* base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -10%, var(--color-void-3) 0%, var(--color-void) 60%, var(--color-ink) 100%)",
        }}
      />

      {/* grade de coordenadas (svg) */}
      <motion.svg
        className="absolute left-1/2 top-1/2 h-[160vmax] w-[160vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.18]"
        viewBox="0 0 1000 1000"
        fill="none"
        animate={{ rotate: reducedMotion ? 0 : 360 }}
        transition={{ duration: 240, ease: "linear", repeat: reducedMotion ? 0 : Infinity }}
      >
        <defs>
          <radialGradient id="gridFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-azure)" stopOpacity="0.0" />
            <stop offset="70%" stopColor="var(--color-azure)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-violet)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* círculos concêntricos */}
        {[120, 240, 360, 480, 600].map((r) => (
          <circle
            key={r}
            cx="500"
            cy="500"
            r={r}
            stroke="url(#gridFade)"
            strokeWidth="0.6"
          />
        ))}
        {/* raios */}
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i * Math.PI) / 18
          return (
            <line
              key={i}
              x1="500"
              y1="500"
              x2={500 + Math.cos(a) * 600}
              y2={500 + Math.sin(a) * 600}
              stroke="url(#gridFade)"
              strokeWidth="0.4"
            />
          )
        })}
        {/* triângulo voltado p/ baixo (override sagrado) */}
        <polygon
          points="500,120 880,760 120,760"
          stroke="url(#gridFade)"
          strokeWidth="0.7"
        />
        <polygon
          points="500,880 120,240 880,240"
          stroke="url(#gridFade)"
          strokeWidth="0.7"
        />
      </motion.svg>

      {/* glow central suave, pulsante */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        animate={reducedMotion ? { opacity: 0.45, scale: 1 } : { opacity: [0.35, 0.55, 0.35], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 8, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle, color-mix(in oklab, var(--color-violet) calc(18% + var(--audio-energy, 0) * 12%), transparent) 0%, transparent 70%)",
        }}
      />

      {/* vinheta */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, transparent 55%, var(--color-ink) 100%)",
        }}
      />
    </div>
  )
}
