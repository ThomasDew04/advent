// Welke kerstballen zijn al eens opengebroken? Wordt in de browser onthouden,
// zodat de hamer-animatie per kerstbal maar één keer speelt.
// Om opnieuw te testen: ?reset aan de URL toevoegen (wist de lijst).

const KEY = 'advent-opened'

function read() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

if (new URLSearchParams(window.location.search).has('reset')) localStorage.removeItem(KEY)

export const isOpened = (day) => read().has(day)

export function markOpened(day) {
  const opened = read()
  opened.add(day)
  localStorage.setItem(KEY, JSON.stringify([...opened]))
}
