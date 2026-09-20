// Singleton audio system: one shared AudioContext, a uisfx player for UI sounds
// (scifi pack, synthesized locally), the ambient music engine, and a small
// persisted settings store for sound effects and music on/off.

import { useSyncExternalStore } from 'react'
import { createUISFX, type CueName, type PlayOptions, type UISFXPlayer } from 'uisfx'
import { MUSIC_ENABLED_KEY, SFX_ENABLED_KEY } from '../game/constants'
import { startAmbientMusic, stopAmbientMusic } from './music'

export interface AudioSettings {
  sfx: boolean
  music: boolean
}

/** Cues preloaded after the first user gesture to avoid first-click latency. */
const PRELOAD_CUES: CueName[] = [
  'press',
  'select',
  'start',
  'open',
  'close',
  'back',
  'success',
  'error',
  'info',
  'notification',
  'reward',
  'complete',
  'warning',
  'checkpoint',
  'delete',
  'purchase',
  'toggle-on',
  'toggle-off',
  'volume-change',
]

function loadBool(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return raw === 'true'
  } catch {
    return fallback
  }
}

let context: AudioContext | null = null
let player: UISFXPlayer | null = null
let sfxEnabled = loadBool(SFX_ENABLED_KEY, true)
let musicEnabled = loadBool(MUSIC_ENABLED_KEY, true)
let locked = true
let listeners = new Set<() => void>()
let snapshot: AudioSettings = { sfx: sfxEnabled, music: musicEnabled }

function ensurePlayer(): UISFXPlayer {
  if (!player) {
    context = context ?? new window.AudioContext()
    player = createUISFX({ context, pack: 'scifi', enabled: sfxEnabled })
  }
  return player
}

function updateSnapshot(patch: Partial<AudioSettings>): void {
  snapshot = { ...snapshot, ...patch }
  listeners.forEach((l) => l())
}

export function getAudioSettings(): AudioSettings {
  return snapshot
}

export function subscribeAudioSettings(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** React hook for the audio settings. */
export function useAudioSettings(): AudioSettings {
  return useSyncExternalStore(subscribeAudioSettings, getAudioSettings)
}

/** Plays a UI sound effect immediately (no-op while sfx are muted). */
export function playCue(cue: CueName, options?: Pick<PlayOptions, 'volume'>): void {
  if (!sfxEnabled) return
  try {
    ensurePlayer().play(cue, options)
  } catch {
    /* audio not available yet — ignore */
  }
}

export function setSfxEnabled(enabled: boolean): void {
  sfxEnabled = enabled
  try {
    localStorage.setItem(SFX_ENABLED_KEY, String(enabled))
  } catch {
    /* storage unavailable */
  }
  player?.setEnabled(enabled)
  updateSnapshot({ sfx: enabled })
}

export function setMusicEnabled(enabled: boolean): void {
  musicEnabled = enabled
  try {
    localStorage.setItem(MUSIC_ENABLED_KEY, String(enabled))
  } catch {
    /* storage unavailable */
  }
  if (enabled) {
    if (context) startAmbientMusic(context)
    else void ensureAudio()
  } else {
    stopAmbientMusic()
  }
  updateSnapshot({ music: enabled })
}

/**
 * Unlocks audio on the first user gesture (autoplay policy) and starts music
 * if enabled. Safe to call multiple times.
 */
export async function ensureAudio(): Promise<void> {
  if (!locked) return
  locked = false
  try {
    const p = ensurePlayer()
    await p.unlock()
    void p.preload(PRELOAD_CUES)
    if (musicEnabled && context) startAmbientMusic(context)
  } catch {
    /* audio failed to start — game continues silently */
  }
}

/**
 * Global button sound wiring. Delegated `pointerdown` plays a soft press for
 * every button; buttons with a `data-sfx="cue"` attribute skip the generic
 * press and play their own cue on click instead (`data-sfx="none"` opts out
 * of sounds entirely). The first interaction also unlocks the audio context.
 */
export function bindGlobalSfx(): () => void {
  const nearestButton = (target: EventTarget | null): HTMLElement | null =>
    (target as HTMLElement | null)?.closest?.('button, [role="button"]') ?? null

  const hasCue = (el: HTMLElement) => el.hasAttribute('data-sfx') && el.getAttribute('data-sfx') !== 'none'

  const handlePointerDown = (e: PointerEvent) => {
    void ensureAudio()
    const el = nearestButton(e.target)
    if (el && !hasCue(el)) playCue('press')
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const el = nearestButton(e.target)
    if (el && !hasCue(el)) playCue('press')
  }

  const handleClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement | null)?.closest?.('[data-sfx]')
    if (el) {
      const cue = el.getAttribute('data-sfx')
      if (cue && cue !== 'none') playCue(cue as CueName)
    }
  }

  const onVisibility = () => {
    if (!context) return
    if (document.hidden) {
      if (musicEnabled) stopAmbientMusic()
    } else if (musicEnabled) {
      startAmbientMusic(context)
    }
  }

  document.addEventListener('pointerdown', handlePointerDown)
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('click', handleClick)
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    document.removeEventListener('pointerdown', handlePointerDown)
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('click', handleClick)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}