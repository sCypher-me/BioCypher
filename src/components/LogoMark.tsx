import { motion } from "motion/react"
import { profile } from "../data/profile"
import { useReducedMotionPreference } from "../hooks/useReducedMotionPreference"

/** Logo com glow pulsante + anel de rotação lenta (o "all-seeing" em foco). */
export default function LogoMark() {
  const reducedMotion = useReducedMotionPreference()
  const logo = profile.media.logo
  return (
    <motion.div
      className="relative grid place-items-center"
      initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* anel giratório */}
      <motion.div
        className="absolute h-44 w-44 rounded-full border border-line/60 sm:h-52 sm:w-52"
        style={{ borderStyle: "dashed" }}
        animate={{ rotate: reducedMotion ? 0 : 360 }}
        transition={{ duration: 40, ease: "linear", repeat: reducedMotion ? 0 : Infinity }}
      />
      <motion.div
        className="absolute h-40 w-40 rounded-full border border-azure/30 sm:h-48 sm:w-48"
        animate={{ rotate: reducedMotion ? 0 : -360 }}
        transition={{ duration: 60, ease: "linear", repeat: reducedMotion ? 0 : Infinity }}
      />

      {/* glow pulsante atrás da logo */}
      <motion.div
        className="absolute h-32 w-32 rounded-full blur-2xl sm:h-44 sm:w-44"
        style={{ background: "var(--color-azure)" }}
        animate={{ opacity: reducedMotion ? 0.35 : [0.25, 0.5, 0.25] }}
        transition={{ duration: 4, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
      />

      {/* a logo em si */}
      <motion.picture
        className="relative"
        animate={{ y: reducedMotion ? 0 : [0, -6, 0] }}
        transition={{ duration: 6, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut" }}
      >
        <source type="image/avif" srcSet={logo.avifSrcSet} sizes="176px" />
        <source type="image/webp" srcSet={logo.webpSrcSet} sizes="176px" />
        <img src={logo.fallback} alt={profile.handle} width={logo.width} height={logo.height} decoding="async" className="h-32 w-auto drop-shadow-[0_0_24px_color-mix(in_oklab,var(--color-azure)_45%,transparent)] sm:h-44" />
      </motion.picture>
    </motion.div>
  )
}
