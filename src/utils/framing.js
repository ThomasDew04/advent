import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// Helpers om de SVG-scènes op elk scherm (iPhone, iPad, MacBook, desktop) goed in beeld te brengen.
// Elke scène kiest zelf welk stuk zeker zichtbaar moet zijn ("must"); de viewBox wordt daar rond gelegd
// met exact dezelfde verhouding als het scherm.

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const getAspect = () => window.innerWidth / window.innerHeight

// Verhouding breedte/hoogte van het scherm, bijgewerkt bij draaien of resizen
export function useAspect() {
  const [aspect, setAspect] = useState(getAspect)
  useEffect(() => {
    const onResize = () => setAspect(getAspect())
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])
  return aspect
}

// Staand of bijna vierkant scherm (gsm rechtop, iPad rechtop)
export const isPortrait = (aspect) => aspect < 1.2

// Touchscherm zonder muis: "tik" in plaats van "klik"
export const isTouch = () => window.matchMedia('(hover: none)').matches

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi)

// Berekent een viewBox met de verhouding van het scherm die `cover` zo goed mogelijk vult,
// maar `must` altijd volledig toont.
export function frame(aspect, must, cover = must) {
  let w, h
  if (aspect >= cover.w / cover.h) {
    w = cover.w
    h = w / aspect
  } else {
    h = cover.h
    w = h * aspect
  }
  if (w < must.w || h < must.h) {
    const k = Math.max(must.w / w, must.h / h)
    w *= k
    h *= k
  }
  const x = clamp(cover.x + cover.w / 2 - w / 2, must.x + must.w - w, must.x)
  const y = clamp(cover.y + cover.h / 2 - h / 2, must.y + must.h - h, must.y)
  return { x, y, w, h }
}

export const setViewBox = (svg, v) => svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`)

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a, b, t) => a + (b - a) * t

// Houdt de viewBox van een svg gelijk aan `target`.
// Verandert `mode` (bv. in- of uitzoomen), dan glijdt de viewBox er vloeiend naartoe;
// bij een andere schermgrootte springt hij meteen.
export function useViewBox(ref, target, mode, duration = 1600) {
  const current = useRef(null)
  const lastMode = useRef(mode)
  const { x, y, w, h } = target

  useLayoutEffect(() => {
    const svg = ref.current
    if (!svg) return
    const to = { x, y, w, h }
    const from = current.current
    const animate = from && mode !== lastMode.current && !reducedMotion()
    lastMode.current = mode
    if (!animate) {
      current.current = to
      setViewBox(svg, to)
      return
    }
    let raf
    const start = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const e = easeInOut(t)
      const v = { x: lerp(from.x, to.x, e), y: lerp(from.y, to.y, e), w: lerp(from.w, to.w, e), h: lerp(from.h, to.h, e) }
      current.current = v
      setViewBox(svg, v)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [ref, x, y, w, h, mode, duration])
}
