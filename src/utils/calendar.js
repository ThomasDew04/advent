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
