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

const RADIUS = 15
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
const BAUBLES = (() => {
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

function Baubles({ interactive, unlockedUntil, today, wiggle, onSelect }) {
  return (
    <g className={`baubles ${interactive ? 'is-interactive' : ''}`}>
      {BAUBLES.map((b) => {
        const unlocked = b.day <= unlockedUntil
        const isToday = b.day === today
        const classes = [
          'bauble',
          unlocked ? 'is-unlocked' : 'is-locked',
          isToday ? 'is-today' : '',
          wiggle.day === b.day ? 'is-wiggling' : '',
        ].join(' ')

        const select = (e) => {
          if (!interactive) return
          e.stopPropagation()
          onSelect(b.day)
        }

        return (
          <g
            key={wiggle.day === b.day ? `${b.day}-${wiggle.n}` : b.day}
            className={classes}
            onClick={select}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && select(e)}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : -1}
            aria-label={
              interactive
                ? `Kerstbal ${b.day}${unlocked ? '' : ', nog op slot'}`
                : undefined
            }
          >
            {isToday && <circle className="bauble-halo" cx={b.x} cy={b.y} r={RADIUS + 9} />}
            <rect x={b.x - 4} y={b.y - RADIUS - 5} width="8" height="7" rx="1.5" fill="#b9a16b" />
            <circle cx={b.x} cy={b.y} r={RADIUS} fill={b.fill} />
            <circle cx={b.x - 5} cy={b.y - 5} r="4" fill="#fff" opacity="0.45" />
            <text className="bauble-number" x={b.x} y={b.y + 4.5} textAnchor="middle" fill={b.text}>
              {b.day}
            </text>
          </g>
        )
      })}
    </g>
  )
}

export default Baubles
