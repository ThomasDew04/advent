import { useEffect, useRef, useState } from 'react'
import { getBauble } from './baubleData.js'
import { isTouch, reducedMotion } from '../utils/framing.js'
import './BreakBauble.css'

// Eenmalige animatie: de kerstbal groot in beeld, klik -> hamer slaat -> barsten -> scherven -> luikje open.

const C = { x: 185, y: 235 } // midden van de kerstbal
const R = 95
const PIVOT = { x: 330, y: 365 } // onderkant van de hamersteel (draaipunt)
const HANDLE = 200 // afstand draaipunt -> midden van de hamerkop
const HIT_ANGLE = -4 // graden: stand van de hamer bij de klap (de onderhoek van de kop raakt dan net de bal)

// Waar de hamer de bal raakt
const head = {
  x: PIVOT.x + HANDLE * Math.sin((HIT_ANGLE * Math.PI) / 180),
  y: PIVOT.y - HANDLE * Math.cos((HIT_ANGLE * Math.PI) / 180),
}
const toHead = Math.hypot(head.x - C.x, head.y - C.y)
const IMPACT = { x: C.x + ((head.x - C.x) / toHead) * R * 0.97, y: C.y + ((head.y - C.y) / toHead) * R * 0.97 }
// Middelpunt van de scherven: het midden van de bal, een tikje richting de klap
const CORE = { x: C.x + (IMPACT.x - C.x) * 0.2, y: C.y + (IMPACT.y - C.y) * 0.2 }

const rand = (i) => {
  const x = Math.sin(i * 91.7 + 13.3) * 43758.5453
  return x - Math.floor(x)
}

// Punt waar een straal vanuit `from` in richting `a` de cirkelrand raakt
function onCircle(from, a) {
  const dx = Math.cos(a)
  const dy = Math.sin(a)
  const fx = from.x - C.x
  const fy = from.y - C.y
  const b = fx * dx + fy * dy
  const t = -b + Math.sqrt(b * b - (fx * fx + fy * fy - R * R))
  return { x: from.x + dx * t, y: from.y + dy * t }
}

// Scherven: taartpunten vanuit CORE, elk nog eens gesplitst in een binnen- en een buitenstuk,
// zodat het op kleinere stukjes glas lijkt
const SHARD_COUNT = 11
const cuts = Array.from({ length: SHARD_COUNT }, (_, i) => ((i + 0.3 + rand(i) * 0.5) / SHARD_COUNT) * Math.PI * 2)
const shard = (pts, i) => {
  const cx = pts.reduce((sum, p) => sum + p.x, 0) / pts.length
  const cy = pts.reduce((sum, p) => sum + p.y, 0) / pts.length
  const len = Math.hypot(cx - CORE.x, cy - CORE.y) || 1
  const dist = 120 + rand(i + 80) * 160
  return {
    points: pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),
    dx: ((cx - CORE.x) / len) * dist - 40, // weg van de hamer
    dy: ((cy - CORE.y) / len) * dist + 120 + rand(i + 100) * 90, // + zwaartekracht
    rot: (rand(i + 120) - 0.5) * 600,
    tint: rand(i + 140) > 0.5 ? ['#fff', 0.1 + rand(i + 160) * 0.25] : ['#000', 0.08 + rand(i + 160) * 0.2],
    delay: rand(i + 180) * 0.08,
  }
}
const SHARDS = cuts.flatMap((a0, i) => {
  const a1 = cuts[(i + 1) % SHARD_COUNT] + (i === SHARD_COUNT - 1 ? Math.PI * 2 : 0)
  const rimAt = (k) => onCircle(CORE, a0 + (a1 - a0) * k)
  const mid = (k, m) => {
    const p = rimAt(k)
    return { x: CORE.x + (p.x - CORE.x) * m, y: CORE.y + (p.y - CORE.y) * m }
  }
  const m0 = 0.4 + rand(i + 20) * 0.25
  const m1 = 0.4 + rand(((i + 1) % SHARD_COUNT) + 20) * 0.25
  const center = { x: CORE.x + (rand(i + 40) - 0.5) * 14, y: CORE.y + (rand(i + 60) - 0.5) * 14 }
  const inner = [center, mid(0, m0), mid(0.5, (m0 + m1) / 2 + 0.06), mid(1, m1)]
  const outer = [mid(0, m0), rimAt(0), rimAt(0.33), rimAt(0.66), rimAt(1), mid(1, m1), mid(0.5, (m0 + m1) / 2 + 0.06)]
  return [shard(inner, i * 2), shard(outer, i * 2 + 1)]
})

