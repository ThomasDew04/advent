import { useRef } from 'react'
import './LivingRoom.css'
import Baubles from './Baubles.jsx'
import { TREE_X, TIERS } from './tree.js'
import { frame, isPortrait, isTouch, useAspect, useViewBox } from '../utils/framing.js'

// Wat er zeker in beeld moet staan
const FULL = { x: 0, y: 0, w: 1600, h: 900 }
const MUST_LANDSCAPE = { x: 640, y: 90, w: 940, h: 800 } // haard, boom en bordje
const MUST_PORTRAIT = { x: 1040, y: 80, w: 540, h: 820 } // boom en bordje
const TREE_ZOOM = { x: 1080, y: 64, w: 440, h: 642 } // ingezoomd: de hele boom met alle ballen

// Deterministische pseudo-random zodat de scène bij elke render gelijk blijft
const rand = (i) => {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// Raam
const WINDOW = { x: 140, y: 150, w: 260, h: 320 }

const SNOWFLAKES = Array.from({ length: 45 }, (_, i) => ({
  x: WINDOW.x + rand(i + 1) * WINDOW.w,
  r: 1.5 + rand(i + 100) * 2.5,
  duration: 6 + rand(i + 200) * 6,
  delay: -rand(i + 300) * 12,
  drift: (rand(i + 400) - 0.5) * 40,
}))

const LIGHT_COLORS = ['#ffd45c', '#ff5a5a', '#6ecbff', '#9cff7a', '#ff9de2']

// Lichtjes in licht doorhangende slingers per laag
const LIGHTS = TIERS.flatMap((tier, t) => {
  const rows = [0.55, 0.92]
  return rows.flatMap((frac, r) => {
    const y = tier.apex + (tier.base - tier.apex) * frac
    const half = tier.half * frac * 0.9
    const count = 4 + t * 2 + r * 2
    return Array.from({ length: count }, (_, k) => {
      const p = k / (count - 1)
      const x = TREE_X - half + p * half * 2
      const sag = Math.sin(p * Math.PI) * 14
      const idx = t * 100 + r * 20 + k
      return {
        x,
        y: y + sag - 6,
        color: LIGHT_COLORS[idx % LIGHT_COLORS.length],
        delay: rand(idx + 500) * 2.5,
      }
    })
  })
})

// Lichtjesslinger rechts aan de muur: twee doorhangende bogen
const quad = (p0, p1, p2, t) => ({
  x: (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t ** 2 * p2[0],
  y: (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t ** 2 * p2[1],
})
const WALL_GARLAND = [
  [[1530, 110], [1610, 185], [1700, 120]],
  [[1700, 120], [1790, 185], [1880, 110]],
]
const WALL_LIGHTS = WALL_GARLAND.flatMap((seg, s) =>
  Array.from({ length: 7 }, (_, k) => {
    const p = quad(...seg, (k + 0.5) / 7)
    const idx = s * 7 + k
    return { ...p, color: LIGHT_COLORS[idx % LIGHT_COLORS.length], delay: rand(idx + 900) * 2.5 }
  }),
)

// Cadeautjes: eerst de achterste, dan de voorste. tilt = graden scheef.
const PRESENTS = [
  { x: 1266, y: 578, w: 76, h: 67, box: '#8e44ad', ribbon: '#f4d03f', tilt: 0 },
  { x: 1108, y: 605, w: 80, h: 55, box: '#b03a2e', ribbon: '#f4d03f', tilt: -6 },
  { x: 1218, y: 620, w: 56, h: 40, box: '#1e8449', ribbon: '#fdfefe', tilt: 0 },
  { x: 1350, y: 602, w: 88, h: 58, box: '#2874a6', ribbon: '#e74c3c', tilt: 5 },
  { x: 1470, y: 616, w: 62, h: 44, box: '#d4ac0d', ribbon: '#922b21', tilt: -8 },
]

// Kleur lichter (amount > 0) of donkerder (amount < 0) maken
const shade = (hex, amount) => {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v) => Math.round(amount > 0 ? v + (255 - v) * amount : v * (1 + amount))
  const r = ch(n >> 16)
  const g = ch((n >> 8) & 255)
  const b = ch(n & 255)
  return `rgb(${r} ${g} ${b})`
}

function Present({ x, y, w, h, box, ribbon, tilt }) {
  const dx = Math.min(w * 0.28, 22)
  const dy = -dx * 0.65
  const midX = x + w / 2
  const midY = y + h / 2
  const pts = (...p) => p.map(([px, py]) => `${px},${py}`).join(' ')

  return (
    <g transform={`rotate(${tilt} ${midX} ${y + h})`}>
      {/* Zijvlak en bovenvlak */}
      <polygon points={pts([x + w, y], [x + w + dx, y + dy], [x + w + dx, y + h + dy], [x + w, y + h])} fill={shade(box, -0.35)} />
      <polygon points={pts([x, y], [x + dx, y + dy], [x + w + dx, y + dy], [x + w, y])} fill={shade(box, 0.25)} />
      {/* Voorvlak */}
      <rect x={x} y={y} width={w} height={h} fill={box} />

      {/* Lint over voorvlak, zijvlak en bovenvlak */}
      <rect x={midX - 5} y={y} width="10" height={h} fill={ribbon} />
      <rect x={x} y={midY - 4} width={w} height="8" fill={ribbon} />
      <polygon
        points={pts([x + w, midY - 4], [x + w + dx, midY - 4 + dy], [x + w + dx, midY + 4 + dy], [x + w, midY + 4])}
        fill={shade(ribbon, -0.3)}
      />
      <line x1={midX} y1={y} x2={midX + dx} y2={y + dy} stroke={shade(ribbon, 0.15)} strokeWidth="9" />
      <line x1={x + dx / 2} y1={y + dy / 2} x2={x + w + dx / 2} y2={y + dy / 2} stroke={shade(ribbon, 0.15)} strokeWidth="6" />

      {/* Strik bovenop */}
      <ellipse cx={midX + dx / 2 - 9} cy={y + dy / 2 - 5} rx="10" ry="6" fill={ribbon} transform={`rotate(-15 ${midX + dx / 2 - 9} ${y + dy / 2 - 5})`} />
      <ellipse cx={midX + dx / 2 + 9} cy={y + dy / 2 - 5} rx="10" ry="6" fill={ribbon} transform={`rotate(15 ${midX + dx / 2 + 9} ${y + dy / 2 - 5})`} />
      <circle cx={midX + dx / 2} cy={y + dy / 2 - 3} r="4.5" fill={shade(ribbon, -0.2)} />
    </g>
  )
}

const STOCKINGS = [
  { x: 690, color: '#b03a2e' },
  { x: 790, color: '#1e8449' },
  { x: 890, color: '#b03a2e' },
]

function LivingRoom({ zoomed, onStart, unlockedUntil, today, wiggle, onSelectDay }) {
  const svgRef = useRef(null)
  const aspect = useAspect()
  const target = zoomed
    ? frame(aspect, TREE_ZOOM)
    : frame(aspect, isPortrait(aspect) ? MUST_PORTRAIT : MUST_LANDSCAPE, FULL)
  useViewBox(svgRef, target, zoomed ? 'zoom' : 'room')

  return (
    <>
    <svg
      ref={svgRef}
      className={`living-room ${zoomed ? 'is-zoomed' : ''}`}
      preserveAspectRatio="xMidYMid slice"
      aria-label="Een gezellige woonkamer met een open haard en een versierde kerstboom"
      onClick={() => !zoomed && onStart()}
    >
      <defs>
        <pattern id="wallpaper" width="48" height="48" patternUnits="userSpaceOnUse">
          <rect width="48" height="48" fill="#8a4636" />
          <rect width="24" height="48" fill="#81402f" />
          <circle cx="12" cy="24" r="2.5" fill="#9c5644" />
        </pattern>

        <pattern id="planks" width="220" height="60" patternUnits="userSpaceOnUse">
          <rect width="220" height="60" fill="#6b4226" />
          <rect width="220" height="30" fill="#704529" />
          <line x1="0" y1="30" x2="220" y2="30" stroke="#4e2f1a" strokeWidth="2" />
          <line x1="0" y1="60" x2="220" y2="60" stroke="#4e2f1a" strokeWidth="2" />
          <line x1="80" y1="0" x2="80" y2="30" stroke="#4e2f1a" strokeWidth="2" />
          <line x1="170" y1="30" x2="170" y2="60" stroke="#4e2f1a" strokeWidth="2" />
        </pattern>

        <pattern id="bricks" width="60" height="30" patternUnits="userSpaceOnUse">
          <rect width="60" height="30" fill="#5a3b30" />
          <rect x="1.5" y="1.5" width="57" height="12" rx="2" fill="#8e5a46" />
          <rect x="-28.5" y="16.5" width="57" height="12" rx="2" fill="#86533f" />
          <rect x="31.5" y="16.5" width="57" height="12" rx="2" fill="#86533f" />
        </pattern>

        <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1633" />
          <stop offset="1" stopColor="#2a3d6b" />
        </linearGradient>

        <radialGradient id="fireGlow" cx="800" cy="580" r="650" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffb347" stopOpacity="0.45" />
          <stop offset="0.5" stopColor="#ff8c2a" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ff8c2a" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="lampGlow" cx="250" cy="400" r="260" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe3a3" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffe3a3" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="candleGlow">
          <stop offset="0" stopColor="#ffcf73" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffcf73" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="lightHalo">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>

        <clipPath id="windowClip">
          <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} />
        </clipPath>
      </defs>

      <g className="scene">
      {/* Muur en vloer */}
      {/* Breder dan het beeld, zodat er bij het inzoomen geen lege rand zichtbaar wordt */}
      <rect x="-800" y="-1200" width="3200" height="1840" fill="url(#wallpaper)" />
      <rect x="-800" y="640" width="3200" height="1400" fill="url(#planks)" />
      <rect x="-800" y="625" width="3200" height="20" fill="#3e2416" />

      {/* Raam met sneeuw */}
      <g>
        <rect x={WINDOW.x - 18} y={WINDOW.y - 18} width={WINDOW.w + 36} height={WINDOW.h + 36} rx="6" fill="#efe3cf" />
        <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} fill="url(#night)" />
        <g clipPath="url(#windowClip)">
          <circle cx="330" cy="215" r="28" fill="#fdf6d8" />
          <path d="M140 430 Q 220 395 300 420 T 400 410 V 470 H 140 Z" fill="#e8eef7" />
          {SNOWFLAKES.map((f, i) => (
            <circle
              key={i}
              className="flake"
              cx={f.x}
              cy={WINDOW.y - 10}
              r={f.r}
              style={{
                '--duration': `${f.duration}s`,
                '--delay': `${f.delay}s`,
                '--drift': `${f.drift}px`,
              }}
            />
          ))}
        </g>
        <rect x={WINDOW.x + WINDOW.w / 2 - 5} y={WINDOW.y} width="10" height={WINDOW.h} fill="#efe3cf" />
        <rect x={WINDOW.x} y={WINDOW.y + WINDOW.h / 2 - 5} width={WINDOW.w} height="10" fill="#efe3cf" />
        <rect x={WINDOW.x - 30} y={WINDOW.y + WINDOW.h + 12} width={WINDOW.w + 60} height="16" rx="4" fill="#e2d3b8" />
        {/* Gordijnen */}
        <rect x="95" y="120" width="350" height="12" rx="6" fill="#4a2c1c" />
        <path d="M100 130 Q 150 300 105 520 L 70 520 Q 90 300 70 130 Z" fill="#2f5d50" />
        <path d="M440 130 Q 390 300 435 520 L 470 520 Q 450 300 470 130 Z" fill="#2f5d50" />
      </g>

      {/* Staande lamp */}
      <rect width="1600" height="900" fill="url(#lampGlow)" />
      <g>
        <rect x="246" y="400" width="8" height="300" fill="#3a2a1f" />
        <ellipse cx="250" cy="702" rx="40" ry="8" fill="#3a2a1f" />
        <path d="M205 400 L 295 400 L 275 340 L 225 340 Z" fill="#f3d9a4" />
        <path d="M205 400 L 295 400" stroke="#d6b77c" strokeWidth="4" />
      </g>

      {/* Schilderij */}
      <g>
        <rect x="712" y="182" width="176" height="136" rx="4" fill="#6b4226" />
        <rect x="726" y="196" width="148" height="108" fill="#a7c4d8" />
        <path d="M726 304 L 770 240 L 800 270 L 835 225 L 874 304 Z" fill="#e9f0f5" />
        <path d="M726 304 L 760 275 L 800 304 Z" fill="#5d8a6b" />
      </g>

      {/* Versiering rechts van de boom */}
      <g>
        {/* Lichtjesslinger */}
        {WALL_GARLAND.map(([p0, p1, p2], i) => (
          <path
            key={i}
            d={`M${p0[0]} ${p0[1]} Q ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`}
            fill="none"
            stroke="#2e6b3f"
            strokeWidth="6"
            strokeLinecap="round"
          />
        ))}
        {WALL_LIGHTS.map((l, i) => (
          <g key={i} className="tree-light" style={{ '--delay': `${l.delay}s` }}>
            <circle cx={l.x} cy={l.y + 7} r="13" fill="url(#lightHalo)" opacity="0.35" />
            <ellipse cx={l.x} cy={l.y + 7} rx="4" ry="6" fill={l.color} />
          </g>
        ))}

        {/* Kerstkrans */}
        <g transform="translate(1700 290)">
          <circle r="58" fill="none" stroke="#1d5e3a" strokeWidth="34" />
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2
            return (
              <ellipse
                key={i}
                cx={Math.cos(a) * 58}
                cy={Math.sin(a) * 58}
                rx="16"
                ry="8"
                fill={i % 2 ? '#2e7d4a' : '#28794a'}
                transform={`rotate(${(a * 180) / Math.PI + 60} ${Math.cos(a) * 58} ${Math.sin(a) * 58})`}
              />
            )
          })}
          {[20, 75, 130, 200, 250, 310].map((deg, i) => {
            const a = (deg * Math.PI) / 180
            return <circle key={i} cx={Math.cos(a) * 60} cy={Math.sin(a) * 60} r="5" fill="#e53935" />
          })}
          {/* Strik */}
          <path d="M0 52 L -30 34 L -30 70 Z" fill="#e53935" />
          <path d="M0 52 L 30 34 L 30 70 Z" fill="#e53935" />
          <path d="M-4 56 L -16 96 L -6 92 L 0 60 Z M4 56 L 16 96 L 6 92 L 0 60 Z" fill="#c62828" />
          <circle cy="52" r="8" fill="#c62828" />
        </g>

        {/* Bijzettafeltje */}
        <rect x="1610" y="520" width="210" height="14" rx="3" fill="#5b3a24" />
        <rect x="1625" y="534" width="10" height="106" fill="#4a2c1c" />
        <rect x="1795" y="534" width="10" height="106" fill="#4a2c1c" />
        <rect x="1630" y="595" width="170" height="8" fill="#4a2c1c" />

        {/* Lantaarn met kaars */}
        <circle cx="1665" cy="475" r="70" fill="url(#candleGlow)" />
        <path d="M1645 438 L 1665 418 L 1685 438 Z" fill="#2b2b2b" />
        <circle cx="1665" cy="414" r="5" fill="none" stroke="#2b2b2b" strokeWidth="3" />
        <rect x="1642" y="438" width="46" height="82" rx="3" fill="#ffe2a6" opacity="0.35" />
        <rect x="1660" y="485" width="10" height="30" rx="2" fill="#fdf6e3" />
        <path className="flame flame-3" d="M1665 468 Q 1658 478 1665 486 Q 1672 478 1665 468 Z" fill="#ffcc4d" />
        <rect x="1642" y="438" width="46" height="82" rx="3" fill="none" stroke="#2b2b2b" strokeWidth="4" />
        <line x1="1665" y1="438" x2="1665" y2="462" stroke="#2b2b2b" strokeWidth="2" />

        {/* Kerstster in een pot */}
        <path d="M1735 488 h 50 l -6 32 h -38 z" fill="#efe3cf" />
        <path d="M1737 500 h 46 l -1 6 h -44 z" fill="#d4af37" />
        <rect x="1731" y="482" width="58" height="10" rx="3" fill="#d4af37" />
        {Array.from({ length: 6 }, (_, i) => {
          const deg = i * 60 - 90
          return (
            <ellipse
              key={i}
              cx="1760"
              cy="462"
              rx="9"
              ry="22"
              fill="#e53935"
              transform={`rotate(${deg + 90} 1760 462) translate(0 -14)`}
            />
          )
        })}
        <ellipse cx="1742" cy="478" rx="12" ry="5" fill="#2e7d4a" transform="rotate(-20 1742 478)" />
        <ellipse cx="1778" cy="478" rx="12" ry="5" fill="#2e7d4a" transform="rotate(20 1778 478)" />
        <circle cx="1760" cy="462" r="5" fill="#ffd45c" />
      </g>

      {/* Open haard */}
      <g>
        <rect x="630" y="370" width="340" height="260" fill="url(#bricks)" />
        <rect x="600" y="350" width="400" height="24" rx="4" fill="#4a2c1c" />
        <path d="M690 630 V 470 Q 800 420 910 470 V 630 Z" fill="#1a0e0a" />

        {/* Blokken hout */}
        <rect x="725" y="600" width="150" height="20" rx="10" fill="#5b3a24" />
        <rect x="740" y="585" width="120" height="18" rx="9" fill="#6e4529" transform="rotate(-6 800 594)" />

        {/* Vuur */}
        <g className="fire">
          <path className="flame flame-1" d="M740 600 Q 730 545 765 510 Q 760 550 785 560 Q 790 520 810 490 Q 815 540 840 555 Q 850 530 845 515 Q 880 555 860 600 Z" fill="#ff7b2a" />
          <path className="flame flame-2" d="M760 600 Q 755 565 780 540 Q 785 565 800 570 Q 805 540 820 525 Q 830 565 845 575 Q 850 590 840 600 Z" fill="#ffb627" />
          <path className="flame flame-3" d="M780 600 Q 782 580 795 565 Q 800 580 810 582 Q 815 570 822 565 Q 830 585 822 600 Z" fill="#fff1a8" />
        </g>

        {/* Kousen */}
        {STOCKINGS.map((s, i) => (
          <g key={i} transform={`translate(${s.x} 372)`}>
            <g className="stocking" style={{ '--sway-delay': `${i * 0.7}s` }}>
              <path d="M0 10 h36 v62 q0 26 -26 26 h-28 q-16 0 -16 -15 q0 -14 16 -16 h18 z" fill={s.color} />
              <rect x="-4" y="0" width="44" height="16" rx="5" fill="#f5f0e8" />
            </g>
          </g>
        ))}

        {/* Slinger op de schoorsteenmantel */}
        <path d="M605 352 Q 700 385 800 352 Q 900 385 995 352" fill="none" stroke="#2e6b3f" strokeWidth="10" strokeLinecap="round" />
        {[650, 720, 800, 880, 950].map((x, i) => (
          <circle key={i} cx={x} cy={i % 2 ? 370 : 362} r="5" fill={i % 2 ? '#ffd45c' : '#c0392b'} />
        ))}
      </g>

      {/* Warme gloed van het vuur */}
      <rect width="1600" height="900" fill="url(#fireGlow)" className="glow" />

      {/* Tapijt */}
      <ellipse cx="820" cy="785" rx="420" ry="80" fill="#7b241c" />
      <ellipse cx="820" cy="785" rx="380" ry="64" fill="none" stroke="#d4ac0d" strokeWidth="4" strokeDasharray="14 10" />
      <ellipse cx="820" cy="785" rx="300" ry="46" fill="#922b21" />

      {/* Golden retriever puppy op het tapijt */}
      <g>
        <ellipse cx="815" cy="808" rx="105" ry="10" fill="#000" opacity="0.22" />

        {/* Kwispelende staart */}
        <path className="puppy-tail" d="M893 782 Q 930 768 940 790" fill="none" stroke="#c88a48" strokeWidth="14" strokeLinecap="round" />

        {/* Lijf dat rustig ademt */}
        <ellipse className="puppy-body" cx="832" cy="784" rx="72" ry="26" fill="#d9a05b" />
        <ellipse cx="840" cy="772" rx="50" ry="10" fill="#e6b373" opacity="0.6" />

        {/* Achterpoot */}
        <ellipse cx="876" cy="790" rx="28" ry="17" fill="#c88a48" />
        <ellipse cx="858" cy="804" rx="16" ry="7" fill="#e6b373" />

        {/* Borst */}
        <ellipse cx="775" cy="780" rx="30" ry="24" fill="#dfa660" />

        {/* Kop */}
        <circle cx="770" cy="738" r="30" fill="#dfa660" />
        <ellipse cx="740" cy="746" rx="12" ry="22" fill="#b97a3c" transform="rotate(15 740 746)" />
        <ellipse cx="800" cy="746" rx="12" ry="22" fill="#b97a3c" transform="rotate(-15 800 746)" />

        {/* Ogen */}
        <circle cx="759" cy="733" r="4.2" fill="#2a1a10" />
        <circle cx="781" cy="733" r="4.2" fill="#2a1a10" />
        <circle cx="760.5" cy="731.5" r="1.4" fill="#fff" />
        <circle cx="782.5" cy="731.5" r="1.4" fill="#fff" />

        {/* Snuit */}
        <ellipse cx="770" cy="752" rx="15" ry="11" fill="#f3d29b" />
        <ellipse cx="770" cy="746" rx="6" ry="4.5" fill="#2a1a10" />
        <path d="M770 750 v5 M770 755 q-5 4 -9 1 M770 755 q5 4 9 1" fill="none" stroke="#2a1a10" strokeWidth="1.5" strokeLinecap="round" />

        {/* Halsband */}
        <path d="M748 766 Q 770 779 792 766" fill="none" stroke="#c0392b" strokeWidth="6" strokeLinecap="round" />
        <circle cx="770" cy="777" r="4" fill="#d4af37" />

        {/* Voorpootjes */}
        <ellipse cx="755" cy="801" rx="14" ry="9" fill="#e6b373" />
        <ellipse cx="788" cy="803" rx="14" ry="9" fill="#e6b373" />
      </g>

      {/* Fauteuil */}
      <g>
        {/* Schaduw op de vloer */}
        <ellipse cx="450" cy="738" rx="125" ry="10" fill="#000" opacity="0.25" />

        {/* Rugleuning met afgeronde bovenkant */}
        <path d="M365 650 V 515 Q 365 470 410 468 H 490 Q 535 470 535 515 V 650 Z" fill="#2f5d50" />
        <rect x="385" y="488" width="130" height="135" rx="22" fill="#376b5c" />
        {/* Capitonné knopen */}
        {[
          [420, 525], [480, 525], [450, 560], [420, 595], [480, 595],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#24493f" />
        ))}

        {/* Kussen */}
        <g transform="rotate(-10 430 600)">
          <rect x="398" y="572" width="64" height="58" rx="16" fill="#c0392b" />
          <path d="M398 592 H 462 M398 610 H 462 M418 572 V 630 M442 572 V 630" stroke="#e8d5b5" strokeWidth="3" opacity="0.7" />
        </g>

        {/* Onderstel en zitkussen */}
        <rect x="345" y="650" width="210" height="58" rx="10" fill="#2a5347" />
        <rect x="372" y="622" width="156" height="40" rx="12" fill="#43806e" />
        <rect x="372" y="648" width="156" height="14" rx="6" fill="#3b7363" />

        {/* Armleuningen met omgerolde bovenkant */}
        <rect x="333" y="580" width="54" height="128" rx="14" fill="#2f5d50" />
        <ellipse cx="360" cy="582" rx="32" ry="16" fill="#3b7363" />
        <rect x="513" y="580" width="54" height="128" rx="14" fill="#2f5d50" />
        <ellipse cx="540" cy="582" rx="32" ry="16" fill="#3b7363" />

        {/* Pootjes */}
        <path d="M352 706 h16 l-3 28 h-10 z" fill="#3e2416" />
        <path d="M532 706 h16 l-3 28 h-10 z" fill="#3e2416" />
      </g>

      {/* Kerstboom */}
      <g>
        <rect x={TREE_X - 25} y="570" width="50" height="75" fill="#5b3a24" />
        <rect x={TREE_X - 60} y="635" width="120" height="30" rx="6" fill="#922b21" />
        {[...TIERS].reverse().map((t, i) => (
          <path
            key={i}
            d={`M${TREE_X} ${t.apex}
               L ${TREE_X + t.half} ${t.base}
               Q ${TREE_X} ${t.base + 22} ${TREE_X - t.half} ${t.base} Z`}
            fill={['#1d5e3a', '#226b42', '#28794a'][i]}
          />
        ))}

        {LIGHTS.map((l, i) => (
          <g key={i} className="tree-light" style={{ '--delay': `${l.delay}s` }}>
            <circle cx={l.x} cy={l.y} r="14" fill="url(#lightHalo)" opacity="0.35" />
            <circle cx={l.x} cy={l.y} r="5" fill={l.color} />
          </g>
        ))}

        <Baubles
          interactive={zoomed}
          unlockedUntil={unlockedUntil}
          today={today}
          wiggle={wiggle}
          onSelect={onSelectDay}
        />

        {/* Ster */}
        <g className="star" transform={`translate(${TREE_X} 113)`}>
          <circle r="34" fill="url(#lightHalo)" opacity="0.5" />
          <path
            d="M0 -28 L 8 -9 L 28 -9 L 12 4 L 18 24 L 0 12 L -18 24 L -12 4 L -28 -9 L -8 -9 Z"
            fill="#ffd45c"
            stroke="#e0a800"
            strokeWidth="2"
          />
        </g>
      </g>

      {/* Cadeautjes */}
      {PRESENTS.map((p, i) => (
        <Present key={i} {...p} />
      ))}

      {/* Bordje op een paaltje */}
      <g className="sign" transform="translate(1410 710) rotate(6) scale(1.25) translate(-1450 -688)" style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.45))' }}>
        <rect x="1442" y="770" width="16" height="200" fill="#5b3a24" />
        <rect x="1335" y="688" width="230" height="92" rx="10" fill="#5b3a24" />
        <rect x="1343" y="696" width="214" height="76" rx="6" fill="#8b5a2b" />
        <path d="M1343 720 H 1557 M1343 746 H 1557" stroke="#7a4e25" strokeWidth="2" />
        {[[1352, 705], [1548, 705], [1352, 763], [1548, 763]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#3e2416" />
        ))}
        {/* Hulsttakje */}
        <ellipse cx="1350" cy="690" rx="14" ry="6" fill="#2e6b3f" transform="rotate(-30 1350 690)" />
        <ellipse cx="1368" cy="686" rx="14" ry="6" fill="#2e6b3f" transform="rotate(25 1368 686)" />
        <circle cx="1357" cy="684" r="4" fill="#c0392b" />
        <circle cx="1364" cy="690" r="4" fill="#c0392b" />
        <text className="sign-text" x="1450" textAnchor="middle">
          <tspan x="1450" y="728">{isTouch() ? 'Tik' : 'Klik'} ergens</tspan>
          <tspan x="1450" y="758">om te beginnen</tspan>
        </text>
      </g>
      </g>
    </svg>
    <div className="room-vignette" />
    </>
  )
}

export default LivingRoom
