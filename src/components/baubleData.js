// Posities en kleuren van de 25 kerstballen (gedeeld door de boom en de open-breek-animatie)
import { TREE_X, halfWidthAt } from './tree.js'

// Rijen kerstballen van boven naar onder: samen 25 ballen
const ROWS = [
  { y: 180, n: 1 },
  { y: 232, n: 2 },
  { y: 275, n: 3 },
  { y: 345, n: 3 },
  { y: 400, n: 4 },
  { y: 450, n: 4 },
  { y: 505, n: 4 },
  { y: 555, n: 4 },
]

const COLORS = [
  { fill: '#2fd65a', text: '#fff' }, // groen
  { fill: '#ff3b3b', text: '#fff' }, // rood
  { fill: '#2f9bff', text: '#fff' }, // blauw
  { fill: '#ffcc00', text: '#fff' }, // geel
]

export const RADIUS = 15
const NEIGHBOUR_DISTANCE = 90

// Vaste pseudo-random, zodat de boom bij elke keer laden hetzelfde blijft
const rand = (i) => {
  const x = Math.sin(i * 78.233 + 4.1) * 43758.5453
  return x - Math.floor(x)
}

// Kleuren willekeurig maar evenwichtig verdelen:
// buren krijgen nooit dezelfde kleur en elke kleur komt ongeveer even vaak voor
const assignColors = (balls) => {
  const counts = COLORS.map(() => 0)
  const all = COLORS.map((_, c) => c)
  balls.forEach((b, i) => {
    const taken = balls
      .slice(0, i)
      .filter((o) => Math.hypot(o.x - b.x, o.y - b.y) < NEIGHBOUR_DISTANCE)
      .map((o) => o.colorIndex)
    const free = all.filter((c) => !taken.includes(c))
    const pool = free.length ? free : all
    const fewest = Math.min(...pool.map((c) => counts[c]))
    const best = pool.filter((c) => counts[c] === fewest)
    const c = best[Math.floor(rand(b.day) * best.length)]
    counts[c]++
    Object.assign(b, { colorIndex: c, ...COLORS[c] })
  })
  return balls
}

// Nummering van onder (1) naar boven (25)
export const BAUBLES = (() => {
  const out = []
  let day = 1
  ;[...ROWS].reverse().forEach(({ y, n }, r) => {
    const half = halfWidthAt(y) * 0.72
    for (let k = 0; k < n; k++) {
      const x = n === 1 ? TREE_X : TREE_X - half + (2 * half * k) / (n - 1)
      out.push({ day, x, y: y + (r % 2 ? -2 : 4) })
      day++
    }
  })
  return assignColors(out)
})()

export const getBauble = (day) => BAUBLES.find((b) => b.day === day)
