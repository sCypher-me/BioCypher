import { motion } from "motion/react"
import { profile } from "../data/profile"
import { useReducedMotionPreference } from "../hooks/useReducedMotionPreference"
import { safeExternalUrl } from "../utils/safeExternalUrl"

export default function SupportButton() {
  const reducedMotion = useReducedMotionPreference()
  const href = safeExternalUrl(profile.support.href, ["buymeacoffee.com"])
  if (!href) return null
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${profile.ui.support.label}, ${profile.ui.opensNewTab}`}
      className="group relative flex min-h-[46px] w-full items-center gap-2.5 overflow-hidden rounded-xl border border-cyan/20 bg-void/55 px-2.5 outline-none transition-colors hover:border-cyan/35 hover:bg-cyan/5 focus-visible:ring-2 focus-visible:ring-cyan xl:min-h-14 xl:px-3.5"
      whileHover={reducedMotion ? undefined : { y: -1 }}
      whileTap={{ scale: 0.985 }}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-support-violet bg-support-violet text-sigil shadow-[0_0_0_0_var(--color-support-violet)] transition-shadow duration-300 group-hover:shadow-[0_0_14px_-2px_var(--color-support-violet)] group-focus-visible:shadow-[0_0_14px_-2px_var(--color-support-violet)]">
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h11v6.5A4.5 4.5 0 0 1 11.5 19h-2A4.5 4.5 0 0 1 5 14.5V8Z" /><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 5c0-1 1-1 1-2m3 2c0-1 1-1 1-2" /></svg>
      </span>
      <span className="flex min-w-0 flex-1 items-baseline gap-2 overflow-hidden whitespace-nowrap">
        <span className="font-mono text-[10px] text-silver-dim">{profile.ui.support.kicker}</span>
        <span className="truncate font-display text-[11px] tracking-[0.06em] text-silver group-hover:text-cyan">{profile.ui.support.label}</span>
      </span>
      <span aria-hidden className="text-[11px] text-violet drop-shadow-[0_0_5px_color-mix(in_oklab,var(--color-violet)_55%,transparent)]">↗</span>
      {!reducedMotion && <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/4 skew-x-[-18deg] bg-cyan/5 opacity-0 transition-all duration-500 group-hover:left-[115%] group-hover:opacity-100 group-focus-visible:left-[115%] group-focus-visible:opacity-100" />}
    </motion.a>
  )
}
