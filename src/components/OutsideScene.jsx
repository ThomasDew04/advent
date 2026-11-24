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
  [[585, 460], [800, 312]],
  [[1015, 460], [800, 312]],
].flatMap(([[x1, y1], [x2, y2]], s) =>
  Array.from({ length: 9 }, (_, k) => {
    const t = (k + 0.5) / 9
    const idx = s * 9 + k
    return {
      x: x1 + (x2 - x1) * t,
      y: y1 + (y2 - y1) * t + 9,
      color: LIGHT_COLORS[idx % LIGHT_COLORS.length],
      delay: rand(idx + 1100) * 2.5,
    }
  }),
)

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
          <path d="M600 442 L 800 302 L 1000 442 V 640 H 600 Z" />
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
      <ellipse cx="685" cy="668" rx="80" ry="14" fill="#ffcf70" opacity="0.25" />
      <ellipse cx="915" cy="668" rx="80" ry="14" fill="#ffcf70" opacity="0.25" />

      {/* Pad naar de deur met voetstappen */}
      <path d="M772 646 L 828 646 L 980 900 L 620 900 Z" fill="#c6d4e8" />
      {FOOTPRINTS.map((f, i) => (
        <ellipse key={i} cx={f.x} cy={f.y} rx={4 * f.s} ry={7 * f.s} fill="#a9bbd6" />
      ))}

      {/* Het huis */}
      <g>
        {/* Schoorsteen met rook */}
        <rect x="900" y="300" width="42" height="90" fill="#7a4a3a" />
        <path d="M900 318 H 942 M900 338 H 942 M900 358 H 942 M921 300 V 318 M911 318 V 338 M931 318 V 338 M921 338 V 358" stroke="#5c3a2e" strokeWidth="2" />
        <rect x="895" y="292" width="52" height="12" rx="6" fill="#f4f8ff" />
        {[0, 1, 2].map((i) => (
          <circle key={i} className="out-smoke" cx="921" cy="282" r={12 + i * 3} style={{ '--delay': `${i * 1.3}s` }} />
        ))}

        {/* Gevel en muren */}
        <path d="M600 442 L 800 302 L 1000 442 Z" fill="#8e3b2f" />
        <rect x="600" y="440" width="400" height="200" fill="#8e3b2f" />
        <g clipPath="url(#outHouseClip)">
          {Array.from({ length: 14 }, (_, i) => {
            const y = 320 + i * 23
            return <line key={i} x1="600" y1={y} x2="1000" y2={y} stroke="#7a3127" strokeWidth="2" />
          })}
        </g>

        {/* Houten balk waar het dak begint */}
        <rect x="592" y="434" width="416" height="18" rx="2" fill="#5e2a20" />
        <line x1="594" y1="437" x2="1006" y2="437" stroke="#74352a" strokeWidth="2" />
        <line x1="592" y1="452" x2="1008" y2="452" stroke="#4a2019" strokeWidth="2" />

        {/* Rond zolderraampje */}
        <circle cx="800" cy="388" r="21" fill="url(#outWindow)" stroke="#f5ecd9" strokeWidth="5" />
        <path d="M800 367 V 409 M779 388 H 821" stroke="#f5ecd9" strokeWidth="3" />

        {/* Dak met sneeuw */}
        <path d="M550 460 L 800 280 L 800 312 L 585 460 Z" fill="#3b2622" />
        <path d="M1050 460 L 800 280 L 800 312 L 1015 460 Z" fill="#3b2622" />
        <path d="M546 458 L 800 274 L 1054 458" fill="none" stroke="#f4f8ff" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
        {[600, 650, 700, 750, 850, 900, 950, 1000].map((x, i) => {
          const y = x < 800 ? 458 - (x - 546) * 0.724 : 458 - (1054 - x) * 0.724
          return <circle key={i} cx={x} cy={y + 8} r={i % 2 ? 5 : 7} fill="#f4f8ff" />
        })}

        {/* Lichtjes langs het dak */}
        {ROOF_LIGHTS.map((l, i) => (
          <g key={i} className="out-light" style={{ '--delay': `${l.delay}s` }}>
            <circle cx={l.x} cy={l.y} r="12" fill="url(#outBulbHalo)" opacity="0.35" />
            <ellipse cx={l.x} cy={l.y} rx="3.5" ry="5" fill={l.color} />
          </g>
        ))}

        {/* Linkerraam met een ster */}
        <rect x="640" y="480" width="90" height="85" fill="url(#outWindow)" />
        <path
          d="M685 497 L 690 508 L 702 508 L 692 515 L 696 527 L 685 520 L 674 527 L 678 515 L 668 508 L 680 508 Z"
          fill="#ffd45c"
          stroke="#e0a800"
          strokeWidth="1.5"
        />
        <line x1="685" y1="480" x2="685" y2="497" stroke="#8a6a45" strokeWidth="1.5" />
        <rect x="640" y="480" width="90" height="85" fill="none" stroke="#f5ecd9" strokeWidth="6" />
        <path d="M685 480 V 565 M640 522 H 730" stroke="#f5ecd9" strokeWidth="5" />
        <rect x="632" y="563" width="106" height="10" rx="5" fill="#f4f8ff" />

        {/* Rechterraam met de kerstboom binnen */}
        <rect x="870" y="480" width="90" height="85" fill="url(#outWindow)" />
        <path d="M915 492 L 942 565 L 888 565 Z" fill="#1d5e3a" />
        {[[908, 520], [922, 532], [904, 548], [926, 552], [915, 505]].map(([x, y], i) => (
          <circle key={i} className="out-light" cx={x} cy={y} r="2.5" fill={LIGHT_COLORS[i]} style={{ '--delay': `${i * 0.4}s` }} />
        ))}
        <rect x="870" y="480" width="90" height="85" fill="none" stroke="#f5ecd9" strokeWidth="6" />
        <path d="M915 480 V 565 M870 522 H 960" stroke="#f5ecd9" strokeWidth="5" />
        <rect x="862" y="563" width="106" height="10" rx="5" fill="#f4f8ff" />

        {/* Voordeur */}
        <g className="out-door" onClick={onDoorClick} role="button" tabIndex={0} aria-label="Voordeur"
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDoorClick()}>
          <path d="M770 640 V 548 Q 800 516 830 548 V 640 Z" fill="#2e6b3f" stroke="#f5ecd9" strokeWidth="5" />
          <path d="M786 560 V 625 M814 560 V 625" stroke="#265a35" strokeWidth="3" />
          <circle cx="800" cy="566" r="13" fill="none" stroke="#1d5e3a" strokeWidth="7" />
          <circle cx="792" cy="557" r="2.5" fill="#e53935" />
          <circle cx="809" cy="560" r="2.5" fill="#e53935" />
          <path d="M800 578 L 792 586 L 800 583 L 808 586 Z" fill="#e53935" />
          <circle cx="821" cy="602" r="3" fill="#d4af37" />
        </g>
        <rect x="752" y="638" width="96" height="10" rx="3" fill="#dfe8f5" />

        {/* Lantaarntje naast de deur */}
        <circle cx="856" cy="548" r="55" fill="url(#outWarmGlow)" />
        <rect x="849" y="538" width="14" height="20" rx="2" fill="#ffe2a6" stroke="#2b2b2b" strokeWidth="2.5" />
        <path d="M847 538 L 856 530 L 865 538 Z" fill="#2b2b2b" />

        {/* Sneeuw tegen de muur */}
        <path d="M590 646 Q 620 628 660 640 Q 700 630 740 642 L 752 646 Z" fill="#f4f8ff" />
        <path d="M848 646 Q 880 630 920 640 Q 960 628 1010 646 Z" fill="#f4f8ff" />
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
