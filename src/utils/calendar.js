const params = () => new URLSearchParams(window.location.search)

// Staan we binnen (december) of buiten voor het huis te wachten?
// Om te testen: ?december (of ?dag=N) gaat naar binnen, ?buiten blijft buiten.
export function isInside(now = new Date()) {
  const p = params()
  if (p.has('buiten')) return false
  if (p.has('december') || p.has('dag')) return true
  return now.getMonth() === 11
}

// Gaat de voordeur open? Pas vanaf december (dan kun je ook terug naar buiten en weer binnen).
// Om binnen te testen voor december: ?december aan de URL toevoegen.
export function isDoorUnlocked(now = new Date()) {
  return now.getMonth() === 11
}

// Aantal dagen tot de eerstvolgende 1 december
export function daysUntilDecember(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const year = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear()
  const firstDecember = new Date(year, 11, 1)
  return Math.round((firstDecember - today) / 86400000)
}

// Tot welke dag mogen de luikjes open?
// In december: tot en met vandaag. Buiten december: nog niets.
// Tijdens ontwikkelen (npm run dev) zijn alle luikjes open.
// Om het slot te testen kun je ?dag=10 aan de URL toevoegen (werkt ook tijdens ontwikkelen).
export function getUnlockedUntil(now = new Date()) {
  const override = new URLSearchParams(window.location.search).get('dag')
  if (override !== null) {
    const day = Number(override)
    if (Number.isFinite(day)) return Math.max(0, Math.min(25, Math.floor(day)))
  }
  if (import.meta.env.DEV) return 25
  if (now.getMonth() === 11) return Math.min(25, now.getDate())
  return 0
}

// Het dagnummer van vandaag (1-25), of null als vandaag geen adventsdag is
export function getToday(unlockedUntil, now = new Date()) {
  const override = new URLSearchParams(window.location.search).get('dag')
  if (override !== null) return unlockedUntil >= 1 ? unlockedUntil : null
  if (now.getMonth() === 11 && now.getDate() <= 25) return now.getDate()
  return null
}
