import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react"
import { AnimatePresence, motion, useDragControls } from "motion/react"
import { profile, type AboutTone, type PortalTab } from "../data/profile"
import ElectricBorder from "./ElectricBorder"
import MusicPlayer from "./MusicPlayer"
import ProfilePhoto from "./ProfilePhoto"
import OraclePanel from "./OraclePanel"
import GithubProfileCard from "./GithubProfileCard"
import PlatformGrid from "./PlatformGrid"
import SupportButton from "./SupportButton"
import StacksPanel from "./StacksPanel"
import { useMusic } from "./MusicProvider"
import { useReducedMotionPreference } from "../hooks/useReducedMotionPreference"
import { useMotionPreference } from "../hooks/useMotionPreference"
import { safeExternalUrl } from "../utils/safeExternalUrl"

const TABS: PortalTab[] = ["social", "about", "stacks"]
const GLYPH = "⌖"
const TAB_KEY = "cypher:active-tab"
const ease = [0.22, 1, 0.36, 1] as const

function initialTab(): PortalTab {
  const stored = window.sessionStorage.getItem(TAB_KEY)
  return TABS.includes(stored as PortalTab) ? stored as PortalTab : "social"
}

export function LinkInBio() {
  const [tab, setTabState] = useState<PortalTab>(initialTab)
  const [oracleOpen, setOracleOpen] = useState(false)
  const closeOracle = useCallback(() => setOracleOpen(false), [])
  const [signal, setSignal] = useState("")
  const [sigilActive, setSigilActive] = useState(false)
  const { playing } = useMusic()
  const reducedMotion = useReducedMotionPreference()
  const { paused, toggleMotion } = useMotionPreference()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const oracleButtonRef = useRef<HTMLButtonElement>(null)
  const signalTimerRef = useRef(0)
  const sigilTimerRef = useRef(0)
  const lastPortalRef = useRef<string | null>(null)
  const dragControls = useDragControls()

  const setTab = (next: PortalTab) => {
    setTabState(next)
    window.sessionStorage.setItem(TAB_KEY, next)
  }

  const moveTab = (direction: -1 | 1) => {
    const current = TABS.indexOf(tab)
    setTab(TABS[(current + direction + TABS.length) % TABS.length])
  }

  const showSignal = (message: string) => {
    setSignal(message)
    window.clearTimeout(signalTimerRef.current)
    signalTimerRef.current = window.setTimeout(() => setSignal(""), 2600)
  }

  const share = async () => {
    const configured = import.meta.env.VITE_SITE_URL
    const url = configured ? safeExternalUrl(configured) ?? window.location.origin : window.location.origin
    const payload = { title: profile.ui.share.title, text: profile.ui.share.text, url }
    try {
      if (navigator.share) await navigator.share(payload)
      else await navigator.clipboard.writeText(url)
      showSignal(profile.ui.share.success)
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") showSignal(profile.ui.share.error)
    }
  }

  const invokeSigil = () => {
    setSigilActive(true)
    showSignal(profile.easterEggs[0]?.message ?? profile.declaration)
    window.clearTimeout(sigilTimerRef.current)
    sigilTimerRef.current = window.setTimeout(() => setSigilActive(false), 4200)
  }

  const openRandomPortal = () => {
    const available = profile.portalDestinations.filter((item) => item.id !== lastPortalRef.current)
    const destination = available[Math.floor(Math.random() * available.length)] ?? profile.portalDestinations[0]
    lastPortalRef.current = destination.id
    if (destination.kind === "tab") {
      setTab(destination.tab)
      showSignal(`${destination.label} decodificado.`)
      window.setTimeout(() => document.getElementById(`panel-${destination.tab}`)?.focus(), 40)
      return
    }
    const url = safeExternalUrl(destination.href)
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
      showSignal(`${destination.label} aberto em uma nova aba.`)
    }
  }

  useEffect(() => {
    let buffer = ""
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target?.matches("input, textarea, [contenteditable='true']")
      if (event.key === "/" && !typing) {
        event.preventDefault()
        setOracleOpen(true)
        return
      }
      if (typing || event.key.length !== 1) return
      buffer = (buffer + event.key.toLowerCase()).slice(-24)
      if (profile.easterEggs.some((item) => buffer.endsWith(item.sequence.toLowerCase()))) invokeSigil()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => () => {
    window.clearTimeout(signalTimerRef.current)
    window.clearTimeout(sigilTimerRef.current)
  }, [])

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length
    else if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = TABS.length - 1
    else return
    event.preventDefault()
    setTab(TABS[next])
    tabRefs.current[next]?.focus()
  }

  const beginSwipe = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch") return
    const target = event.target as HTMLElement
    if (target.closest("button, a, input, textarea, [data-no-swipe]")) return
    dragControls.start(event)
  }

  const borderIntensity = sigilActive ? 1.1 : playing ? 0.62 : 0.24

  return (
    <div className="relative mx-auto w-full max-w-[420px] py-2 sm:py-4 xl:max-w-[1080px]" data-profile-shell>
      <ElectricBorder color="var(--color-cyan)" borderRadius={20} thickness={1.6} speed={playing ? 4 : 2.1} intensity={borderIntensity}>
        <motion.article
          initial={{ opacity: 0, y: 18, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1, boxShadow: sigilActive ? "0 0 64px -16px var(--color-violet)" : "0 18px 60px -34px var(--color-cyan)" }}
          transition={{ duration: reducedMotion ? 0.01 : 0.55, ease }}
          className="profile-shell relative overflow-hidden rounded-[20px] border border-silver/10 bg-panel/90 backdrop-blur-2xl [backdrop-saturate:1.25]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/55 to-transparent" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-violet/10 blur-3xl" />

          <header className="profile-header relative z-20 grid h-12 grid-cols-[1fr_auto_1fr] items-center border-b border-cyan/10 bg-void/70 px-2.5">
            <div className="flex items-center gap-1.5" aria-hidden>
              <span className="h-2 w-2 rounded-full bg-rose/80" />
              <span className="h-2 w-2 rounded-full bg-gold/80" />
              <span className={`h-2 w-2 rounded-full ${playing ? "bg-cyan shadow-[0_0_8px_var(--color-cyan)]" : "bg-azure/75"}`} />
            </div>
            <span className="font-mono text-[11px] tracking-[0.16em] text-silver-dim">@{profile.handle}</span>
            <div className="flex items-center justify-end gap-1">
              <button type="button" onClick={toggleMotion} aria-pressed={paused} aria-label={paused ? profile.ui.motion.paused : profile.ui.motion.enabled} className="grid h-11 w-11 place-items-center rounded-lg font-mono text-[14px] text-azure outline-none transition-colors hover:bg-azure/10 hover:text-cyan focus-visible:ring-2 focus-visible:ring-cyan"><span aria-hidden>{paused ? "▷" : "Ⅱ"}</span></button>
              <button ref={oracleButtonRef} type="button" onClick={() => setOracleOpen(true)} aria-label="Abrir oráculo de comandos" className="grid h-11 w-11 place-items-center rounded-lg font-display text-[14px] text-violet outline-none transition-colors hover:bg-violet/10 hover:text-cyan focus-visible:ring-2 focus-visible:ring-cyan">{GLYPH}</button>
            </div>
          </header>

          <OraclePanel open={oracleOpen} onClose={closeOracle} onTab={setTab} onShare={() => void share()} onSigil={invokeSigil} returnFocusRef={oracleButtonRef} />

          <section className="profile-identity relative z-10 flex items-center gap-1.5 px-3.5 pt-3.5 min-[360px]:gap-3 sm:px-4 sm:pt-4 xl:pb-1">
            <div className="w-16 shrink-0 min-[360px]:w-20"><ProfilePhoto /></div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2" aria-hidden><span className="h-px w-4 bg-cyan/60" /><span className="font-mono text-[10px] tracking-[0.14em] text-cyan">ID // {profile.handle}</span></div>
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="min-w-0 truncate font-display text-[12px] font-bold tracking-[0.05em] text-silver min-[360px]:text-base min-[360px]:tracking-[0.09em]">{profile.name}</h1>
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-violet/25 bg-azure/5 px-0.5 py-1 font-mono text-[6px] tracking-normal text-azure shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-cyan)_12%,transparent)] min-[360px]:gap-1 min-[360px]:px-1.5 min-[360px]:text-[8px] min-[360px]:tracking-[0.02em] sm:text-[9px]">
                  <svg aria-hidden viewBox="0 0 24 24" className="h-3 w-3 text-cyan" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  {profile.location}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 font-body text-xs leading-snug text-azure/90">{profile.declaration}</p>
            </div>
          </section>

          <div className="profile-player relative z-10 px-3.5 pt-3 sm:px-4"><MusicPlayer /></div>

          <nav role="tablist" aria-label="Conteúdo do perfil" className="profile-tabs relative z-10 grid grid-cols-3 gap-2 px-3.5 pt-3.5 sm:px-4">
            {TABS.map((id, index) => {
              const active = tab === id
              return <motion.button key={id} ref={(node) => { tabRefs.current[index] = node }} id={`tab-${id}`} role="tab" aria-selected={active} aria-controls={`panel-${id}`} tabIndex={active ? 0 : -1} onClick={() => setTab(id)} onKeyDown={(event) => onTabKeyDown(event, index)} className="relative min-h-11 rounded-lg border border-dashed border-violet/25 bg-void/45 px-1 font-mono text-[11px] tracking-[0.07em] outline-none transition-colors hover:border-violet/45 focus-visible:ring-2 focus-visible:ring-cyan" whileTap={{ scale: 0.96 }}>
                {active && <SelectionBrackets reducedMotion={reducedMotion} />}<span className={`relative z-10 block ${active ? "text-cyan" : "text-silver-dim"}`}>{profile.ui.tabs[id]}</span>
              </motion.button>
            })}
          </nav>

          <section className="profile-archive relative z-10 min-w-0 px-3.5 pb-3 pt-3 sm:px-4 xl:border-l xl:border-violet/20 xl:bg-void/25 xl:p-5">
            <div className="mb-3 hidden items-center gap-2 xl:flex" aria-hidden><span className="h-px w-8 bg-violet/60" /><span className="font-mono text-[11px] tracking-[0.16em] text-violet">{profile.ui.decodedArchive}</span></div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.section key={tab} id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} tabIndex={0} drag={reducedMotion ? false : "x"} dragControls={dragControls} dragListener={false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.08} dragMomentum={false} onPointerDown={beginSwipe} onDragEnd={(_, info) => { if (info.offset.x < -55 || info.velocity.x < -420) moveTab(1); else if (info.offset.x > 55 || info.velocity.x > 420) moveTab(-1) }} style={{ touchAction: "pan-y" }} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: reducedMotion ? 0.01 : 0.2, ease }} className="rounded-xl outline-none focus-visible:ring-1 focus-visible:ring-cyan/60">
                {tab === "social" && <SocialPanel />}{tab === "about" && <AboutPanel />}{tab === "stacks" && <StacksPanel />}
              </motion.section>
            </AnimatePresence>
          </section>

          <footer className="profile-footer relative z-10 grid min-h-11 grid-cols-[72px_1fr_72px] items-center border-t border-cyan/10 bg-void/65 px-2 font-mono text-silver-dim">
            <button type="button" onClick={openRandomPortal} aria-label={profile.ui.randomPortal} className="min-h-11 rounded-md text-left text-[9px] tracking-[0.07em] text-azure outline-none transition-colors hover:text-cyan focus-visible:ring-2 focus-visible:ring-cyan">{GLYPH} {profile.ui.signal}</button>
            <span className="text-center text-[9px] leading-tight text-silver-dim" title={profile.footer}>{profile.footer}</span><span aria-hidden />
          </footer>

          <div className="sr-only" role="status" aria-live="polite">{paused ? profile.ui.motion.pausedStatus : profile.ui.motion.enabledStatus}</div>
          <AnimatePresence>{signal && <motion.div role="status" aria-live="polite" aria-atomic="true" className="absolute bottom-12 left-1/2 z-50 max-w-[90%] -translate-x-1/2 rounded-lg border border-violet/45 bg-void/95 px-3 py-2 text-center font-mono text-[11px] text-violet shadow-[0_0_24px_-8px_var(--color-violet)]" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{signal}</motion.div>}</AnimatePresence>
        </motion.article>
      </ElectricBorder>
    </div>
  )
}

