import { profile } from "./data/profile"
import { isMotionReduced, subscribeMotionPreference } from "./hooks/useMotionPreference"

/**
 * Anima o <title> da aba do navegador com efeito de "cifragem".
 * O nome CYPHER aparece, depois embaralha em ruido base64 e reconstrói, em loop.
 * Combina com o tema do card (glifo ⌖ + estetica terminal).
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
const TARGET = profile.ui.tabTitle

// duracao em ms de cada "frame" de embaralhamento
const TICK = 70
// quantos ticks a mensagem clara fica visivel antes de re-cifrar
const HOLD_TICKS = 36
// quantos caracteres revelam por tick (velocidade da reconstrucao)
let frame = 0
let timer: ReturnType<typeof setInterval> | null = null
let syncListener: (() => void) | null = null
let unsubscribeMotion: (() => void) | null = null

function scramble(upTo: number): string {
  let out = ""
  for (let i = 0; i < TARGET.length; i++) {
    if (i < upTo) {
      out += TARGET[i]
    } else {
      out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    }
  }
  return out
}

function render() {
  const titleEl = document.querySelector("title")
  if (!titleEl) return

  // ciclo: hold (mensagem clara) -> embaralha -> reconstrói
  const cycle = frame % (HOLD_TICKS + TARGET.length + 8)
  let text: string

  if (cycle < HOLD_TICKS) {
    // mensagem clara
    text = TARGET
  } else if (cycle < HOLD_TICKS + 6) {
    // totalmente embaralhado
    text = scramble(0)
  } else {
    // reconstruindo, caractere a caractere
    const revealed = Math.min(TARGET.length, cycle - (HOLD_TICKS + 6))
    text = scramble(revealed)
  }

  titleEl.textContent = text
  frame++
}

export function startTabTitleAnimation() {
  if (syncListener) return
  const titleEl = document.querySelector("title")
  if (titleEl) titleEl.textContent = TARGET
  const sync = () => {
    if (document.visibilityState !== "visible" || isMotionReduced()) {
      if (timer) clearInterval(timer)
      timer = null
      if (titleEl) titleEl.textContent = TARGET
    } else if (!timer) {
      timer = setInterval(render, TICK)
    }
  }
  document.addEventListener("visibilitychange", sync)
  unsubscribeMotion = subscribeMotionPreference(sync)
  syncListener = sync
  sync()
}

export function stopTabTitleAnimation() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (syncListener) {
    document.removeEventListener("visibilitychange", syncListener)
    syncListener = null
  }
  unsubscribeMotion?.()
  unsubscribeMotion = null
  document.title = TARGET
}
