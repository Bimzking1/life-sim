// Procedural ambient background music generated live with the Web Audio API.
// No audio files, no copyrighted material — a slow focus-style pad loop with
// sparse pentatonic sparkle notes and a gentle breathing filter.

const CHORDS: number[][] = [
  [57, 60, 64, 71], // Am add9
  [53, 57, 60, 64], // Fmaj9
  [48, 52, 55, 62], // C add9
  [50, 55, 62, 64], // G sus2 (add4)
]

const SPARKLE = [81, 76, 74, 72, 79, 74]

const CHORD_SECONDS = 8

function hz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}

let bus: GainNode | null = null
let lfo: OscillatorNode | null = null
let timer: ReturnType<typeof setInterval> | null = null
let context: AudioContext | null = null
let chordIndex = 0
let nextAt = 0

function playChord(ac: AudioContext, out: GainNode, t: number, notes: number[]): void {
  notes.forEach((midi, i) => {
    const f = hz(midi)
    voice(ac, out, t, f, 0.052, 1.0015)
    voice(ac, out, t, f, 0.052, 0.9985)
    if (i === 0) voice(ac, out, t, f / 2, 0.048, 1, 3.6)
  })
}

/** One soft sine pad with a slow attack/release. */
function voice(ac: AudioContext, out: AudioNode, t: number, freq: number, peak: number, detune: number, peakAt = 2.2): void {
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = freq * detune
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.0001), t + 0.1)
  g.gain.linearRampToValueAtTime(peak, t + Math.min(peakAt, CHORD_SECONDS * 0.3))
  g.gain.setValueAtTime(peak, t + CHORD_SECONDS - 1.8)
  g.gain.exponentialRampToValueAtTime(0.0001, t + CHORD_SECONDS + 0.2)
  osc.connect(g)
  g.connect(out)
  osc.start(t)
  osc.stop(t + CHORD_SECONDS + 0.5)
  g.gain.setValueAtTime(0.0001, t + CHORD_SECONDS + 0.2)
}

/** One short pentatonic pluck, gently panned and sparse. */
function playPluck(ac: AudioContext, out: GainNode, t: number, midi: number, side: number): void {
  const f = hz(midi)
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = f
  const octave = ac.createOscillator()
  octave.type = 'sine'
  octave.frequency.value = f * 2
  const g = ac.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.032, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.7)
  const panner = ac.createStereoPanner()
  panner.pan.value = side
  osc.connect(g)
  octave.connect(g)
  g.connect(panner)
  panner.connect(out)
  osc.start(t)
  octave.start(t)
  osc.stop(t + 2)
  octave.stop(t + 2)
}

function schedule(): void {
  if (!context || !bus) return
  while (nextAt < context.currentTime + 1.6) {
    const chord = CHORDS[chordIndex % CHORDS.length]
    playChord(context, bus, nextAt, chord)
    if (chordIndex % 2 === 1) {
      const midi = SPARKLE[Math.floor(chordIndex / 2) % SPARKLE.length]
      const side = chordIndex % 4 === 1 ? -0.3 : 0.3
      playPluck(context, bus, nextAt + CHORD_SECONDS / 2, midi, side)
    }
    chordIndex += 1
    nextAt += CHORD_SECONDS
  }
}

/** Starts (or resumes) the ambient loop into the given context. No-op if already running. */
export function startAmbientMusic(ac: AudioContext): void {
  if (bus) return
  context = ac

  const master = ac.createGain()
  master.gain.value = 0
  const lp = ac.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 820
  lp.Q.value = 0.4
  master.connect(lp)
  lp.connect(ac.destination)

  // Slow breathing swell.
  lfo = ac.createOscillator()
  lfo.frequency.value = 0.09
  const lfoDepth = ac.createGain()
  lfoDepth.gain.value = 0.028
  lfo.connect(lfoDepth)
  lfoDepth.connect(master.gain)
  lfo.start()

  const t = ac.currentTime
  master.gain.setValueAtTime(0.0001, t)
  master.gain.exponentialRampToValueAtTime(0.07, t + 2.5)

  bus = master
  chordIndex = 0
  nextAt = t + 0.15
  schedule()
  timer = setInterval(schedule, 500)
}

/** Fades the loop out and stops scheduling. */
export function stopAmbientMusic(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  try {
    lfo?.stop()
  } catch {
    /* already stopped */
  }
  lfo = null
  const current = bus
  bus = null
  if (current) {
    const ac = current.context as AudioContext
    const t = ac.currentTime
    current.gain.cancelScheduledValues(t)
    current.gain.setValueAtTime(current.gain.value, t)
    current.gain.linearRampToValueAtTime(0, t + 0.5)
    window.setTimeout(() => {
      try {
        current.disconnect()
      } catch {
        /* already disconnected */
      }
    }, 600)
  }
  context = null
}