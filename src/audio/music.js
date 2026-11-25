// Kerstdeuntje op de achtergrond, live gemaakt met de Web Audio API (geen audiobestand nodig).
// Een speeldoos-medley van twee traditionele kerstliedjes (publiek domein):
// "Jingle Bells" en "Deck the Halls", met een zachte bas, akkoorden en arrensleebelletjes.

const BPM = 112
const SPB = 65 / BPM // seconden per tel
const VOLUME = 0.15

// ---------- Noten ----------
const STEPS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const freq = (name) => {
  const [, letter, accidental, octave] = name.match(/^([A-G])([#b]?)(\d)$/)
  const midi = 12 * (Number(octave) + 1) + STEPS[letter] + (accidental === '#' ? 1 : accidental === 'b' ? -1 : 0)
  return 440 * 2 ** ((midi - 69) / 12)
}

// "E4:1 G4:0.5 | ..." -> [{ note, beats }]
const melody = (text) =>
  text
    .split(/\s+/)
    .filter((t) => t && t !== '|')
    .map((t) => {
      const [note, beats] = t.split(':')
      return { note, beats: Number(beats) }
    })

const CHORDS = {
  C: { bass: ['C3', 'G2'], tones: ['E4', 'G4', 'C5'] },
  F: { bass: ['F2', 'C3'], tones: ['F4', 'A4', 'C5'] },
  G: { bass: ['G2', 'D3'], tones: ['D4', 'G4', 'B4'] },
  D: { bass: ['D3', 'A2'], tones: ['D4', 'F#4', 'A4'] },
}

const SONGS = [
  {
    // Jingle Bells (refrein)
    bells: true,
    melody: melody(`
      E4:1 E4:1 E4:2 | E4:1 E4:1 E4:2 | E4:1 G4:1 C4:1.5 D4:0.5 | E4:4 |
      F4:1 F4:1 F4:1.5 F4:0.5 | F4:1 E4:1 E4:1 E4:0.5 E4:0.5 | E4:1 D4:1 D4:1 E4:1 | D4:2 G4:2 |
      E4:1 E4:1 E4:2 | E4:1 E4:1 E4:2 | E4:1 G4:1 C4:1.5 D4:0.5 | E4:4 |
      F4:1 F4:1 F4:1.5 F4:0.5 | F4:1 E4:1 E4:1 E4:0.5 E4:0.5 | G4:1 G4:1 F4:1 D4:1 | C4:4
    `),
    chords: 'C C C C F C G G C C C C F C G C',
  },
  {
    // Deck the Halls
    bells: false,
    melody: melody(`
      G4:1.5 F4:0.5 E4:1 D4:1 | C4:1 D4:1 E4:1 C4:1 | D4:0.5 E4:0.5 F4:0.5 D4:0.5 E4:1.5 D4:0.5 | C4:1 B3:1 C4:2 |
      G4:1.5 F4:0.5 E4:1 D4:1 | C4:1 D4:1 E4:1 C4:1 | D4:0.5 E4:0.5 F4:0.5 D4:0.5 E4:1.5 D4:0.5 | C4:1 B3:1 C4:2 |
      D4:1.5 E4:0.5 F4:1 D4:1 | E4:1.5 F4:0.5 G4:1 D4:1 | E4:0.5 F#4:0.5 G4:1 A4:0.5 B4:0.5 C5:1 | B4:1 A4:1 G4:2 |
      G4:1.5 F4:0.5 E4:1 D4:1 | C4:1 D4:1 E4:1 C4:1 | A4:0.5 A4:0.5 A4:0.5 A4:0.5 G4:1.5 F4:0.5 | E4:1 D4:1 C4:2
    `),
    chords: 'C C G C C C G C G C D G C C F C',
  },
]

// ---------- Klanken ----------
// Speeldoos/celesta: sinus met een paar boventonen en een lange uitklank
function musicBox(ctx, out, f, t, vol) {
  const length = 1.6
  const env = ctx.createGain()
  env.gain.setValueAtTime(0, t)
  env.gain.linearRampToValueAtTime(vol, t + 0.006)
  env.gain.exponentialRampToValueAtTime(0.0001, t + length)
  env.connect(out)
  for (const [mult, amp] of [[1, 1], [2, 0.32], [3.01, 0.1], [4.2, 0.05]]) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.frequency.value = f * mult
    g.gain.value = amp
    osc.connect(g).connect(env)
    osc.start(t)
    osc.stop(t + length + 0.05)
  }
}

function softTone(ctx, out, f, t, vol, length, type = 'sine') {
  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = type
  osc.frequency.value = f
  env.gain.setValueAtTime(0, t)
  env.gain.linearRampToValueAtTime(vol, t + 0.02)
  env.gain.exponentialRampToValueAtTime(0.0001, t + length)
  osc.connect(env).connect(out)
  osc.start(t)
  osc.stop(t + length + 0.05)
}

let noiseBuffer = null
function sleighBell(ctx, out, t, vol) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  }
  const src = ctx.createBufferSource()
  const filter = ctx.createBiquadFilter()
  const env = ctx.createGain()
  src.buffer = noiseBuffer
  filter.type = 'bandpass'
  filter.frequency.value = 7500
  filter.Q.value = 1.5
  env.gain.setValueAtTime(vol, t)
  env.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
  src.connect(filter).connect(env).connect(out)
  src.start(t)
  src.stop(t + 0.2)
}

