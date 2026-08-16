import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { profile } from "../data/profile"
import BinaryRain from "./BinaryRain"
import { useReducedMotionPreference } from "../hooks/useReducedMotionPreference"

/**
 * Tela de loading estilo HUD/occult, fiel ao mock:
 *  - CYPHER no topo
 *  - emblema central girando
 *  - barra de progresso ciano + percentual
 *  - status "> SINCRONIZANDO CIFRAS..."
 *  - nome JULIO CESAR
 *  - códigos 10110 nos cantos + colchetes de HUD
 * Ao 100% dispara onComplete para o App centralizar a logo.
 */
export default function LoadingScreen({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [pct, setPct] = useState(0)
  const [canSkip, setCanSkip] = useState(false)
  const { title, status, name, hudCode, durationMs } = profile.loading
  const reducedMotion = useReducedMotionPreference()
  const logo = profile.media.logo

  useEffect(() => {
    const timer = window.setTimeout(() => setCanSkip(true), 800)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (durationMs <= 0 || reducedMotion) {
      setPct(100)
      const id = window.setTimeout(onComplete, 120)
      return () => window.clearTimeout(id)
    }

    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      // ease-out com leve hesitação (decriptação)
      const eased = 1 - Math.pow(1 - t, 2.2)
      setPct(Math.round(eased * 100))
      if (t >= 1) {
        onComplete()
      } else {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [durationMs, onComplete, reducedMotion])

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-void"
      initial={{ opacity: 1 }}
      aria-label="Carregando CYPHER"
    >
      {/* chuva binária no fundo */}

      {/* grade de fundo */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* vinheta */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(85% 75% at 50% 45%, color-mix(in oklab, var(--color-void-3) 35%, transparent) 0%, var(--color-void) 70%, var(--color-ink) 100%)",
        }}
      />

      {/* chuva binária SOBRE o fundo, atrás do conteúdo */}
      <BinaryRain />

      {/* colchetes de HUD nos cantos */}
      <HudCorners />

      {/* códigos nos cantos superiores */}
      <div className="pointer-events-none absolute left-6 top-6 font-mono text-xs tracking-widest text-ash/50">
        {hudCode}
      </div>
      <div className="pointer-events-none absolute right-6 top-6 font-mono text-xs tracking-widest text-ash/50">
        {hudCode}
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
        {/* título CYPHER */}
        <motion.h1
          className="font-display text-4xl font-bold tracking-[0.35em] text-sigil-glow sm:text-5xl"
          initial={{ opacity: 0, letterSpacing: "0.6em", y: -8 }}
          animate={{ opacity: 1, letterSpacing: "0.35em", y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {title}
        </motion.h1>

        {/* emblema central com anéis giratórios */}
        <div className="relative my-9 grid place-items-center">
          <RotatingSeal />
          <motion.picture
            className="relative"
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <source type="image/avif" srcSet={logo.avifSrcSet} sizes="160px" />
            <source type="image/webp" srcSet={logo.webpSrcSet} sizes="160px" />
            <img src={logo.fallback} alt={title} width={logo.width} height={logo.height} decoding="async" className="h-32 w-auto drop-shadow-[0_0_28px_color-mix(in_oklab,var(--color-azure)_50%,transparent)] sm:h-40" />
          </motion.picture>
        </div>

        {/* barra de progresso + percentual */}
        <div className="flex w-full items-center gap-3" role="progressbar" aria-label={status.replace(/^>\s*/, "")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="relative h-2 flex-1 overflow-hidden rounded-full border border-line/70 bg-panel/60">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-azure), var(--color-violet))",
                boxShadow: "0 0 14px color-mix(in oklab, var(--color-azure) 70%, transparent)",
              }}
              animate={{ width: `${pct}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
            {/* scanline que percorre a barra */}
            <motion.div
              className="absolute inset-y-0 w-8 bg-silver/30 blur-md"
              animate={{ x: ["-10%", "110%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <span className="w-12 text-right font-mono text-sm text-azure">
            {pct}%
          </span>
        </div>

        {/* status + nome */}
        <motion.p
          className="mt-5 font-mono text-xs tracking-wide text-sigil sm:text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Typewriter text={status} />
        </motion.p>

        <p className="mt-6 font-mono text-[11px] tracking-[0.5em] text-ash/60">
          {name}
        </p>
      </div>

      <AnimatePresence>
        {canSkip && (
          <motion.button
            type="button"
            onClick={onSkip}
            aria-label={profile.ui.skipRitualAriaLabel}
            className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-20 min-h-11 rounded-lg border border-cyan/30 bg-void/70 px-4 font-mono text-[11px] tracking-[0.14em] text-silver outline-none backdrop-blur-md transition-colors hover:border-cyan hover:text-cyan focus-visible:ring-2 focus-visible:ring-cyan"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {profile.ui.skipRitual}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ---------- subcomponentes ---------- */

function RotatingSeal() {
  const reducedMotion = useReducedMotionPreference()
  return (
    <>
      <motion.div
        className="absolute h-44 w-44 rounded-full border border-azure/40 sm:h-52 sm:w-52"
        style={{ borderStyle: "dashed" }}
        animate={{ rotate: reducedMotion ? 0 : 360 }}
        transition={{ duration: 22, ease: "linear", repeat: reducedMotion ? 0 : Infinity }}
      />
      <motion.div
        className="absolute h-40 w-40 rounded-full border border-violet/30 sm:h-48 sm:w-48"
        animate={{ rotate: reducedMotion ? 0 : -360 }}
        transition={{ duration: 32, ease: "linear", repeat: reducedMotion ? 0 : Infinity }}
      />
      <motion.div
        className="absolute h-36 w-36 rounded-full border border-line/60 sm:h-44 sm:w-44"
        animate={{ scale: reducedMotion ? 1 : [1, 1.06, 1], opacity: reducedMotion ? 0.7 : [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
      />
    </>
  )
}

function HudCorners() {
  const base =
    "pointer-events-none absolute h-8 w-8 border-sigil/40"
  return (
    <>
      <div className={`${base} left-4 top-4 border-l-2 border-t-2`} />
      <div className={`${base} right-4 top-4 border-r-2 border-t-2`} />
      <div className={`${base} bottom-4 left-4 border-b-2 border-l-2`} />
      <div className={`${base} bottom-4 right-4 border-b-2 border-r-2`} />
    </>
  )
}

function Typewriter({ text }: { text: string }) {
  const [n, setN] = useState(0)
  const reduce = useReducedMotionPreference()
  useEffect(() => {
    if (reduce) {
      setN(text.length)
      return
    }
    let i = 0
    const t = setInterval(() => {
      i++
      setN(i)
      if (i >= text.length) clearInterval(t)
    }, 45)
    return () => clearInterval(t)
  }, [text, reduce])
  return (
    <span>
      {text.slice(0, n)}
      <span className="ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[2px] animate-pulse bg-azure" />
    </span>
  )
}