// Glitter die eruit spat
const GLITTER = Array.from({ length: 34 }, (_, i) => {
  const a = rand(i + 200) * Math.PI * 2
  const d = 90 + rand(i + 220) * 190
  return {
    r: 1.5 + rand(i + 240) * 3.5,
    dx: Math.cos(a) * d,
    dy: Math.sin(a) * d + 60,
    color: ['#ffd45c', '#fff', '#ffe9a8', '#ffcc00'][i % 4],
    delay: rand(i + 260) * 0.1,
  }
})

// Barsten vanuit het punt waar de hamer raakt
const CRACKS = Array.from({ length: 7 }, (_, i) => {
  const base = Math.atan2(C.y - IMPACT.y, C.x - IMPACT.x)
  let a = base + (i / 6 - 0.5) * 2.4
  let p = { ...IMPACT }
  const pts = [p]
  const steps = 3 + Math.floor(rand(i + 300) * 3)
  for (let s = 0; s < steps; s++) {
    a += (rand(i * 10 + s + 320) - 0.5) * 0.9
    const len = 18 + rand(i * 10 + s + 340) * 26
    p = { x: p.x + Math.cos(a) * len, y: p.y + Math.sin(a) * len }
    if (Math.hypot(p.x - C.x, p.y - C.y) > R - 4) break
    pts.push(p)
  }
  return pts.map((q, k) => `${k ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ')
})

function BreakBauble({ day, onDone, onCancel }) {
  const bauble = getBauble(day)
  const [phase, setPhase] = useState('ready') // ready -> swing -> crack -> shatter
  const timers = useRef([])
  const stageRef = useRef(null)

  useEffect(() => {
    stageRef.current?.focus()
    const list = timers.current
    return () => list.forEach(clearTimeout)
  }, [])

  // Escape: terug naar de boom (alleen zolang de hamer nog niet geslagen heeft)
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && phase === 'ready' && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, onCancel])

  const hit = () => {
    if (phase !== 'ready') return
    if (reducedMotion()) {
      onDone()
      return
    }
    const at = (ms, fn) => timers.current.push(setTimeout(fn, ms))
    setPhase('swing')
    at(260, () => setPhase('crack'))
    at(820, () => setPhase('shatter'))
    at(1800, onDone)
  }

  const cap = (
    <g>
      <circle cx={C.x} cy={C.y - R - 24} r="8" fill="none" stroke="#c9b27a" strokeWidth="3.5" />
      <rect x={C.x - 18} y={C.y - R - 16} width="36" height="20" rx="4" fill="#d4af37" />
      <path d={`M${C.x - 18} ${C.y - R - 9} H ${C.x + 18} M${C.x - 18} ${C.y - R - 2} H ${C.x + 18}`} stroke="#b8952a" strokeWidth="2" />
    </g>
  )

  return (
    <div className={`break-overlay is-${phase}`} role="dialog" aria-modal="true" aria-label={`Kerstbal ${day} openbreken`}>
      <p className="break-hint">
        {isTouch() ? 'Tik' : 'Klik'} op de kerstbal om hem open te breken! <span aria-hidden="true">🔨</span>
      </p>

      <svg
        ref={stageRef}
        className="break-stage"
        viewBox="-40 0 560 420"
        onClick={hit}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && hit()}
        role="button"
        tabIndex={0}
        aria-label={`Sla kerstbal ${day} open met de hamer`}
      >
        <defs>
          <radialGradient id="breakShine" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.25" />
          </radialGradient>
          <linearGradient id="breakMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c9d1da" />
            <stop offset="0.5" stopColor="#8d97a3" />
            <stop offset="1" stopColor="#5f6874" />
          </linearGradient>
          <radialGradient id="breakGlow">
            <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#fff3c4" stopOpacity="0.6" />
            <stop offset="1" stopColor="#ffd45c" stopOpacity="0" />
          </radialGradient>
          <clipPath id="breakBall">
            <circle cx={C.x} cy={C.y} r={R} />
          </clipPath>
        </defs>

        {phase !== 'shatter' ? (
          <g className="break-bauble">
            {cap}
            <circle cx={C.x} cy={C.y} r={R} fill={bauble.fill} />
            <circle cx={C.x} cy={C.y} r={R} fill="url(#breakShine)" />
            <ellipse cx={C.x - 34} cy={C.y - 38} rx="20" ry="13" fill="#fff" opacity="0.5" transform={`rotate(-35 ${C.x - 34} ${C.y - 38})`} />
            <text className="break-number" x={C.x} y={C.y + 22} textAnchor="middle" fill={bauble.text}>
              {day}
            </text>
            {phase === 'crack' && (
              <g clipPath="url(#breakBall)">
                {CRACKS.map((d, i) => (
                  <g key={i} className="break-crack" style={{ '--delay': `${i * 0.03}s` }}>
                    <path d={d} pathLength="1" stroke="#000" strokeOpacity="0.35" strokeWidth="5" fill="none" strokeLinejoin="round" />
                    <path d={d} pathLength="1" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                  </g>
                ))}
              </g>
            )}
          </g>
        ) : (
          <g>
            <circle className="break-burst" cx={CORE.x} cy={CORE.y} r="60" fill="url(#breakGlow)" />
            <g className="break-cap-fall">{cap}</g>
            {SHARDS.map((s, i) => (
              <g
                key={i}
                className="break-shard"
                style={{ '--dx': `${s.dx}px`, '--dy': `${s.dy}px`, '--rot': `${s.rot}deg`, '--delay': `${s.delay}s` }}
              >
                <polygon points={s.points} fill={bauble.fill} stroke="#fff" strokeOpacity="0.6" strokeWidth="1.5" strokeLinejoin="round" />
                <polygon points={s.points} fill={s.tint[0]} opacity={s.tint[1]} />
              </g>
            ))}
            {GLITTER.map((g, i) => (
              <circle
                key={i}
                className="break-glitter"
                cx={CORE.x}
                cy={CORE.y}
                r={g.r}
                fill={g.color}
                style={{ '--dx': `${g.dx}px`, '--dy': `${g.dy}px`, '--delay': `${g.delay}s` }}
              />
            ))}
          </g>
        )}

        {phase === 'crack' && <circle className="break-flash" cx={IMPACT.x} cy={IMPACT.y} r="22" fill="url(#breakGlow)" />}

        {/* Hamer: getekend rechtop vanuit het draaipunt (0,0) onderaan de steel */}
        <g transform={`translate(${PIVOT.x} ${PIVOT.y})`}>
          <g className="break-hammer">
            <rect x="-7" y={-HANDLE + 14} width="14" height={HANDLE - 14} rx="6" fill="#8b5a2b" />
            <path d={`M-7 ${-HANDLE + 40} H 7 M-7 ${-HANDLE / 2} H 7`} stroke="#6e4426" strokeWidth="2" />
            {[0, 1, 2, 3].map((k) => (
              <rect key={k} x="-8" y={-48 + k * 11} width="16" height="8" rx="2" fill="#c0392b" />
            ))}
            <rect x="-46" y={-HANDLE - 24} width="92" height="46" rx="7" fill="url(#breakMetal)" />
            <rect x="-46" y={-HANDLE - 24} width="12" height="46" rx="4" fill="#5f6874" />
            <rect x="34" y={-HANDLE - 24} width="12" height="46" rx="4" fill="#5f6874" />
            <rect x="-30" y={-HANDLE - 18} width="60" height="7" rx="3.5" fill="#fff" opacity="0.35" />
          </g>
        </g>
      </svg>
    </div>
  )
}

export default BreakBauble
