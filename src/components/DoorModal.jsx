import { useEffect, useRef } from 'react'
import DoorContent from './DoorContent.jsx'
import { DAYS } from '../content/days.js'
import './DoorModal.css'

function DoorModal({ day, onClose }) {
  const closeRef = useRef(null)
  const content = DAYS[day]

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  return (
    <div className="door-backdrop" onClick={onClose}>
      <div
        className={`door-card door-card--${content?.type ?? 'empty'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="door-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="door-date">{day} december</p>
        <h2 id="door-title">{content?.title ?? `Luikje ${day}`}</h2>
        <div className="door-body">
          <DoorContent content={content} />
        </div>
        <button ref={closeRef} className="door-close" onClick={onClose}>
          Sluiten
        </button>
      </div>
    </div>
  )
}

export default DoorModal
