import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { Analytics } from "@vercel/analytics/react"
import { profile } from "./data/profile"
import SacredGrid from "./components/SacredGrid"
import LoadingScreen from "./components/LoadingScreen"
import { MusicProvider, useMusic } from "./components/MusicProvider"
import BinaryRain from "./components/BinaryRain"
import { LinkInBio } from "./components/LinkInBio"
import LogoMark from "./components/LogoMark"
import { useReducedMotionPreference } from "./hooks/useReducedMotionPreference"
import { useContentProtection } from "./hooks/useContentProtection"
import CustomCursor from "./components/CustomCursor"
import { startTabTitleAnimation, stopTabTitleAnimation } from "./tabTitle"

type Phase = "loading" | "transition" | "reveal" | "live"
const SESSION_KEY = "cypher:loading-complete"

function initialPhase(): Phase {
  if (typeof window !== "undefined" && profile.loading.skipForSession && window.sessionStorage.getItem(SESSION_KEY) === "1") return "reveal"
  return "loading"
}

export default function App() {
  useContentProtection()
  const [phase, setPhase] = useState<Phase>(initialPhase)
  const handleLoadingComplete = useCallback(() => {
    window.sessionStorage.setItem(SESSION_KEY, "1")
    setPhase("transition")
  }, [])
  const skipRitual = useCallback(() => {
    window.sessionStorage.setItem(SESSION_KEY, "1")
    setPhase("reveal")
  }, [])

  useEffect(() => {
    const activateTitleAnimation = () => {
      window.removeEventListener("pointerdown", activateTitleAnimation)
      window.removeEventListener("keydown", activateTitleAnimation)
      startTabTitleAnimation()
    }

    window.addEventListener("pointerdown", activateTitleAnimation, { once: true })
    window.addEventListener("keydown", activateTitleAnimation, { once: true })

    return () => {
      window.removeEventListener("pointerdown", activateTitleAnimation)
      window.removeEventListener("keydown", activateTitleAnimation)
      stopTabTitleAnimation()
    }
  }, [])

  return (
    <>
    <CustomCursor />
    <MotionConfig reducedMotion="user">
    <MusicProvider>
      <AnimatePresence mode="wait">
        {phase === "loading" && <LoadingScreen key="loading" onComplete={handleLoadingComplete} onSkip={skipRitual} />}
        {phase === "transition" && <TransitionFlash key="transition" onDone={() => setPhase("reveal")} />}
      </AnimatePresence>
      {(phase === "reveal" || phase === "live") && <Bio reveal={phase === "live"} onEnter={() => setPhase("live")} />}
      {phase !== "loading" && phase !== "transition" && <BinaryRain />}
    </MusicProvider>
    </MotionConfig>
    <Analytics />
    </>
  )
}

