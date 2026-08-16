import { useState } from "react"
import { motion } from "motion/react"
import { profile } from "../data/profile"
import { useMusic } from "./MusicProvider"

const GLYPH = "⌖"

export default function ProfilePhoto() {
  const [failed, setFailed] = useState(false)
  const { playing, status } = useMusic()
  const photo = profile.media.photo
  const showImage = !failed

  return (
    <motion.div
      className="group relative aspect-square w-full select-none"
      initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, rotate: 1 }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        aria-hidden
        className="absolute inset-1 rounded-[18px] bg-cyan/25 blur-lg transition-opacity duration-500"
        style={{
          opacity: playing ? "calc(0.3 + var(--audio-energy, 0) * 0.45)" : 0.14,
          transform: "scale(calc(1 + var(--audio-energy, 0) * 0.06))",
        }}
      />
      <div className="relative h-full w-full rounded-[18px] bg-gradient-to-br from-cyan/80 via-azure/45 to-violet/70 p-px shadow-[0_12px_28px_-18px_var(--color-cyan)]">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[17px] bg-void">
          {showImage ? (
            <picture className="h-full w-full">
              <source type="image/avif" srcSet={photo.avifSrcSet} sizes="84px" />
              <source type="image/webp" srcSet={photo.webpSrcSet} sizes="84px" />
              <img src={photo.fallback} alt={profile.name} width={photo.width} height={photo.height} decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" draggable={false} onError={() => setFailed(true)} />
            </picture>
          ) : (
            <>
              <div className="absolute inset-0 opacity-[0.12] [background:repeating-linear-gradient(0deg,var(--color-silver)_0px,var(--color-silver)_1px,transparent_1px,transparent_3px)]" />
              <span className="relative font-display text-2xl text-cyan">{GLYPH}</span>
            </>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/45 via-transparent to-azure/10" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-silver/35" />
        </div>
      </div>
      <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-panel ${status === "error" ? "bg-rose" : playing ? "bg-cyan shadow-[0_0_10px_var(--color-cyan)]" : "bg-azure"}`} aria-label={profile.audio.statusLabels[status]} />
    </motion.div>
  )
}