// ---------- Partituur -> lijst van gebeurtenissen (in tellen) ----------
const EVENTS = []
let cursor = 0
for (const song of SONGS) {
  let beat = cursor
  for (const { note, beats } of song.melody) {
    const f = freq(note) * 2 // een octaaf hoger: helder speeldoosgeluid
    EVENTS.push({ beat, play: (ctx, out, t) => musicBox(ctx, out, f, t, 0.16) })
    beat += beats
  }
  song.chords.split(' ').forEach((name, bar) => {
    const chord = CHORDS[name]
    const start = cursor + bar * 4
    chord.bass.forEach((n, i) => {
      const f = freq(n)
      EVENTS.push({ beat: start + i * 2, play: (ctx, out, t) => softTone(ctx, out, f, t, 0.13, SPB * 1.8, 'triangle') })
    })
    for (const off of [1, 3]) {
      chord.tones.forEach((n) => {
        const f = freq(n)
        EVENTS.push({ beat: start + off, play: (ctx, out, t) => softTone(ctx, out, f, t, 0.025, SPB * 0.9) })
      })
    }
    if (song.bells) {
      for (let b = 0; b < 4; b += 0.5) {
        const vol = b % 1 === 0 ? 0.05 : 0.025
        EVENTS.push({ beat: start + b, play: (ctx, out, t) => sleighBell(ctx, out, t, vol) })
      }
    }
  })
  cursor += song.chords.split(' ').length * 4 + 4 // één maat rust tussen de liedjes
}
EVENTS.sort((a, b) => a.beat - b.beat)
const LOOP_BEATS = cursor

// ---------- Afspelen ----------
let ctx = null
let master = null
let timer = null
let stopTimer = null
let playing = false
let next = 0
let loopStart = 0

function setup() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  ctx = new AudioCtx()
  master = ctx.createGain()
  master.gain.value = 0

  // Een beetje galm voor een gezellige, ruimtelijke klank
  const delay = ctx.createDelay()
  const feedback = ctx.createGain()
  const wet = ctx.createGain()
  delay.delayTime.value = 0.27
  feedback.gain.value = 0.28
  wet.gain.value = 0.22
  master.connect(ctx.destination)
  master.connect(delay)
  delay.connect(feedback).connect(delay)
  delay.connect(wet).connect(ctx.destination)

  // Tab op de achtergrond: even pauzeren
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) ctx.suspend()
    else if (playing) ctx.resume()
  })
  return ctx
}

function schedule() {
  const ahead = ctx.currentTime + 0.3
  for (;;) {
    const ev = EVENTS[next]
    const t = loopStart + ev.beat * SPB
    if (t > ahead) break
    if (t >= ctx.currentTime - 0.05) ev.play(ctx, master, t)
    next++
    if (next >= EVENTS.length) {
      next = 0
      loopStart += LOOP_BEATS * SPB
    }
  }
}

// De gedeelde AudioContext (ook voor geluidseffecten), of null zolang er nog geen klik was
export const getContext = () => ctx

// Moet vanuit een klik/tik worden aangeroepen (browsers laten pas dan geluid toe)
export function unlock() {
  if (!ctx && !setup()) return Promise.resolve()
  return ctx.state === 'running' ? Promise.resolve() : ctx.resume().catch(() => {})
}

// Start de muziek (zacht infaden). Geeft false terug als de browser nog geen geluid toelaat.
export function play() {
  if (!ctx || ctx.state !== 'running') return false
  clearTimeout(stopTimer)
  const now = ctx.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(master.gain.value, now)
  master.gain.linearRampToValueAtTime(VOLUME, now + 2)
  if (!timer) {
    next = 0
    loopStart = now + 0.15
    schedule()
    timer = setInterval(schedule, 60)
  }
  playing = true
  return true
}

// Stopt de muziek (zacht uitfaden)
export function stop() {
  playing = false
  if (!ctx) return
  const now = ctx.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(master.gain.value, now)
  master.gain.linearRampToValueAtTime(0, now + 0.8)
  clearTimeout(stopTimer)
  stopTimer = setTimeout(() => {
    clearInterval(timer)
    timer = null
  }, 900)
}

// Tijdens ontwikkelen: als deze code opnieuw geladen wordt, de oude muziek echt afzetten
// (anders blijft er een "verweesde" versie spelen die niemand meer kan stoppen)
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearInterval(timer)
    clearTimeout(stopTimer)
    ctx?.close()
  })
}
