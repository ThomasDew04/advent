import { useEffect, useMemo, useState } from 'react'
import LivingRoom from './components/LivingRoom.jsx'
import DoorModal from './components/DoorModal.jsx'
import OutsideScene from './components/OutsideScene.jsx'
import * as music from './audio/music.js'
import { playFootsteps, preloadFootsteps } from './audio/footsteps.js'
import { reducedMotion } from './utils/framing.js'
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
  const [muted, setMuted] = useState(() => localStorage.getItem('advent-muted') === '1')

  // Kerstdeuntje: speelt binnen, stopt buiten of als het geluid uit staat.
  // Browsers laten pas geluid toe na een klik/tik; lukt het nog niet, dan start het bij de eerste aanraking.
  useEffect(() => {
    if (!inside || muted) {
      music.stop()
      return
    }
    let active = true
    const start = () => music.unlock().then(() => active && music.play())
    start()
    window.addEventListener('pointerdown', start)
    window.addEventListener('keydown', start)
    return () => {
      active = false
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
  }, [inside, muted])

  // Buiten: het geluid van de voetstappen alvast ophalen
  useEffect(() => {
    if (!inside && isDoorUnlocked()) preloadFootsteps()
  }, [inside])

  const toggleMuted = () => {
    music.unlock()
    setMuted((m) => {
      localStorage.setItem('advent-muted', m ? '0' : '1')
      return !m
    })
  }

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
            if (isDoorUnlocked()) {
              // Nu het nog een klik is: geluid toelaten, en voetstappen in de sneeuw bij de wandeling
              const clickedAt = performance.now()
              music.unlock().then(() => !muted && !reducedMotion() && playFootsteps(clickedAt))
              setWalking(true)
            }
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

      <button
        className="sound-button"
        onClick={toggleMuted}
        aria-label={muted ? 'Muziek aanzetten' : 'Muziek uitzetten'}
        title={muted ? 'Muziek aanzetten' : 'Muziek uitzetten'}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 9 H 8 L 13 5 V 19 L 8 15 H 4 Z" fill="currentColor" />
          {muted ? (
            <path d="M16 9 L 21 15 M21 9 L 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <path d="M16 9 Q 18 12 16 15 M18.5 6.5 Q 22.5 12 18.5 17.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          )}
        </svg>
      </button>

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
