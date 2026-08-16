import { useCallback, useEffect, useState, type RefObject } from "react"

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00"
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

export function useAudioTimeline(audioRef: RefObject<HTMLAudioElement | null>) {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const updateTime = () => setCurrentTime(audio.currentTime || 0)
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const reset = () => {
      setCurrentTime(0)
      setDuration(0)
    }
    updateTime()
    updateDuration()
    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("durationchange", updateDuration)
    audio.addEventListener("emptied", reset)
    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("durationchange", updateDuration)
      audio.removeEventListener("emptied", reset)
    }
  }, [audioRef])

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(seconds)) return
    audio.currentTime = Math.min(Math.max(0, seconds), Number.isFinite(audio.duration) ? audio.duration : seconds)
    setCurrentTime(audio.currentTime)
  }, [audioRef])

  return {
    currentTime,
    duration,
    progress: duration > 0 ? currentTime / duration : 0,
    formattedCurrentTime: formatTime(currentTime),
    formattedDuration: formatTime(duration),
    seekTo,
  }
}
