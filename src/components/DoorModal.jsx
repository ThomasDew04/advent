import { useEffect, useRef } from 'react'
import './DoorModal.css'

function DoorModal({ day, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  return (
    <div className="door-backdrop" onClick={onClose}>
      <div
        className="door-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="door-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="door-date">{day} december</p>
        <h2 id="door-title">Luikje {day}</h2>
        <p className="door-content">Wat hier in zit, volgt binnenkort…</p>
        <button ref={closeRef} className="door-close" onClick={onClose}>
          Sluiten
        </button>
      </div>
    </div>
  )
}

export default DoorModal