function Bio({ reveal, onEnter }: { reveal: boolean; onEnter: () => void }) {
  const { play } = useMusic()
  const enteringRef = useRef(false)
  const liveRef = useRef<HTMLDivElement>(null)
  const [entering, setEntering] = useState(false)
  const handleEnter = () => {
    if (enteringRef.current) return
    enteringRef.current = true
    setEntering(true)
    play(profile.audio.entryVolume)
    onEnter()
  }

  useEffect(() => {
    if (!reveal) return
    const timer = window.setTimeout(() => liveRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [reveal])

  return (
    <main className="group/entry relative min-h-[100dvh] w-full">
      <SacredGrid intensity={reveal ? "reading" : "ritual"} />
      <AnimatePresence>
        {!reveal && (
          <motion.button
            type="button"
            onClick={handleEnter}
            disabled={entering}
            aria-label={profile.ui.entryAriaLabel}
            className={`group absolute inset-0 z-20 min-h-[100dvh] w-full cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan ${entering ? "pointer-events-none" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] ring-0 ring-cyan/0 transition group-focus-visible:ring-1 group-focus-visible:ring-cyan/40" />
            <span className="sr-only">{profile.ui.entryAriaLabel}</span>
          </motion.button>
        )}
      </AnimatePresence>
      <div className={"relative z-10 mx-auto flex w-full flex-col items-stretch px-3 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] " + (reveal ? "min-h-[100dvh] justify-start sm:pt-10 xl:justify-center xl:py-12" : "min-h-[100dvh] justify-center")}>
        <AnimatePresence>
          {!reveal && (
            <motion.div
              className="absolute inset-0 grid min-h-[100dvh] place-items-center px-3 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]"
              initial={{ scale: 0.94, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.85, filter: "blur(12px)" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative grid min-h-44 place-items-center rounded-3xl p-2">
                <span className="pointer-events-none absolute h-52 w-52 rounded-full bg-cyan/15 opacity-60 blur-3xl transition group-hover/entry:opacity-90" />
                <LogoMark />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!reveal && (
            <motion.div className="pointer-events-none absolute left-1/2 top-[calc(50%+8.5rem)] z-10 flex w-[min(90%,32rem)] -translate-x-1/2 flex-col items-center gap-2 text-center" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.4 }}>
              <motion.span className="font-display text-sm font-bold tracking-[0.4em] text-sigil-glow" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                {profile.ui.enter}
              </motion.span>
              <span className="font-mono text-[13px] tracking-widest text-ash/70">{profile.ui.entryGreek}</span>
              <span className="mt-1 font-mono text-[10px] tracking-widest text-ash/45">{profile.ui.entryTranslation}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {reveal && (
            <motion.div ref={liveRef} tabIndex={-1} className="outline-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <LinkInBio />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

const MATRIX = "01<>/\\|=+*#@%&$"

function TransitionFlash({ onDone }: { onDone: () => void }) {
  const target = profile.ui.decrypted
  const [scramble, setScramble] = useState(target)
  const reducedMotion = useReducedMotionPreference()
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (reducedMotion) {
      const doneTimer = window.setTimeout(() => onDoneRef.current(), 120)
      return () => window.clearTimeout(doneTimer)
    }
    let frame = 0
    const total = 26
    let doneTimer = 0
    const interval = window.setInterval(() => {
      frame += 1
      const revealed = Math.min(target.length, Math.floor((frame / total) * target.length))
      const noise = Array.from({ length: target.length - revealed }, () => MATRIX[Math.floor(Math.random() * MATRIX.length)]).join("")
      setScramble(target.slice(0, revealed) + noise)
      if (frame >= total) {
        window.clearInterval(interval)
        setScramble(target)
        doneTimer = window.setTimeout(() => onDoneRef.current(), 520)
      }
    }, 45)
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(doneTimer)
    }
  }, [reducedMotion, target])

  return (
    <motion.div className="fixed inset-0 z-40 grid place-items-center overflow-hidden bg-void" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_50%,color-mix(in_oklab,var(--color-azure)_55%,transparent)_0%,color-mix(in_oklab,var(--color-violet)_30%,transparent)_35%,transparent_70%)]" animate={{ opacity: [0, 1, 0], scale: [0.8, 1.15, 1.3] }} transition={{ duration: 1.35, ease: "easeOut" }} />
      <HudFlash />
      <motion.span className="relative z-10 font-display text-2xl font-bold tracking-[0.45em] text-sigil-glow sm:text-3xl" initial={{ opacity: 0, letterSpacing: "0.7em", filter: "blur(8px)" }} animate={{ opacity: 1, letterSpacing: "0.45em", filter: "blur(0px)" }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        {scramble}
      </motion.span>
    </motion.div>
  )
}

function HudFlash() {
  const base = "pointer-events-none absolute h-10 w-10 border-sigil/50"
  return <><div className={`${base} left-6 top-6 border-l-2 border-t-2`} /><div className={`${base} right-6 top-6 border-r-2 border-t-2`} /><div className={`${base} bottom-6 left-6 border-b-2 border-l-2`} /><div className={`${base} bottom-6 right-6 border-b-2 border-r-2`} /></>
}
