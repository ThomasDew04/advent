// Voetstappen in de sneeuw tijdens de POV-wandeling naar de deur.
// Geluid: "4 dry snow steps" door qubodup, CC0 (publiek domein)
// https://opengameart.org/content/4-dry-snow-steps

import { getContext } from './music.js'

const URL = `${import.meta.env.BASE_URL}sounds/snow-steps.mp3`

// De stappen in de opname: [begin, lengte] in seconden
const SEGMENTS = [
  [0.0, 0.46],
  [0.46, 0.64],
  [1.12, 0.5],
]

// Momenten (in seconden na de klik) waarop een voet neerkomt.
// Komt overeen met de drie "dips" van de POV-wandeling in OutsideScene.jsx (2,7 s in totaal).
const STEPS = [0.3, 1.11, 1.92]

const VOLUME = 1 // de opname is vrij stil

let bytes = null
let decoded = null

// Het bestand alvast ophalen, zodat het klaar is als er op de deur geklikt wordt
export function preloadFootsteps() {
  if (!bytes) {
    bytes = fetch(URL)
      .then((r) => (r.ok ? r.arrayBuffer() : null))
      .catch(() => null)
  }
  return bytes
}

async function getBuffer(ctx) {
  if (decoded) return decoded
  const data = await preloadFootsteps()
  if (!data) return null
  decoded = await ctx.decodeAudioData(data.slice(0))
  return decoded
}

// Speel de drie stappen af, gerekend vanaf `startedAt` (performance.now() van de klik)
export async function playFootsteps(startedAt = performance.now()) {
  const ctx = getContext()
  if (!ctx || ctx.state !== 'running') return
  const buffer = await getBuffer(ctx).catch(() => null)
  if (!buffer) return

  const lag = (performance.now() - startedAt) / 1000
  STEPS.forEach((at, i) => {
    const t = ctx.currentTime + at - lag
    if (t < ctx.currentTime) return
    const [offset, length] = SEGMENTS[i % SEGMENTS.length]

    const src = ctx.createBufferSource()
    src.buffer = buffer
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(VOLUME, t)
    gain.gain.setValueAtTime(VOLUME, t + length - 0.08)
    gain.gain.linearRampToValueAtTime(0, t + length) // zacht afkappen, geen klik
    let node = src.connect(gain)
    // Linker- en rechtervoet: om beurten een tikje links en rechts
    if (ctx.createStereoPanner) {
      const pan = ctx.createStereoPanner()
      pan.pan.value = i % 2 ? 0.2 : -0.2
      node = node.connect(pan)
    }
    node.connect(ctx.destination)
    src.start(t, offset, length)
  })
}
