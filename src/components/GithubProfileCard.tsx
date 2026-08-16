import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { profile } from "../data/profile"
import { useGithubProfile, type GithubDataSource } from "../hooks/useGithubProfile"
import { useReducedMotionPreference } from "../hooks/useReducedMotionPreference"

const GITHUB_PATH = "M12 .297a12 12 0 0 0-3.793 23.389c.6.111.82-.261.82-.577v-2.234c-3.338.724-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.814 1.103.814 2.222v3.293c0 .319.216.694.825.576A12 12 0 0 0 12 .297"

const sourceLabels: Record<GithubDataSource, string> = {
  loading: profile.ui.github.loading,
  live: profile.ui.github.sourceLive,
  cached: profile.ui.github.sourceCached,
  mixed: profile.ui.github.sourceMixed,
  fallback: profile.ui.github.sourceFallback,
}

function GithubIcon({ className = "h-5 w-5" }: { className?: string }) {
  return <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor"><path d={GITHUB_PATH} /></svg>
}

export default function GithubProfileCard() {
  const [expanded, setExpanded] = useState(false)
  const { data, source } = useGithubProfile()
  const reducedMotion = useReducedMotionPreference()
  const duration = reducedMotion ? 0.01 : 0.34
  const repository = data.featuredRepository

  return (
    <motion.article layout className="relative overflow-hidden rounded-xl border border-cyan/25 bg-void/55 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--color-silver)_7%,transparent)]">
      <AnimatePresence>
        {expanded && !reducedMotion && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 z-20 w-20 bg-gradient-to-r from-transparent via-cyan/10 to-transparent blur-sm"
            initial={{ left: "-25%" }}
            animate={{ left: "115%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.62, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <button
        type="button"
        aria-expanded={expanded}
        aria-controls="github-dossier-details"
        aria-label={expanded ? profile.ui.github.collapse : profile.ui.github.expand}
        onClick={() => setExpanded((current) => !current)}
        className="group relative z-10 flex min-h-[68px] w-full items-center gap-3 px-3 py-2.5 text-left outline-none transition-colors hover:bg-cyan/5 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan xl:min-h-20 xl:px-4"
      >
        <span className="relative shrink-0">
          <img src={data.avatarUrl} alt="" width="44" height="44" decoding="async" referrerPolicy="no-referrer" className="h-11 w-11 rounded-lg border border-azure/45 object-cover xl:h-14 xl:w-14" />
          <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-md border border-cyan/35 bg-void text-cyan"><GithubIcon className="h-3 w-3" /></span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-display text-xs font-bold tracking-[0.06em] text-silver">{data.name}</span>
            <span className={`max-w-[8rem] shrink-0 truncate rounded border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.06em] ${source === "fallback" ? "border-violet/45 text-violet" : source === "mixed" ? "border-gold/50 text-gold" : "border-azure/45 text-azure"}`}>
              {sourceLabels[source]}
            </span>
          </span>
          <span className="mt-1 block truncate font-mono text-[10px] text-silver-dim">@{data.login}</span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-display text-[15px] text-cyan">{data.publicRepos}</span>
          <span className="font-mono text-[9px] tracking-[0.05em] text-silver-dim">{profile.ui.github.repositories}</span>
        </span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration }} className="ml-0.5 text-[13px] text-cyan" aria-hidden>⌄</motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id="github-dossier-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="relative border-t border-cyan/10 px-3 pb-3 pt-2.5">
              <span aria-hidden className="absolute left-0 top-0 h-px w-16 bg-cyan/70" />
              <p className="font-body text-xs leading-relaxed text-silver/85">{data.bio}</p>

              <div className="mt-2.5 grid grid-cols-4 gap-1.5">
                {[
                  [profile.ui.github.repositories, data.publicRepos],
                  [profile.ui.github.followers, data.followers],
                  [profile.ui.github.following, data.following],
                  [profile.ui.github.stars, data.totalStars],
                ].map(([label, value], index) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : 0.035 * index }} className="rounded-lg border border-azure/15 bg-azure/5 px-1 py-2 text-center">
                    <span className="block font-display text-[13px] text-azure">{value}</span>
                    <span className="mt-0.5 block truncate font-mono text-[9px] text-silver-dim">{label}</span>
                  </motion.div>
                ))}
              </div>

              {data.languages.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 overflow-hidden">
                  <span className="shrink-0 font-mono text-[10px] text-silver-dim">{profile.ui.github.languages}</span>
                  {data.languages.map((language) => <span key={language} className="truncate rounded-md border border-violet/25 bg-violet/5 px-1.5 py-1 font-mono text-[10px] text-violet">{language}</span>)}
                </div>
              )}

              {repository && (
                <a href={repository.url} target="_blank" rel="noopener noreferrer" aria-label={`${repository.name}, ${profile.ui.opensNewTab}`} className="group/repo mt-2.5 block rounded-lg border border-line bg-panel/65 p-2.5 outline-none transition-colors hover:border-azure/40 focus-visible:ring-2 focus-visible:ring-cyan">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-azure">{profile.ui.github.featured}</span>
                    <span className="font-mono text-[10px] text-silver-dim">★ {repository.stars} · ⑂ {repository.forks}</span>
                  </span>
                  <span className="mt-1 block truncate font-display text-[10px] tracking-[0.07em] text-silver group-hover/repo:text-cyan">{repository.name}</span>
                  <span className="mt-1 line-clamp-2 font-body text-[11px] leading-relaxed text-silver-dim">{repository.description}</span>
                </a>
              )}

              <a href={data.htmlUrl} target="_blank" rel="noopener noreferrer" aria-label={`${profile.ui.github.open}, ${profile.ui.opensNewTab}`} className="mt-2.5 flex min-h-11 items-center justify-between rounded-lg border border-cyan/25 bg-cyan/5 px-3 font-display text-[11px] tracking-[0.08em] text-cyan outline-none transition-colors hover:bg-cyan/10 focus-visible:ring-2 focus-visible:ring-cyan">
                <span className="flex items-center gap-2"><GithubIcon className="h-4 w-4" />{profile.ui.github.open}</span><span aria-hidden>↗</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}
