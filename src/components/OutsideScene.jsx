import './OutsideScene.css'

// Deterministische pseudo-random zodat de scène bij elke render gelijk blijft
const rand = (i) => {
  const x = Math.sin(i * 12.9898 + 7.7) * 43758.5453
  return x - Math.floor(x)
}

const STARS = Array.from({ length: 80 }, (_, i) => ({
  x: rand(i) * 1600,
  y: rand(i + 100) * 480,
  r: 0.8 + rand(i + 200) * 1.4,
  delay: rand(i + 300) * 4,
}))

const SNOWFLAKES = Array.from({ length: 140 }, (_, i) => ({
  x: rand(i + 400) * 1650 - 25,
  r: 1.2 + rand(i + 500) * 3,
  duration: 8 + rand(i + 600) * 9,
  delay: -rand(i + 700) * 17,
  drift: (rand(i + 800) - 0.5) * 120,
}))

// Bomen achter het huis: een verre, lichtere rij en een dichtere, donkere rij
const FAR_TREES = Array.from({ length: 22 }, (_, i) => ({
  x: -40 + i * 80 + (rand(i + 900) - 0.5) * 40,
  base: 592 + rand(i + 950) * 10,
  h: 130 + rand(i + 1000) * 90,
}))
const NEAR_TREES = [
  { x: 410, base: 640, h: 250 },
  { x: 495, base: 632, h: 310 },
  { x: 560, base: 628, h: 230 },
  { x: 1040, base: 628, h: 240 },
  { x: 1110, base: 632, h: 320 },
  { x: 1195, base: 638, h: 260 },
  { x: 160, base: 650, h: 220 },
  { x: 1440, base: 648, h: 230 },
]

const LIGHT_COLORS = ['#ffd45c', '#ff5a5a', '#6ecbff', '#9cff7a', '#ff9de2']

// Lichtjes langs de dakrand
const ROOF_LIGHTS = [
  [[524, 476], [800, 268]],
  [[1076, 476], [800, 268]],
].flatMap(([[x1, y1], [x2, y2]], s) =>
  Array.from({ length: 9 }, (_, k) => {
    const t = (k + 0.5) / 9
    const idx = s * 9 + k
    return {
      x: x1 + (x2 - x1) * t,
      y: y1 + (y2 - y1) * t + 10,
      color: LIGHT_COLORS[idx % LIGHT_COLORS.length],
      delay: rand(idx + 1100) * 2.5,
    }
  }),
)

// Bobbels in de sneeuwlaag op het dak
const ROOF_SNOW = Array.from({ length: 14 }, (_, i) => {
  const left = i < 7
  const t = ((i % 7) + 0.5) / 7
  const x = left ? 506 + (800 - 506) * t : 1094 - (1094 - 800) * t
  return { x, y: 468 - (468 - 242) * t - 6, r: 8 + rand(i + 1600) * 6 }
})

// Blokhut: rijen liggende stammen tussen de balk en de stenen voet
const LOGS = Array.from({ length: 8 }, (_, i) => 452 + i * 20)

// Stenen fundering in twee verspringende rijen
const STONES = [612, 628].flatMap((y, row) => {
  const out = []
  let x = 596 - row * 14
  for (let k = 0; x < 1004; k++) {
    const w = 26 + rand(1200 + row * 50 + k) * 24
    const x0 = Math.max(598, x)
    const x1 = Math.min(x + w, 1002)
    if (x1 - x0 > 6) out.push({ x: x0, y: y + 1, w: x1 - x0, fill: ['#8d96a3', '#7c8592', '#9aa3af'][k % 3] })
    x += w + 3
  }
  return out
})

// Houtstapel rechts naast het huis
const WOODPILE = [
  [1014, 634], [1030, 634], [1046, 634], [1062, 634],
  [1022, 618], [1038, 618], [1054, 618],
  [1030, 602], [1046, 602],
]

const FOOTPRINTS = Array.from({ length: 7 }, (_, i) => ({
  x: 800 + (i % 2 ? 9 : -9) + (i - 3) * 2,
  y: 670 + i * 30,
  s: 1 + i * 0.12,
}))

