import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { profile } from "../data/profile"

export type AudioStatus = "idle" | "loading" | "ready" | "playing" | "paused" | "error"

type MusicState = {
  status: AudioStatus
  playing: boolean
  ready: boolean
  muted: boolean
  volume: number
  title: string
  artist: string
  play: (volumeOverride?: number) => void
  pause: () => void
  toggle: () => void
  toggleMute: () => void
  setVolume: (v: number) => void
  audioRef: React.RefObject<HTMLAudioElement | null>
  analyserRef: React.RefObject<AnalyserNode | null>
}

const Ctx = createContext<MusicState | null>(null)
const VOLUME_KEY = "cypher:volume"
const MUTED_KEY = "cypher:muted"

function storedVolume() {
  const value = Number(window.localStorage.getItem(VOLUME_KEY))
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : profile.audio.initialVolume
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const graphUnavailableRef = useRef(false)
  const [status, setStatus] = useState<AudioStatus>("idle")
  const [volume, setVolumeState] = useState(storedVolume)
  const [muted, setMuted] = useState(() => window.localStorage.getItem(MUTED_KEY) === "1")

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
    audio.muted = muted
    const onLoadStart = () => setStatus("loading")
    const onCanPlay = () => setStatus((current) => current === "playing" ? current : "ready")
    const onPlay = () => setStatus((current) => current === "playing" ? current : "loading")
    const onPlaying = () => setStatus("playing")
    const onPause = () => setStatus((current) => current === "error" ? current : "paused")
    const onError = () => setStatus("error")
    const onWaiting = () => setStatus((current) => audio.paused || current === "error" ? current : "loading")
    audio.addEventListener("loadstart", onLoadStart)
    audio.addEventListener("canplay", onCanPlay)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("playing", onPlaying)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("error", onError)
    audio.addEventListener("waiting", onWaiting)
    audio.addEventListener("stalled", onWaiting)
    return () => {
      audio.removeEventListener("loadstart", onLoadStart)
      audio.removeEventListener("canplay", onCanPlay)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("playing", onPlaying)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("error", onError)
      audio.removeEventListener("waiting", onWaiting)
      audio.removeEventListener("stalled", onWaiting)
    }
  }, [muted, volume])

  useEffect(() => () => {
    sourceRef.current?.disconnect()
    analyserRef.current?.disconnect()
    if (ctxRef.current && ctxRef.current.state !== "closed") void ctxRef.current.close()
  }, [])

  const ensureGraph = useCallback(() => {
    const audio = audioRef.current
    if (!audio || graphUnavailableRef.current) return false
    if (ctxRef.current) {
      if (ctxRef.current.state === "suspended") void ctxRef.current.resume()
      return true
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return false
    let context: AudioContext | null = null
    try {
      context = new AC()
      const source = context.createMediaElementSource(audio)
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.82
      source.connect(analyser)
      analyser.connect(context.destination)
      ctxRef.current = context
      sourceRef.current = source
      analyserRef.current = analyser
      return true
    } catch {
      graphUnavailableRef.current = true
      if (context && context.state !== "closed") void context.close()
      return false
    }
  }, [])

  const play = useCallback((volumeOverride?: number) => {
    const audio = audioRef.current
    if (!audio || status === "error") return
    ensureGraph()
    const playbackVolume = volumeOverride === undefined
      ? volume
      : Math.min(1, Math.max(0, volumeOverride))
    if (volumeOverride !== undefined) {
      setVolumeState(playbackVolume)
      window.localStorage.setItem(VOLUME_KEY, String(playbackVolume))
    }
    audio.volume = playbackVolume
    audio.muted = muted
    void audio.play().catch((error: unknown) => {
      const name = error instanceof DOMException ? error.name : ""
      if (name === "NotAllowedError" || name === "AbortError") {
        setStatus(audio.readyState >= HTMLMediaElement.HAVE_METADATA ? "ready" : "paused")
        return
      }
      setStatus("error")
    })
  }, [ensureGraph, muted, status, volume])

  const pause = useCallback(() => audioRef.current?.pause(), [])
  const toggle = useCallback(() => {
    if (audioRef.current?.paused) play()
    else pause()
  }, [pause, play])

  const setVolume = useCallback((value: number) => {
    const next = Math.min(1, Math.max(0, value))
    setVolumeState(next)
    window.localStorage.setItem(VOLUME_KEY, String(next))
    if (audioRef.current) audioRef.current.volume = next
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current
      window.localStorage.setItem(MUTED_KEY, next ? "1" : "0")
      if (audioRef.current) audioRef.current.muted = next
      return next
    })
  }, [])

  useEffect(() => {
    if (status !== "playing") {
      document.documentElement.style.setProperty("--audio-energy", "0")
      return
    }
    const data = new Uint8Array(32)
    let raf = 0
    let last = 0
    const sample = (time: number) => {
      raf = requestAnimationFrame(sample)
      if (document.visibilityState !== "visible" || time - last < 66) return
      last = time
      const analyser = analyserRef.current
      if (!analyser) return
      analyser.getByteFrequencyData(data)
      const bass = data.slice(0, 10).reduce((sum, value) => sum + value, 0) / 2550
      document.documentElement.style.setProperty("--audio-energy", bass.toFixed(3))
    }
    raf = requestAnimationFrame(sample)
    return () => cancelAnimationFrame(raf)
  }, [status])

  const value = useMemo<MusicState>(() => ({
    status,
    playing: status === "playing",
    ready: status === "ready" || status === "playing" || status === "paused",
    muted,
    volume,
    title: profile.audio.title,
    artist: profile.audio.artist,
    play,
    pause,
    toggle,
    toggleMute,
    setVolume,
    audioRef,
    analyserRef,
  }), [muted, pause, play, setVolume, status, toggle, toggleMute, volume])

  return (
    <Ctx.Provider value={value}>
      <audio ref={audioRef} src={profile.audio.src} loop preload="metadata" />
      {children}
    </Ctx.Provider>
  )
}

export function useMusic() {
  const value = useContext(Ctx)
  if (!value) throw new Error("useMusic must be used inside MusicProvider")
  return value
}
