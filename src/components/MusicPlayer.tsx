import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { useMusic } from "./MusicProvider"
import { profile } from "../data/profile"
import Visualizer from "./Visualizer"
import { useAudioTimeline } from "../hooks/useAudioTimeline"

function PlayIcon({ paused }: { paused: boolean }) {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>{paused ? <path d="M8 5v14l11-7z" /> : <path d="M6 5h4v14H6zM14 5h4v14h-4z" />}</svg>
}

function SpeakerIcon({ muted = false }: { muted?: boolean }) {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M4 9v6h4l5 5V4L8 9H4z" />{muted && <path d="M16 8l5 8M21 8l-5 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}</svg>
}

export default function MusicPlayer() {
  const { playing, toggle, volume, setVolume, status, title, artist, muted, toggleMute, audioRef } = useMusic()
  const { currentTime, duration, formattedCurrentTime, formattedDuration, seekTo } = useAudioTimeline(audioRef)
  const [openVolume, setOpenVolume] = useState(false)
  const volumeRef = useRef<HTMLDivElement>(null)
  const labels = profile.ui.player

  useEffect(() => {
    if (!openVolume) return
    const closeOutside = (event: PointerEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(event.target as Node)) setOpenVolume(false)
    }
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenVolume(false)
    }
    document.addEventListener("pointerdown", closeOutside)
    document.addEventListener("keydown", closeEscape)
    return () => {
      document.removeEventListener("pointerdown", closeOutside)
      document.removeEventListener("keydown", closeEscape)
    }
  }, [openVolume])

  return (
    <section aria-label={title} className="relative isolate overflow-visible rounded-2xl border border-violet/25 bg-void/80 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-silver)_7%,transparent),0_12px_28px_-24px_var(--color-violet)]">
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-violet/65 to-transparent" />

      <div className="relative z-10 px-2.5 pb-2 pt-2">
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            onClick={toggle}
            disabled={status === "error"}
            aria-label={playing ? labels.pause : labels.play}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-cyan/35 bg-cyan/10 text-cyan shadow-[0_0_16px_-9px_var(--color-cyan)] outline-none transition-colors hover:bg-cyan/20 focus-visible:ring-2 focus-visible:ring-cyan disabled:cursor-not-allowed disabled:border-rose/30 disabled:text-rose"
            whileTap={{ scale: 0.92 }}
          >
            <PlayIcon paused={!playing} />
          </motion.button>

          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[11px] tracking-[0.06em] text-silver">{title}</p>
            <p className={`mt-0.5 truncate font-body text-[11px] ${status === "error" ? "text-rose" : "text-silver-dim"}`} aria-live="polite">{status === "error" ? profile.audio.statusLabels.error : artist}</p>
          </div>

          <div ref={volumeRef} className="relative shrink-0">
            <button type="button" onClick={() => setOpenVolume((value) => !value)} aria-label={labels.openVolume} aria-expanded={openVolume} className="grid h-11 w-11 place-items-center rounded-full border border-silver/10 bg-panel/55 text-silver-dim outline-none transition-colors hover:border-cyan/30 hover:text-cyan focus-visible:ring-2 focus-visible:ring-cyan">
              <SpeakerIcon muted={muted} />
            </button>
            {openVolume && (
              <motion.div className="absolute right-0 top-12 z-50 w-[min(13rem,calc(100vw-3rem))] rounded-xl border border-cyan/25 bg-void/95 p-3 shadow-[0_14px_34px_-16px_var(--color-cyan)] backdrop-blur-xl" initial={{ opacity: 0, y: -5, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={toggleMute} aria-label={muted ? labels.unmute : labels.mute} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-silver-dim outline-none hover:bg-cyan/10 hover:text-cyan focus-visible:ring-2 focus-visible:ring-cyan"><SpeakerIcon muted={muted} /></button>
                  <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label={labels.volume} className="h-11 min-w-0 flex-1 cursor-pointer appearance-none bg-transparent accent-cyan [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-silver/15 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-silver/15 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-cyan" />
                  <span className="w-7 text-right font-mono text-[10px] text-azure">{Math.round(volume * 100)}</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="relative mt-1.5 grid h-11 grid-cols-[34px_1fr_34px] items-center gap-1 overflow-hidden rounded-xl border border-azure/10 bg-panel/45 px-1.5">
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full opacity-70 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <Visualizer variant="embedded" />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void/90 via-void/30 to-void/90" />
          <span className="relative z-10 font-mono text-[10px] tabular-nums text-azure">{formattedCurrentTime}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seekTo(Number(event.target.value))}
            disabled={!duration}
            aria-label={labels.seek}
            className="relative z-10 h-11 w-full cursor-pointer appearance-none bg-transparent accent-cyan disabled:cursor-not-allowed disabled:opacity-40 [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-silver/25 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan [&::-webkit-slider-thumb]:shadow-[0_0_8px_var(--color-cyan)] [&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-silver/25 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-cyan"
          />
          <span className="relative z-10 text-right font-mono text-[10px] tabular-nums text-silver-dim">{formattedDuration}</span>
        </div>
      </div>
    </section>
  )
}
