import { motion } from "motion/react"
import { profile, type PlatformEntry, type PlatformId } from "../data/profile"
import { useReducedMotionPreference } from "../hooks/useReducedMotionPreference"
import { safeExternalUrl } from "../utils/safeExternalUrl"

const ICONS: Record<PlatformId, string> = {
  spotify: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z",
  discord: "M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.86-.61 1.25a18.3 18.3 0 0 0-5.49 0c-.16-.39-.4-.87-.62-1.25a.08.08 0 0 0-.08-.04 19.7 19.7 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06c2.05 1.5 4.04 2.42 5.99 3.03a.08.08 0 0 0 .08-.03c.46-.63.88-1.3 1.23-2a.08.08 0 0 0-.04-.1 12.3 12.3 0 0 1-1.87-.9.08.08 0 0 1-.01-.12l.37-.3a.07.07 0 0 1 .08-.01c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 0 1 .08.01l.37.3a.08.08 0 0 1-.01.13c-.6.34-1.22.64-1.87.89a.08.08 0 0 0-.04.1c.36.7.77 1.37 1.23 2a.08.08 0 0 0 .08.03c1.96-.61 3.95-1.52 6-3.03a.08.08 0 0 0 .03-.06c.5-5.18-.84-9.67-3.55-13.66zM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.42 2.16-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.34-.95 2.42-2.16 2.42z",
  instagram: "M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.67 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.28-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.15-3.23 1.67-4.77 4.92-4.92C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.63 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.3.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z",
  x: "M14.23 10.16 22.98 0h-2.07l-7.6 8.82L7.26 0h-7l9.17 13.34L.26 24h2.07l8.02-9.32L16.75 24h7zm-2.83 3.3-.93-1.33L3.08 1.56h3.18l5.96 8.53.93 1.33 7.76 11.09h-3.18z",
  gitlab: "m23.6 9.59-.03-.08L20.3.98a.85.85 0 0 0-1.63.09l-2.2 6.75H7.54L5.33 1.07A.86.86 0 0 0 3.7.98L.43 9.5l-.03.09a6.07 6.07 0 0 0 2.01 7.01l.04.03 9.94 6.72a1.01 1.01 0 0 0 1.22 0l9.97-6.74.01-.01a6.07 6.07 0 0 0 2.01-7.01z",
  reddit: "M12 0C5.37 0 0 5.37 0 12c0 3.31 1.34 6.31 3.52 8.49l-2.29 2.28C.78 23.23 1.1 24 1.74 24H12c6.63 0 12-5.37 12-12S18.63 0 12 0zm4.39 3.2a2 2 0 1 1-1.95 2.46c-1.15.16-2.03 1.15-2.03 2.34v.01c1.78.07 3.4.57 4.69 1.36a2.8 2.8 0 1 1 2.9 4.75c-.08 3.26-3.63 5.88-7.99 5.88s-7.91-2.62-8-5.87a2.8 2.8 0 1 1 2.9-4.75 9.8 9.8 0 0 1 4.64-1.37V8c0-1.66 1.26-3.03 2.88-3.21A2 2 0 0 1 16.39 3.2zM8.3 11.58c-.78 0-1.46.78-1.5 1.79-.05 1.02.64 1.43 1.42 1.43.79 0 1.37-.37 1.42-1.38.05-1.02-.55-1.84-1.34-1.84zm7.41 0c-.79 0-1.39.82-1.34 1.84.05 1.01.63 1.38 1.42 1.38.78 0 1.47-.41 1.42-1.43-.04-1.01-.72-1.79-1.5-1.79zm-3.7 4.01c-.98 0-1.91.05-2.77.13-.15.02-.24.17-.18.31a3.2 3.2 0 0 0 5.9 0c.06-.14-.04-.29-.18-.31-.86-.08-1.8-.13-2.77-.13z",
  linkedin: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.44-2.14 2.94v5.66H9.35V9h3.42v1.56h.04c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z",
  steam: "M11.98 0C5.68 0 .51 4.86.02 11.04l6.43 2.66a3.4 3.4 0 0 1 2.1-.59l2.86-4.14v-.06a4.53 4.53 0 1 1 4.52 4.53h-.1l-4.08 2.91v.16a3.39 3.39 0 0 1-6.72.67L.44 15.27A12 12 0 1 0 11.98 0zM7.54 18.21l-1.47-.61a2.55 2.55 0 1 0 1.39-3.49l1.53.63a1.88 1.88 0 0 1-1.45 3.47zm8.41-7.04a2.27 2.27 0 1 1 0-4.53 2.27 2.27 0 0 1 0 4.53z",
  pinterest: "M12.02 0A11.99 11.99 0 0 0 7.65 23.15c-.11-.95-.2-2.4.04-3.44l1.4-5.96s-.36-.72-.36-1.78c0-1.66.97-2.91 2.17-2.91 1.02 0 1.52.77 1.52 1.69 0 1.03-.65 2.57-.99 3.99-.29 1.19.6 2.17 1.77 2.17 2.13 0 3.77-2.25 3.77-5.49 0-2.86-2.06-4.87-5.01-4.87-3.41 0-5.41 2.56-5.41 5.2 0 1.03.39 2.14.89 2.74.1.12.11.23.08.35l-.33 1.36c-.05.23-.17.27-.4.17-1.5-.69-2.44-2.88-2.44-4.65 0-3.78 2.75-7.25 7.92-7.25 4.16 0 7.39 2.97 7.39 6.92 0 4.14-2.61 7.46-6.23 7.46-1.22 0-2.36-.63-2.76-1.38l-.75 2.85c-.27 1.05-1 2.35-1.5 3.15 1.13.34 2.31.53 3.55.53A11.99 11.99 0 0 0 12.02 0z",
  threads: "M18.26 11.1c-.03-3.49-1.92-5.59-5.11-5.59-2.13 0-3.92.96-4.86 2.5l2.06 1.44c.54-.84 1.27-1.55 2.63-1.55 1.53 0 2.32.85 2.54 2.44a15 15 0 0 0-2.23-.18c-4.13 0-6.07 1.87-6.07 4.34s1.94 3.99 4.8 3.99c3.14 0 5.01-2.12 5.78-4.74.8.36 1.35 1.21 1.35 2.47 0 3.39-3.91 5.23-7.22 5.23-4.88 0-8.08-3.2-8.08-8.42 0-6.39 4.23-10.49 9.9-10.49 3.81 0 5.69 1.67 6.97 3.92l2.11-1.48C21.44 2.08 18.33 0 13.66 0 6.23 0 1.17 5.28 1.17 12.93 1.17 19.93 6.12 24 12.02 24c4.88 0 9.81-2.85 9.81-7.72 0-2.54-1.46-4.23-3.57-5.18zm-6.33 4.85c-1.08 0-2.02-.51-2.02-1.45 0-1.48 1.82-1.94 3.6-1.94.68 0 1.34.05 1.93.18-.42 1.92-1.67 3.21-3.51 3.21z",
}