function Pine({ x, base, h, color, snow = '#f4f8ff' }) {
  const w = h * 0.55
  const tiers = [0, 1, 2].map((t) => {
    const top = base - h * (1 - t * 0.27)
    const bottom = base - h * (0.52 - t * 0.235)
    const half = (w / 2) * (0.6 + t * 0.2)
    return { top, bottom, half }
  })
  return (
    <g>
      <rect x={x - h * 0.03} y={base - h * 0.08} width={h * 0.06} height={h * 0.08} fill="#3a2a22" />
      {tiers.map((t, i) => (
        <g key={i}>
          <path d={`M${x} ${t.top} L ${x + t.half} ${t.bottom} L ${x - t.half} ${t.bottom} Z`} fill={color} />
          <path
            d={`M${x} ${t.top} L ${x + t.half * 0.4} ${t.top + (t.bottom - t.top) * 0.4}
               Q ${x} ${t.top + (t.bottom - t.top) * 0.5} ${x - t.half * 0.4} ${t.top + (t.bottom - t.top) * 0.4} Z`}
            fill={snow}
            opacity="0.9"
          />
        </g>
      ))}
    </g>
  )
}

// IJspegels die van een rand naar beneden hangen
function Icicles({ x1, x2, y, n, seed }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = x1 + ((x2 - x1) * (i + 0.5)) / n
        const len = 8 + rand(seed + i) * 16
        const w = 2.5 + rand(seed + i + 40) * 2
        return <path key={i} d={`M${x - w} ${y} L ${x + w} ${y} L ${x} ${y + len} Z`} fill="#e3f1ff" opacity="0.9" />
      })}
    </g>
  )
}

const heart = (cx, cy, s) =>
  `M${cx} ${cy + s} L ${cx - s} ${cy} A ${s / 2} ${s / 2} 0 0 1 ${cx} ${cy - s * 0.5} A ${s / 2} ${s / 2} 0 0 1 ${cx + s} ${cy} Z`

// Raam met groene luiken (met hartje) en een bloembak met dennentakjes
function ChaletWindow({ x, y, w, h, shutter = 20, box = true, children }) {
  return (
    <g>
      {[x - shutter - 4, x + w + 4].map((sx) => (
        <g key={sx}>
          <rect x={sx} y={y - 2} width={shutter} height={h + 4} rx="2" fill="#2f5d3a" stroke="#244a2e" strokeWidth="2" />
          <path d={`M${sx + 3} ${y + h * 0.22} H ${sx + shutter - 3} M${sx + 3} ${y + h * 0.78} H ${sx + shutter - 3}`} stroke="#244a2e" strokeWidth="2" />
          <path d={heart(sx + shutter / 2, y + h / 2, shutter * 0.22)} fill="#1a3322" />
          <rect x={sx - 1} y={y - 7} width={shutter + 2} height="6" rx="3" fill="#f4f8ff" />
        </g>
      ))}
      <rect x={x} y={y} width={w} height={h} fill="url(#outWindow)" />
      {children}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#f5ecd9" strokeWidth="5" />
      {box && (
        <>
          <path d={`M${x + w / 2} ${y} V ${y + h} M${x} ${y + h / 2} H ${x + w}`} stroke="#f5ecd9" strokeWidth="4" />
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse key={i} cx={x - 2 + (i * (w + 4)) / 6} cy={y + h + 2} rx="9" ry="5" fill={i % 2 ? '#1d5e3a' : '#27704a'} />
          ))}
          {[0.2, 0.45, 0.7, 0.9].map((t) => (
            <circle key={t} cx={x + w * t} cy={y + h} r="2.5" fill="#e53935" />
          ))}
          <rect x={x - 6} y={y + h + 4} width={w + 12} height="15" rx="2" fill="#6e4426" />
          <path d={`M${x - 6} ${y + h + 11} H ${x + w + 6}`} stroke="#5a361d" strokeWidth="1.5" />
          <rect x={x - 8} y={y + h + 2} width={w + 16} height="5" rx="2.5" fill="#f4f8ff" />
        </>
      )}
    </g>
  )
}

