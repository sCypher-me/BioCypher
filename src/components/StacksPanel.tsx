import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { profile, type StackItem } from "../data/profile"
import { useReducedMotionPreference } from "../hooks/useReducedMotionPreference"

const ORBIT_POSITIONS = [
  "left-[calc(50%_-_28px)] top-1 xl:left-[calc(50%_-_44px)] xl:top-2",
  "left-1 top-[52px] xl:left-[4%] xl:top-[126px]",
  "right-1 top-[52px] xl:right-[4%] xl:top-[126px]",
  "bottom-1 left-[13%] xl:bottom-3 xl:left-[20%]",
  "bottom-1 right-[13%] xl:bottom-3 xl:right-[20%]",
] as const

const CONNECTIONS = [
  [160, 91, 160, 25],
  [160, 91, 31, 76],
  [160, 91, 289, 76],
  [160, 91, 66, 164],
  [160, 91, 254, 164],
] as const

function toneFor(item: StackItem) {
  if (item.category === "DESIGN" || item.category === "MOTION") return {
    dot: "border-violet bg-violet shadow-[0_0_10px_-2px_var(--color-violet)]",
    code: "text-violet",
    border: "border-violet/20 hover:border-violet/40",
    chip: "border-violet/20 bg-violet/5 text-violet",
  }
  if (item.category === "BACKEND") return {
    dot: "border-azure bg-azure shadow-[0_0_10px_-2px_var(--color-azure)]",
    code: "text-azure",
    border: "border-azure/20 hover:border-azure/40",
    chip: "border-azure/20 bg-azure/5 text-azure",
  }
  return {
    dot: "border-cyan bg-cyan shadow-[0_0_10px_-2px_var(--color-cyan)]",
    code: "text-cyan",
    border: "border-cyan/20 hover:border-cyan/40",
    chip: "border-cyan/20 bg-cyan/5 text-cyan",
  }
}

export default function StacksPanel() {
  const [selectedId, setSelectedId] = useState(profile.stacks[0].id)
  const reducedMotion = useReducedMotionPreference()
  const selected = profile.stacks.find((item) => item.id === selectedId) ?? profile.stacks[0]
  const selectedTone = toneFor(selected)

  return (
    <div className="overflow-hidden rounded-xl border border-line/70 bg-void/45 p-2.5 xl:min-h-[500px] xl:p-4">
      <div className="relative mx-auto h-[190px] w-full max-w-[320px] xl:h-[330px] xl:max-w-[660px]" aria-label="Constelação de competências">
        <svg aria-hidden viewBox="0 0 320 190" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <circle cx="160" cy="91" r="63" fill="none" stroke="var(--color-violet)" strokeOpacity="0.13" strokeDasharray="3 5" />
          <circle cx="160" cy="91" r="45" fill="none" stroke="var(--color-azure)" strokeOpacity="0.1" />
          {CONNECTIONS.map(([x1, y1, x2, y2], index) => (
            <motion.line key={profile.stacks[index].id} x1={x1} y1={y1} x2={x2} y2={y2} stroke={selectedId === profile.stacks[index].id ? "var(--color-cyan)" : "var(--color-azure)"} strokeOpacity={selectedId === profile.stacks[index].id ? 0.72 : 0.18} strokeWidth={selectedId === profile.stacks[index].id ? 1.5 : 1} initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: reducedMotion ? 0.01 : 0.42, delay: reducedMotion ? 0 : index * 0.045 }} />
          ))}
        </svg>

        <motion.div aria-hidden className="pointer-events-none absolute left-[calc(50%_-_33px)] top-[58px] grid h-[66px] w-[66px] place-items-center rounded-full border border-cyan/30 bg-panel/80 shadow-[0_0_18px_-6px_var(--color-cyan)] xl:left-[calc(50%_-_48px)] xl:top-[116px] xl:h-24 xl:w-24 xl:shadow-[0_0_30px_-8px_var(--color-cyan)]" animate={reducedMotion ? undefined : { scale: [1, 1.025, 1] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}>
          <span className="absolute inset-1 rounded-full border border-dashed border-violet/30" />
          <picture className="relative h-10 w-10 opacity-75 xl:h-14 xl:w-14">
            <source type="image/avif" srcSet={profile.media.cardWatermark.avifSrcSet} />
            <img src={profile.media.cardWatermark.fallback} alt="" width={profile.media.cardWatermark.width} height={profile.media.cardWatermark.height} className="h-10 w-10 object-contain xl:h-14 xl:w-14" />
          </picture>
        </motion.div>

        {profile.stacks.map((item, index) => {
          const active = selectedId === item.id
          const tone = toneFor(item)
          return (
            <motion.button key={item.id} type="button" aria-pressed={active} aria-controls="constellation-details" onClick={() => setSelectedId(item.id)} className={`absolute z-10 grid h-[48px] w-[56px] place-items-center rounded-xl border bg-panel/90 px-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan xl:h-16 xl:w-[88px] xl:px-2 ${ORBIT_POSITIONS[index]} ${active ? `${tone.border} text-silver shadow-[0_0_14px_-7px_var(--color-cyan)]` : "border-line text-silver-dim hover:border-azure/35 hover:text-silver"}`} initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: active ? 1.06 : 1 }} transition={{ delay: reducedMotion ? 0 : 0.1 + index * 0.045, duration: reducedMotion ? 0.01 : 0.24 }} whileTap={{ scale: 0.94 }}>
              <span className={`font-display text-[9px] tracking-[0.04em] xl:text-[11px] ${active ? tone.code : ""}`}>{item.orbitLabel}</span>
              <span className="font-mono text-[8px] opacity-80 xl:text-[10px]" aria-hidden>{item.code}</span>
              {active && <span aria-hidden className={`absolute -bottom-1 h-1.5 w-1.5 rounded-full ${tone.dot}`} />}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={selected.id} id="constellation-details" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: reducedMotion ? 0.01 : 0.2 }} className={`rounded-lg border bg-panel/45 px-2.5 py-2 xl:px-4 xl:py-3.5 ${selectedTone.border}`}>
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[10px] tracking-[0.06em] xl:text-xs ${selectedTone.code}`}>{selected.category}</span>
            <span className="h-px flex-1 bg-line" />
            <span className={`font-mono text-[10px] tracking-[0.06em] xl:text-xs ${selectedTone.code}`}>{selected.signal}</span>
          </div>
          <h3 className="mt-1.5 font-display text-xs tracking-[0.05em] text-silver xl:text-sm">{selected.label}</h3>
          <p className="mt-1.5 font-body text-[11px] leading-relaxed text-silver-dim xl:text-xs">{selected.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5 xl:mt-3">{selected.tools.map((tool) => <span key={tool} className={`rounded border px-2 py-1 font-mono text-[9px] xl:px-2.5 xl:text-[10px] ${selectedTone.chip}`}>{tool}</span>)}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