function SelectionBrackets({ reducedMotion }: { reducedMotion: boolean }) {
  const corner = "absolute h-2.5 w-2.5 border-cyan drop-shadow-[0_0_4px_var(--color-cyan)]"
  return <motion.span layoutId="active-tab-brackets" className="pointer-events-none absolute inset-0 z-20" transition={reducedMotion ? { duration: 0.01 } : { type: "spring", stiffness: 720, damping: 30, mass: 0.45 }}><span className={`${corner} left-0 top-0 border-l border-t`} /><span className={`${corner} right-0 top-0 border-r border-t`} /><span className={`${corner} bottom-0 left-0 border-b border-l`} /><span className={`${corner} bottom-0 right-0 border-b border-r`} /></motion.span>
}

function SocialPanel() { return <div className="space-y-2.5 xl:grid xl:min-h-[500px] xl:grid-rows-[auto_1fr_auto] xl:gap-3 xl:space-y-0"><GithubProfileCard /><PlatformGrid /><SupportButton /></div> }

function AboutPanel() {
  const toneClass: Record<AboutTone, string> = { default: "text-silver-dim", cyan: "font-medium text-cyan", azure: "font-medium text-azure", violet: "font-medium text-violet" }
  return <motion.div layout className="relative overflow-hidden rounded-xl border border-line/70 bg-void/45 p-3.5 xl:p-4">
    <div aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-violet/10 blur-3xl" />
    <div className="relative flex items-center gap-2"><span aria-hidden className="text-[11px] text-cyan">✦</span><h2 className="font-display text-xs font-bold tracking-[0.14em] text-silver">{profile.about.eyebrow}</h2><span aria-hidden className="h-px flex-1 bg-gradient-to-r from-cyan/35 to-transparent" /></div>
    <blockquote className="relative mt-3 rounded-r-lg border-l-2 border-cyan bg-cyan/5 py-2.5 pl-3 pr-2 font-body text-sm leading-relaxed text-silver/95"><span aria-hidden className="mr-1 text-cyan">›</span>{profile.about.quote}</blockquote>
    <div className="relative mt-3 space-y-2.5">{profile.about.paragraphs.map((paragraph) => <p key={paragraph.id} className="font-body text-xs leading-[1.65] text-silver-dim">{paragraph.segments.map((segment, index) => <span key={`${paragraph.id}-${index}`} className={toneClass[segment.tone ?? "default"]}>{segment.text}</span>)}</p>)}</div>
    <div className="relative my-3 h-px bg-gradient-to-r from-cyan/30 via-azure/20 to-transparent" />
    <ul className="relative grid gap-1.5">{profile.about.highlights.map((item) => <li key={item.id} className="flex min-h-9 items-center gap-2 rounded-lg border border-azure/15 bg-panel/45 px-2.5 font-body text-xs text-silver/90"><span aria-hidden className="text-[9px] text-cyan">✦</span><span>{item.label}</span></li>)}</ul>
    <section className="relative mt-3 rounded-lg border border-violet/25 bg-violet/5 p-3" aria-labelledby="current-signal-title"><h3 id="current-signal-title" className="font-mono text-[11px] tracking-[0.12em] text-violet">{profile.ui.currentSignal}</h3><p className="mt-1.5 font-body text-xs leading-relaxed text-silver">{profile.currentSignal}</p></section>
    <p className="relative mt-3 font-body text-xs leading-relaxed text-azure/90">{profile.about.closing}</p>
  </motion.div>
}
