import { useEffect, useMemo, useState } from 'react'
import LivingRoom from './components/LivingRoom.jsx'
import DoorModal from './components/DoorModal.jsx'
import OutsideScene from './components/OutsideScene.jsx'
import { daysUntilDecember, getToday, getUnlockedUntil, isDoorUnlocked, isInside } from './utils/calendar.js'
import './App.css'

function App() {
  const [zoomed, setZoomed] = useState(false)
  const [openDay, setOpenDay] = useState(null)
  const [wiggle, setWiggle] = useState({ day: null, n: 0 })
  const [toast, setToast] = useState(null)

  const [inside, setInside] = useState(() => isInside())
  const [walking, setWalking] = useState(false)
  const daysLeft = useMemo(() => daysUntilDecember(), [])
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

  if (!inside) {
    return (
      <>
        <OutsideScene
          daysLeft={daysLeft}
          walking={walking}
          onWalkEnd={() => setInside(true)}
          onDoorClick={() => {
            if (walking) return
            if (isDoorUnlocked()) setWalking(true)
            else setToast({ text: 'De deur is nog op slot… Op 1 december mag je binnen!', id: Date.now() })
          }}
        />
        {toast && (
          <div key={toast.id} className="toast" role="status">
            {toast.text}
          </div>
        )}
      </>
    )
  }

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

      {zoomed ? (
        <button key="kamer" className="back-button" onClick={() => setZoomed(false)}>
          ← Terug naar de kamer
        </button>
      ) : (
        <button
          key="buiten"
          className="back-button"
          onClick={() => {
            setWalking(false)
            setInside(false)
          }}
        >
          ← Naar buiten
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
