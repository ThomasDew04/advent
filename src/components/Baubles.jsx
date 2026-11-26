import { BAUBLES, RADIUS } from './baubleData.js'

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
            <circle className="bauble-hit" cx={b.x} cy={b.y} r={RADIUS + 9} />
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