function OutsideScene({ daysLeft, onDoorClick, walking = false, onWalkEnd }) {
  return (
    <svg
      className={`outside${walking ? ' outside--walking' : ''}`}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-label={`Een besneeuwd huis in de nacht. Nog ${daysLeft} ${daysLeft === 1 ? 'dag' : 'dagen'} tot december.`}
    >
      <defs>
        <linearGradient id="outSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#060d24" />
          <stop offset="0.6" stopColor="#1b2d57" />
          <stop offset="1" stopColor="#34507f" />
        </linearGradient>
        <linearGradient id="outGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9f0fb" />
          <stop offset="1" stopColor="#c9d7ec" />
        </linearGradient>
        <radialGradient id="outMoonGlow">
          <stop offset="0" stopColor="#fdf6d8" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fdf6d8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="outWarmGlow">
          <stop offset="0" stopColor="#ffcf70" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffcf70" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="outWindow" cx="50%" cy="55%" r="70%">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset="1" stopColor="#f6b34f" />
        </radialGradient>
        <radialGradient id="outBulbHalo">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="outHouseClip">
          <path d="M604 452 L 800 288 L 996 452 Z" />
        </clipPath>
        <radialGradient id="outVignette" cx="50%" cy="50%" r="75%">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </radialGradient>
      </defs>

      {/* Alles wat 'in de wereld' staat: hier lopen we naartoe bij het binnengaan */}
      <g className="out-world">
      {/* Lucht, sterren en maan */}
      <rect width="1600" height="900" fill="url(#outSky)" />
      {STARS.map((s, i) => (
        <circle key={i} className="out-star" cx={s.x} cy={s.y} r={s.r} style={{ '--delay': `${s.delay}s` }} />
      ))}
      <circle cx="1290" cy="150" r="130" fill="url(#outMoonGlow)" />
      <circle cx="1290" cy="150" r="44" fill="#fdf6d8" />
      <circle cx="1276" cy="140" r="8" fill="#ece3bf" />
      <circle cx="1302" cy="166" r="5" fill="#ece3bf" />

      {/* Verre heuvel en bomen */}
      <path d="M0 600 Q 300 560 620 588 T 1220 578 T 1600 588 V 900 H 0 Z" fill="#b9c9e2" />
      {FAR_TREES.map((t, i) => (
        <Pine key={i} {...t} color="#2b4660" snow="#d6e1f2" />
      ))}
      <path d="M0 620 Q 400 596 820 612 T 1600 606 V 900 H 0 Z" fill="#d3dff0" />
      {NEAR_TREES.map((t, i) => (
        <Pine key={i} {...t} color="#1c3a33" />
      ))}

      {/* Besneeuwde grond */}
      <path d="M0 645 Q 400 618 800 638 T 1600 632 V 900 H 0 Z" fill="url(#outGround)" />

      {/* Lichtschijn van de ramen op de sneeuw */}
      <ellipse cx="678" cy="668" rx="80" ry="14" fill="#ffcf70" opacity="0.25" />
      <ellipse cx="922" cy="668" rx="80" ry="14" fill="#ffcf70" opacity="0.25" />

      {/* Pad naar de deur met voetstappen */}
      <path d="M772 646 L 828 646 L 980 900 L 620 900 Z" fill="#c6d4e8" />
      {FOOTPRINTS.map((f, i) => (
        <ellipse key={i} cx={f.x} cy={f.y} rx={4 * f.s} ry={7 * f.s} fill="#a9bbd6" />
      ))}

      {/* Het huis: een alpenchalet / blokhut */}
      <g>
        {/* Stenen schoorsteen met rook (onderkant verdwijnt achter het dak) */}
        <rect x="902" y="268" width="44" height="90" fill="#7c8592" />
        {[0, 1, 2, 3, 4].map((r) =>
          [0, 1, 2].map((c) => (
            <rect
              key={`${r}-${c}`}
              x={902 + c * 15 - (r % 2) * 7 + 1}
              y={270 + r * 14}
              width="13"
              height="12"
              rx="4"
              fill={['#8d96a3', '#9aa3af', '#7f8894'][(r + c) % 3]}
            />
          )),
        )}
        <rect x="896" y="262" width="56" height="9" rx="2" fill="#5f6772" />
        <rect x="893" y="254" width="62" height="11" rx="5.5" fill="#f4f8ff" />
        {[0, 1, 2].map((i) => (
          <circle key={i} className="out-smoke" cx="924" cy="244" r={12 + i * 3} style={{ '--delay': `${i * 1.3}s` }} />
        ))}

        {/* Gevel: verticale planken */}
        <path d="M604 452 L 800 288 L 996 452 Z" fill="#5e3b24" />
        <g clipPath="url(#outHouseClip)">
          {Array.from({ length: 22 }, (_, i) => (
            <line key={i} x1={610 + i * 18} y1="280" x2={610 + i * 18} y2="452" stroke="#4a2d1b" strokeWidth="3" />
          ))}
        </g>

        {/* Uitstekende balkkoppen onder het dak */}
        {[[640, 404], [700, 360], [900, 360], [960, 404], [800, 292]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x - 8} y={y} width="16" height="13" fill="#3f2616" />
            <rect x={x - 5} y={y + 3} width="10" height="7" fill="#6b4429" />
          </g>
        ))}

        {/* Zolderraam met luiken */}
        <ChaletWindow x={776} y={334} w={48} h={52} shutter={14} box={false}>
          <path d="M800 334 V 386 M776 360 H 824" stroke="#f5ecd9" strokeWidth="4" />
        </ChaletWindow>

        {/* Balkonnetje met uitgezaagde planken */}
        <rect x="716" y="402" width="168" height="26" fill="#3f2616" />
        {Array.from({ length: 14 }, (_, i) => {
          const x = 720 + i * 11.6
          return (
            <g key={i}>
              <rect x={x} y="400" width="10" height="28" fill="#9a6438" />
              <circle cx={x + 5} cy="414" r="2.4" fill="#3f2616" />
            </g>
          )
        })}
        <rect x="712" y="396" width="176" height="7" fill="#7a4a28" />
        <rect x="709" y="390" width="182" height="8" rx="4" fill="#f4f8ff" />
        <rect x="712" y="428" width="176" height="7" fill="#4a2c1a" />

        {/* Houten balk waar het dak begint */}
        <rect x="592" y="434" width="416" height="18" rx="2" fill="#5e2a20" />
        <line x1="594" y1="437" x2="1006" y2="437" stroke="#74352a" strokeWidth="2" />
        <line x1="592" y1="452" x2="1008" y2="452" stroke="#4a2019" strokeWidth="2" />

        {/* Muren van liggende boomstammen */}
        {LOGS.map((y, i) => (
          <g key={i}>
            <rect x="604" y={y} width="392" height="20" fill="#9a6438" />
            <rect x="604" y={y + 3} width="392" height="4" fill="#b47a48" opacity="0.7" />
            <line x1="604" y1={y + 19} x2="996" y2={y + 19} stroke="#5e3a20" strokeWidth="2" />
          </g>
        ))}
        {/* Kopse kanten van de stammen op de hoeken */}
        {LOGS.map((y, i) =>
          [600 - (i % 2) * 4, 1000 + (i % 2) * 4].map((cx) => (
            <g key={`${i}-${cx}`}>
              <circle cx={cx} cy={y + 10} r="10" fill="#c08a55" stroke="#7a4a28" strokeWidth="1.5" />
              <circle cx={cx} cy={y + 10} r="5" fill="none" stroke="#9a6438" strokeWidth="1.2" />
            </g>
          )),
        )}

        {/* Stenen fundering */}
        <rect x="596" y="612" width="408" height="32" fill="#5f6772" />
        {STONES.map((s, i) => (
          <rect key={i} x={s.x} y={s.y} width={s.w} height="14" rx="5" fill={s.fill} />
        ))}

        {/* Dak met diepe overstek */}
        <path d="M514 474 L 800 256 L 1086 474 L 1052 474 L 800 288 L 548 474 Z" fill="#3a2418" />
        <path d="M548 474 L 800 288 L 1052 474" fill="none" stroke="#5a3a26" strokeWidth="3" />

        {/* Dikke laag sneeuw op het dak */}
        <path d="M508 476 L 800 250 L 1092 476" fill="none" stroke="#cfdcef" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M506 468 L 800 242 L 1094 468" fill="none" stroke="#f4f8ff" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
        {ROOF_SNOW.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#f4f8ff" />
        ))}
        <ellipse cx="510" cy="478" rx="13" ry="8" fill="#f4f8ff" />
        <ellipse cx="1090" cy="478" rx="13" ry="8" fill="#f4f8ff" />
        <Icicles x1={500} x2={548} y={482} n={4} seed={1400} />
        <Icicles x1={1052} x2={1100} y={482} n={4} seed={1450} />

        {/* Lichtjes langs het dak */}
        {ROOF_LIGHTS.map((l, i) => (
          <g key={i} className="out-light" style={{ '--delay': `${l.delay}s` }}>
            <circle cx={l.x} cy={l.y} r="12" fill="url(#outBulbHalo)" opacity="0.35" />
            <ellipse cx={l.x} cy={l.y} rx="3.5" ry="5" fill={l.color} />
          </g>
        ))}

        {/* Linkerraam met een ster */}
        <ChaletWindow x={642} y={486} w={72} h={74}>
          <line x1="678" y1="486" x2="678" y2="503" stroke="#8a6a45" strokeWidth="1.5" />
          <path
            d="M678 503 L 683 514 L 695 514 L 685 521 L 689 533 L 678 526 L 667 533 L 671 521 L 661 514 L 673 514 Z"
            fill="#ffd45c"
            stroke="#e0a800"
            strokeWidth="1.5"
          />
        </ChaletWindow>

        {/* Rechterraam met de kerstboom binnen */}
        <ChaletWindow x={886} y={486} w={72} h={74}>
          <path d="M922 498 L 946 560 L 898 560 Z" fill="#1d5e3a" />
          {[[916, 524], [928, 536], [910, 548], [934, 552], [922, 512]].map(([x, y], i) => (
            <circle key={i} className="out-light" cx={x} cy={y} r="2.5" fill={LIGHT_COLORS[i]} style={{ '--delay': `${i * 0.4}s` }} />
          ))}
        </ChaletWindow>

        {/* Deurkozijn en afdakje */}
        <rect x="764" y="530" width="72" height="112" rx="3" fill="#3f2616" />
        <path d="M762 548 L 752 532 M838 548 L 848 532" stroke="#3a2418" strokeWidth="5" strokeLinecap="round" />
        <path d="M742 532 L 800 498 L 858 532 L 850 536 L 800 507 L 750 536 Z" fill="#3a2418" />
        <path d="M740 528 L 800 493 L 860 528" fill="none" stroke="#f4f8ff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        <Icicles x1={742} x2={762} y={536} n={2} seed={1500} />
        <Icicles x1={838} x2={858} y={536} n={2} seed={1520} />

        {/* Voordeur: houten planken, smeedijzeren scharnieren en een krans */}
        <g className="out-door" onClick={onDoorClick} role="button" tabIndex={0} aria-label="Voordeur"
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDoorClick()}>
          <rect x="772" y="538" width="56" height="102" rx="2" fill="#8a5530" />
          <path d="M786 538 V 640 M800 538 V 640 M814 538 V 640" stroke="#6e4426" strokeWidth="2" />
          <path d="M772 556 H 812 L 818 552 M772 622 H 812 L 818 618" stroke="#2b2b2b" strokeWidth="4" strokeLinecap="round" />
          <circle cx="800" cy="580" r="13" fill="none" stroke="#1d5e3a" strokeWidth="7" />
          <circle cx="792" cy="571" r="2.5" fill="#e53935" />
          <circle cx="809" cy="574" r="2.5" fill="#e53935" />
          <path d="M800 592 L 792 600 L 800 597 L 808 600 Z" fill="#e53935" />
          <circle cx="820" cy="604" r="3.5" fill="#2b2b2b" />
        </g>
        <rect x="752" y="638" width="96" height="10" rx="3" fill="#9aa3af" />
        <rect x="754" y="636" width="92" height="4" rx="2" fill="#f4f8ff" />

        {/* Lantaarntje naast de deur */}
        <circle cx="850" cy="566" r="50" fill="url(#outWarmGlow)" />
        <path d="M850 548 V 554" stroke="#2b2b2b" strokeWidth="2" />
        <rect x="843" y="556" width="14" height="20" rx="2" fill="#ffe2a6" stroke="#2b2b2b" strokeWidth="2.5" />
        <path d="M841 556 L 850 548 L 859 556 Z" fill="#2b2b2b" />

        {/* Houtstapel tegen de muur */}
        {WOODPILE.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="8" fill="#c08a55" stroke="#6e4426" strokeWidth="1.5" />
            <circle cx={x} cy={y} r="3.5" fill="none" stroke="#9a6438" strokeWidth="1" />
          </g>
        ))}
        <ellipse cx="1038" cy="592" rx="22" ry="5" fill="#f4f8ff" />

        {/* Sneeuw tegen de muur */}
        <path d="M584 648 Q 620 630 660 640 Q 700 630 740 642 L 752 648 Z" fill="#f4f8ff" />
        <path d="M848 648 Q 880 632 920 640 Q 960 628 1074 648 Z" fill="#f4f8ff" />
      </g>

      {/* Lantaarnpalen langs het pad */}
      {[640, 960].map((x, i) => (
        <g key={i}>
          <circle cx={x} cy="688" r="80" fill="url(#outWarmGlow)" />
          <rect x={x - 3} y="690" width="6" height="110" fill="#2b2b2b" />
          <ellipse cx={x} cy="800" rx="18" ry="5" fill="#a9bbd6" />
          <path d={`M${x - 13} 676 L ${x + 13} 676 L ${x + 9} 700 L ${x - 9} 700 Z`} fill="#ffe2a6" stroke="#2b2b2b" strokeWidth="3" />
          <path d={`M${x - 16} 676 L ${x} 662 L ${x + 16} 676 Z`} fill="#2b2b2b" />
          <path d={`M${x - 14} 672 L ${x} 660 L ${x + 14} 672`} fill="none" stroke="#f4f8ff" strokeWidth="4" strokeLinecap="round" />
        </g>
      ))}

      {/* Sneeuwpop */}
      <g>
        <ellipse cx="360" cy="768" rx="70" ry="12" fill="#a9bbd6" opacity="0.7" />
        <circle cx="360" cy="715" r="56" fill="#f7faff" />
        <circle cx="360" cy="642" r="41" fill="#f7faff" />
        <circle cx="360" cy="584" r="29" fill="#f7faff" />
        <path d="M304 722 Q 360 768 416 722 Q 410 768 360 771 Q 310 768 304 722 Z" fill="#dbe5f3" />
        {/* Sjaal */}
        <path d="M333 606 Q 360 618 387 606 L 389 616 Q 360 630 331 616 Z" fill="#e53935" />
        <path d="M372 614 L 386 650 L 374 652 L 364 618 Z" fill="#c62828" />
        {/* Hoed */}
        <rect x="336" y="556" width="48" height="7" rx="2" fill="#1f1f1f" />
        <rect x="343" y="524" width="34" height="34" rx="3" fill="#1f1f1f" />
        <rect x="343" y="548" width="34" height="6" fill="#c62828" />
        {/* Gezicht */}
        <circle cx="350" cy="578" r="3.5" fill="#1f1f1f" />
        <circle cx="370" cy="578" r="3.5" fill="#1f1f1f" />
        <path d="M360 586 L 386 592 L 360 594 Z" fill="#f28c28" />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={348 + i * 6} cy={599 + Math.sin((i / 4) * Math.PI) * 4} r="1.8" fill="#1f1f1f" />
        ))}
        {/* Knopen */}
        {[630, 650, 670].map((y) => (
          <circle key={y} cx="360" cy={y} r="4" fill="#1f1f1f" />
        ))}
        {/* Armen */}
        <path d="M322 638 L 272 606 M290 617 L 278 600 M398 638 L 452 612 M436 620 L 450 600" stroke="#5b3a24" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Aftelbordje */}
      <g transform="translate(1250 700) rotate(-4) scale(1.25) translate(-1450 -688)" style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.4))' }}>
        <rect x="1442" y="770" width="16" height="200" fill="#5b3a24" />
        <rect x="1335" y="688" width="230" height="92" rx="10" fill="#5b3a24" />
        <rect x="1343" y="696" width="214" height="76" rx="6" fill="#8b5a2b" />
        <path d="M1343 720 H 1557 M1343 746 H 1557" stroke="#7a4e25" strokeWidth="2" />
        <path d="M1333 694 Q 1340 678 1370 684 Q 1410 674 1450 682 Q 1500 672 1540 682 Q 1562 680 1567 694 Z" fill="#f4f8ff" />
        <text className="out-sign-text" x="1450" textAnchor="middle">
          <tspan x="1450" y="729">
            Nog {daysLeft} {daysLeft === 1 ? 'dag' : 'dagen'}
          </tspan>
          <tspan x="1450" y="759">tot december!</tspan>
        </text>
      </g>

      </g>

      {/* Vallende sneeuw */}
      {SNOWFLAKES.map((f, i) => (
        <circle
          key={i}
          className="out-flake"
          cx={f.x}
          cy="-20"
          r={f.r}
          style={{ '--duration': `${f.duration}s`, '--delay': `${f.delay}s`, '--drift': `${f.drift}px` }}
        />
      ))}

      <rect width="1600" height="900" fill="url(#outVignette)" pointerEvents="none" />

      {/* Na de laatste stap: zwart naar binnen */}
      {walking && (
        <rect
          className="out-fade"
          width="1600"
          height="900"
          onAnimationEnd={(e) => e.animationName === 'out-fade-in' && onWalkEnd?.()}
        />
      )}
    </svg>
  )
}

export default OutsideScene
