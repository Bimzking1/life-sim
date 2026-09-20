import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LocationId, Tone, UiHandlers } from '../ui/types'
import type { ActionsContext, GameState } from './types'
import { newGame, pushLog } from './state'
import { checkRandomEvent, resolveEventChoice } from './events'
import { buyItem, useInventoryItem } from './shop'
import { courseAction } from './courses'
import { runNpcInteraction } from './interact'
import { findLocation, travelDuration, locationDisabled } from '../data/locations'
import { advanceMinutes } from './time'
import { checkAchievements, applyPropertyUpgrade } from './achievements'
import { clearAutosave, loadAutosave, saveAutosave } from './autosave'
import { parseSaveFile, SaveError, serializeForDownload } from './save'
import { mulberry32, randomSeed } from './rng'
import { gameOverFromState } from './lifecycle'
import {
  selectCareer,
  selectClock,
  selectCourses,
  selectEvent,
  selectInventory,
  selectLocations,
  selectLog,
  selectMoney,
  selectNpcs,
  selectPlayer,
  selectProperties,
  selectStats,
  selectSummary,
} from './selectors'
import type { ToastItem } from '../components/Toasts'
import type { CueName } from 'uisfx'
import { playCue } from '../audio/audio'

export interface GameStoreView {
  showStart: boolean
  autosaveLabel: string | null
  autosaveDetail: string | null
  showEnd: boolean
  showConfirm: boolean
  toasts: ToastItem[]
  player: ReturnType<typeof selectPlayer>
  clock: ReturnType<typeof selectClock>
  stats: ReturnType<typeof selectStats>
  money: ReturnType<typeof selectMoney>
  locations: ReturnType<typeof selectLocations>
  currentLocationId: LocationId
  npcs: ReturnType<typeof selectNpcs>
  log: ReturnType<typeof selectLog>
  career: ReturnType<typeof selectCareer>
  courses: ReturnType<typeof selectCourses>
  inventory: ReturnType<typeof selectInventory>
  properties: ReturnType<typeof selectProperties>
  event: ReturnType<typeof selectEvent>
  summary: ReturnType<typeof selectSummary> | null
}

export interface GameStore {
  view: GameStoreView
  handlers: UiHandlers
  /** Immediately starts a brand-new life (used by the confirm dialog / end screen). */
  startFreshLife: () => void
  /** Closes the new-game confirmation dialog. */
  dismissConfirm: () => void
  /** Closes a toast by id. */
  dismissToast: (id: string) => void
}

const toneCue: Record<ToastItem['tone'], CueName> = {
  success: 'success',
  error: 'error',
  info: 'info',
}

