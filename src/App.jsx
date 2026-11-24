import { useEffect, useMemo, useState } from 'react'
import LivingRoom from './components/LivingRoom.jsx'
import DoorModal from './components/DoorModal.jsx'
import { getToday, getUnlockedUntil } from './utils/calendar.js'
import './App.css'

function App() {
  const [zoomed, setZoomed] = useState(false)
  const [openDay, setOpenDay] = useState(null)
  const [wiggle, setWiggle] = useState({ day: null, n: 0 })
  const [toast, setToast] = useState(null)

  const unlockedUntil = useMemo(() => getUnlockedUntil(), [])
  const today = useMemo(() => getToday(unlockedUntil), [unlockedUntil])

  const selectDay = (day) => {
    if (day <= unlockedUntil) {
      setOpenDay(day)
    } else {
      setWiggle((w) => ({ day, n: w.n + 1 }))
      setToast({ text: `Nog even geduld! Kerstbal ${day} mag pas open op ${day} december.`, id: Date.now() })
    }
  }

  // Melding na een paar seconden weer weg
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  // Escape: eerst het luikje sluiten, daarna terug naar de kamer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (openDay) setOpenDay(null)
      else if (zoomed) setZoomed(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openDay, zoomed])

  return (
    <>
      <LivingRoom
        zoomed={zoomed}
        onStart={() => setZoomed(true)}
        unlockedUntil={unlockedUntil}
        today={today}
        wiggle={wiggle}
        onSelectDay={selectDay}
      />

      {zoomed && (
        <button className="back-button" onClick={() => setZoomed(false)}>
          ← Terug naar de kamer
        </button>
      )}

      {toast && (
        <div key={toast.id} className="toast" role="status">
          {toast.text}
        </div>
      )}

      {openDay && <DoorModal day={openDay} onClose={() => setOpenDay(null)} />}
    </>
  )
}

export default App
