// Buitengeluid: een rustig winters deuntje met wind, in een naadloze lus.
// Muziek: "Winter Wind" door wipics, CC0 (publiek domein)
// https://opengameart.org/node/114089

import { getContext } from './music.js'

const URL = `${import.meta.env.BASE_URL}sounds/winter-wind.mp3`
const LOOP_END = 80.0 // daarna volgt in het bestand nog ~1,7 s stilte: die slaan we over
const VOLUME = 0.02

let bytes = null
let decoded = null
let out = null // eigen volumeknop voor het buitengeluid
let source = null
let stopTimer = null
let wanted = false // moet het nu spelen?

// Het bestand alvast ophalen
export function preloadAmbience() {
  if (!bytes) {
    bytes = fetch(URL)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null)
  }
  return bytes
}

async function getBuffer(ctx) {
  if (decoded) return decoded
  const data = await preloadAmbience()
  if (!data) return null
  decoded = await ctx.decodeAudioData(data.slice(0))
  return decoded
}

// Start het buitengeluid (zacht infaden). Geeft false terug als de browser nog geen geluid toelaat.
export function play() {
  const ctx = getContext()
  if (!ctx || ctx.state !== 'running') return false
  wanted = true
  clearTimeout(stopTimer)
  if (!out) {
    out = ctx.createGain()
    out.gain.value = 0
    out.connect(ctx.destination)
  }
  const fadeIn = () => {
    const now = ctx.currentTime
    out.gain.cancelScheduledValues(now)
    out.gain.setValueAtTime(out.gain.value, now)
    out.gain.linearRampToValueAtTime(VOLUME, now + 2)
  }
  if (source) {
    fadeIn()
    return true
  }
  getBuffer(ctx)
    .then((buffer) => {
      if (!buffer || !wanted || source) return
      source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.loopStart = 0
      source.loopEnd = Math.min(LOOP_END, buffer.duration)
      source.connect(out)
      source.start()
      fadeIn()
    })
    .catch(() => {})
  return true
}

// Stopt het buitengeluid (uitfaden)
export function stop(fade = 0.7) {
  wanted = false
  const ctx = getContext()
  if (!ctx || !out) return
  const now = ctx.currentTime
  out.gain.cancelScheduledValues(now)
  out.gain.setValueAtTime(out.gain.value, now)
  out.gain.linearRampToValueAtTime(0, now + fade)
  clearTimeout(stopTimer)
  stopTimer = setTimeout(() => {
    source?.stop()
    source = null
  }, fade * 1000 + 100)
}

// Tijdens ontwikkelen: bij herladen van deze code het oude geluid echt afzetten
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearTimeout(stopTimer)
    source?.stop()
    out?.disconnect()
  })
}