export function useGame(): GameStore {
  const [game, setGame] = useState(() => newGame())
  const [showStart, setShowStart] = useState(true)
  const [showEnd, setShowEnd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [autosaveInfo, setAutosaveInfo] = useState<{ label: string | null; detail: string | null }>({ label: null, detail: null })
  const randRef = useRef<() => number>(mulberry32(randomSeed()))
  const timerRef = useRef<number | null>(null)
  const prevStateRef = useRef<GameState>(game)

  const setGameSync = useCallback((next: GameState) => {
    prevStateRef.current = next
    setGame(next)
  }, [])

  useEffect(() => {
    const info = loadAutosave()
    if (info) {
      setAutosaveInfo({ label: info.label, detail: info.detail })
      setShowStart(true)
    }
  }, [])

  const toast = useCallback((tone: ToastItem['tone'], text: string) => {
    playCue(toneCue[tone])
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts((t) => [...t, { id, tone, text }])
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 4500)
  }, [])

  // Commit a (mutated) draft to state, run housekeeping, autosave.
  const commit = useCallback(
    (draft: GameState) => {
      checkAchievements(draft)
      applyPropertyUpgrade(draft)
      gameOverFromState(draft)
      const prev = prevStateRef.current
      if (draft.achievements.length > prev.achievements.length) playCue('reward')
      if (!prev.events.pending && draft.events.pending) playCue('notification')
      if (draft.gameOver) {
        draft.events.pending = null
        setShowEnd(true)
      }
      setGameSync(draft)
      saveAutosave(draft)
    },
    [setGameSync],
  )

  const makeCtx = useCallback(
    (state: GameState): ActionsContext => ({
      advance: (minutes: number) => {
        advanceMinutes(state, minutes)
      },
      log: (text: string, tone: Tone = 'neutral') => pushLog(state, text, tone),
      toast: (tone: 'success' | 'error' | 'info', text: string) => toast(tone, text),
      checkEvents: (locationId: LocationId) => {
        checkRandomEvent(state, locationId, randRef.current)
      },
      openEvent: (event) => {
        state.events.pending = event
      },
    }),
    [toast],
  )

  const runAction = useCallback(
    (locationId: LocationId, actionId: string) => {
      const draft = structuredClone(game)
      if (draft.events.pending) return
      const def = findLocation(locationId)
      if (!def) return
      const action = def.actions.find((a) => a.id === actionId)
      if (!action) return
      const blocked = locationDisabled(draft, def) ?? (action.disabled ? action.disabled(draft) : null)
      if (blocked) {
        toast('error', blocked ?? 'You cannot do that right now.')
        return
      }
      const ctx = makeCtx(draft)
      if (action.durationMin > 0) ctx.advance(action.durationMin)
      action.run(draft, ctx)
      commit(draft)
    },
    [game, makeCtx, commit, toast],
  )

  const startFreshLife = useCallback(() => {
    clearAutosave()
    randRef.current = mulberry32(randomSeed())
    setGameSync(newGame())
    setShowStart(false)
    setShowEnd(false)
    setShowConfirm(false)
    setAutosaveInfo({ label: null, detail: null })
    toast('success', 'A new life begins.')
  }, [setGameSync, toast])

  const handlers: UiHandlers = useMemo(
    () => ({
      onNewGame: () => {
        if (game === null) {
          startFreshLife()
        } else {
          setShowConfirm(true)
        }
      },
      onSaveGame: () => {
        if (game.events.pending) {
          toast('info', 'Finish the current moment before saving.')
          return
        }
        const json = serializeForDownload(game)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'life-sim-save.json'
        a.click()
        URL.revokeObjectURL(url)
        toast('success', 'Save downloaded as life-sim-save.json.')
      },
      onLoadFile: (file: File) => {
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const state = parseSaveFile(JSON.parse(String(reader.result)))
            setGameSync(state)
            setShowStart(false)
            setShowEnd(false)
            saveAutosave(state)
            toast('success', 'Game loaded. Welcome back.')
          } catch (err) {
            toast('error', err instanceof SaveError ? err.message : 'Could not read that file.')
          }
        }
        reader.onerror = () => toast('error', 'Could not read that file.')
        reader.readAsText(file)
      },
      onContinueAutosave: () => {
        const info = loadAutosave()
        if (!info) {
          toast('error', 'No autosave found.')
          return
        }
        setGameSync(info.gameState)
        setShowStart(false)
        toast('success', 'Continue your life.')
      },
      onTravel: (id: LocationId) => {
        const draft = structuredClone(game)
        if (draft.player.currentLocation === id || draft.events.pending) return
        const def = findLocation(id)
        if (!def) return
        const mins = travelDuration(def, draft)
        draft.player.currentLocation = id
        if (mins > 0) advanceMinutes(draft, mins)
        pushLog(draft, `You arrived at the ${def.name}.`, 'neutral')
        commit(draft)
      },
      onAction: runAction,
      onBuy: (locationId: LocationId, itemId: string) => {
        const draft = structuredClone(game)
        if (draft.events.pending) return
        const err = buyItem(draft, locationId, itemId)
        if (err) {
          toast('error', err)
          return
        }
        commit(draft)
      },
      onNpcInteract: (npcId: string, actionId: string) => {
        const draft = structuredClone(game)
        if (draft.events.pending) return
        const err = runNpcInteraction(draft, npcId, actionId, makeCtx(draft))
        if (err) {
          toast('error', err)
          return
        }
        commit(draft)
      },
      onEventChoice: (eventId: string, choiceId: string) => {
        const draft = structuredClone(game)
        if (!draft.events.pending) return
        resolveEventChoice(draft, eventId, choiceId, makeCtx(draft))
        commit(draft)
      },
      onCourseAction: (courseId: string) => {
        const draft = structuredClone(game)
        if (draft.events.pending) return
        const ctx = makeCtx(draft)
        const status = isEnrollOrContinue(draft, courseId)
        const err = courseAction(draft, courseId)
        if (err) {
          toast('error', err)
          return
        }
        if (status === 'continue') ctx.advance(180)
        else ctx.advance(30)
        commit(draft)
      },
      onUseItem: (itemId: string) => {
        const draft = structuredClone(game)
        if (draft.events.pending) return
        const err = useInventoryItem(draft, itemId)
        if (err) {
          toast('error', err)
          return
        }
        commit(draft)
      },
      onStartNewLife: startFreshLife,
    }),
    [game, runAction, makeCtx, commit, toast, startFreshLife],
  )

  const view = useMemo<GameStoreView>(() => {
    const summary = game.gameOver ? selectSummary(game) : null
    return {
      showStart,
      autosaveLabel: showStart ? autosaveInfo.label : null,
      autosaveDetail: showStart ? autosaveInfo.detail : null,
      showEnd,
      showConfirm,
      toasts,
      player: selectPlayer(game),
      clock: selectClock(game),
      stats: selectStats(game),
      money: selectMoney(game),
      locations: selectLocations(game),
      currentLocationId: game.player.currentLocation,
      npcs: selectNpcs(game),
      log: selectLog(game),
      career: selectCareer(game),
      courses: selectCourses(game),
      inventory: selectInventory(game),
      properties: selectProperties(game),
      event: selectEvent(game),
      summary,
    }
  }, [game, showStart, autosaveInfo.label, autosaveInfo.detail, showEnd, showConfirm, toasts])

  const dismissConfirm = useCallback(() => setShowConfirm(false), [])
  const dismissToast = useCallback((id: string) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  return { view, handlers, startFreshLife, dismissConfirm, dismissToast }
}

function isEnrollOrContinue(state: GameStateLike, courseId: string): 'enroll' | 'continue' {
  return state.education.completed.includes(courseId) || state.education.progress[courseId] > 0 || state.education.enrolled === courseId
    ? 'continue'
    : 'enroll'
}

interface GameStateLike {
  education: { completed: string[]; enrolled: string | null; progress: Record<string, number> }
}