function PlatformIcon({ id }: { id: PlatformId }) {
  return <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 xl:h-8 xl:w-8" fill="currentColor"><path d={ICONS[id]} /></svg>
}

function PlatformItem({ platform, index, reducedMotion }: { platform: PlatformEntry; index: number; reducedMotion: boolean }) {
  const href = safeExternalUrl(platform.href)
  const shared = "group relative grid aspect-square min-h-11 min-w-0 place-items-center rounded-xl border outline-none xl:min-h-[132px]"
  const content = <>
    <PlatformIcon id={platform.id} />
    <span className="pointer-events-none absolute -top-8 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded border border-violet/25 bg-void/95 px-2 py-1 font-mono text-[9px] text-silver opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">{href ? platform.label : `${platform.label} // ${profile.ui.platforms.locked}`}</span>
  </>

  const animation = { opacity: 1, scale: 1, y: 0 }
  const initial = reducedMotion ? false : { opacity: 0, scale: 0.86, y: 5 }
  const transition = { delay: reducedMotion ? 0 : index * 0.035, duration: reducedMotion ? 0.01 : 0.25 }

  if (!href) return (
    <motion.button type="button" disabled aria-disabled="true" aria-label={`${platform.label}: ${profile.ui.platforms.locked}`} className={`${shared} cursor-not-allowed border-line/75 bg-panel/35 text-silver-dim/40`} initial={initial} animate={animation} transition={transition}>
      {content}<span aria-hidden className="absolute right-1 top-1 h-1 w-1 rounded-full bg-violet/45" />
    </motion.button>
  )

  return (
    <motion.a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${platform.label}, ${profile.ui.opensNewTab}`} className={`${shared} border-line bg-panel/60 text-silver-dim transition-colors hover:border-cyan/45 hover:text-cyan focus-visible:ring-2 focus-visible:ring-cyan`} initial={initial} animate={animation} transition={transition} whileHover={reducedMotion ? undefined : { y: -2, scale: 1.05 }} whileTap={{ scale: 0.94 }}>
      {content}
    </motion.a>
  )
}

export default function PlatformGrid() {
  const reducedMotion = useReducedMotionPreference()
  return (
    <nav aria-label="Plataformas sociais" className="grid grid-cols-5 gap-1.5 xl:content-center xl:gap-2">
      {profile.platforms.map((platform, index) => <PlatformItem key={platform.id} platform={platform} index={index} reducedMotion={reducedMotion} />)}
    </nav>
  )
}
