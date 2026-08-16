import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "motion/react"
import { profile, type OracleCommand, type PortalTab } from "../data/profile"
import { useMusic } from "./MusicProvider"

type OraclePanelProps = {
  open: boolean
  onClose: () => void
  onTab: (tab: PortalTab) => void
  onShare: () => void
  onSigil: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}

export default function OraclePanel({ open, onClose, onTab, onShare, onSigil, returnFocusRef }: OraclePanelProps) {
  const { play, pause } = useMusic()
  const [value, setValue] = useState("")
  const [history, setHistory] = useState<string[]>([profile.oracle.title])
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const commands = useMemo(() => profile.oracle.commands, [])

  const resolve = (raw: string) => {
    const token = raw.trim().toLowerCase()
    return commands.find((item) => item.command === token || item.aliases?.includes(token))
  }

  const run = (command: OracleCommand) => {
    if (command.response) return command.response
    switch (command.action) {
      case "help": return commands.map((item) => `${item.command.padEnd(10, " ")} ${item.description}`).join("\n")
      case "about": onTab("about"); return profile.bio
      case "links": onTab("social"); return profile.oracle.linksRevealed
      case "play": play(); return profile.audio.statusLabels.playing
      case "pause": pause(); return profile.audio.statusLabels.paused
      case "share": onShare(); return profile.ui.share.label
      case "sigil": onSigil(); return profile.easterEggs[0]?.message ?? profile.declaration
      default: return profile.oracle.unknown
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const raw = value.trim()
    if (!raw) return
    const command = resolve(raw)
    const response = command ? run(command) : profile.oracle.unknown
    setHistory((current) => [...current.slice(-7), `> ${raw}`, response])
    setValue("")
  }

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== "Tab" || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button, input, [href], [tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute("disabled"))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
      window.setTimeout(() => returnFocusRef.current?.focus(), 0)
    }
  }, [onClose, open, returnFocusRef])

  if (typeof document === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-void/90 p-0 backdrop-blur-xl sm:items-center sm:p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
          <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="oracle-title" className="flex h-[100dvh] w-full flex-col overflow-hidden border-violet/50 bg-void shadow-[0_0_50px_-14px_var(--color-violet)] sm:h-auto sm:max-h-[min(680px,90dvh)] sm:max-w-2xl sm:rounded-2xl sm:border" initial={{ opacity: 0, y: 8, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 5, scale: 0.99 }} transition={{ duration: 0.2 }}>
            <header className="flex min-h-14 items-center justify-between border-b border-violet/30 px-[max(1rem,env(safe-area-inset-left))] pt-[env(safe-area-inset-top)] font-mono text-xs tracking-widest text-violet">
              <h2 id="oracle-title">{profile.oracle.channelLabel}</h2>
              <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-lg text-lg text-silver-dim outline-none hover:bg-violet/10 hover:text-cyan focus-visible:ring-2 focus-visible:ring-cyan" aria-label={profile.oracle.close}>×</button>
            </header>
            <pre aria-live="polite" aria-atomic="false" className="min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap px-4 py-4 font-mono text-xs leading-relaxed text-azure sm:min-h-48">
              {history.join("\n")}
            </pre>
            <form onSubmit={submit} className="flex items-center gap-2 border-t border-violet/20 px-[max(1rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <span className="font-mono text-cyan" aria-hidden>›</span>
              <input ref={inputRef} value={value} onChange={(event) => setValue(event.target.value)} placeholder={profile.oracle.placeholder} aria-label={profile.oracle.inputLabel} autoComplete="off" className="min-h-11 min-w-0 flex-1 rounded-lg border border-transparent bg-panel/60 px-3 font-mono text-base text-silver outline-none placeholder:text-silver-dim focus:border-cyan/40" />
              <button type="submit" className="min-h-11 rounded-lg border border-cyan/30 px-3 font-mono text-[11px] tracking-wider text-cyan outline-none hover:bg-cyan/10 focus-visible:ring-2 focus-visible:ring-cyan">{profile.oracle.execute}</button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
