// Gedeelde vorm van de kerstboom: drie lagen (top, basis-y, halve breedte aan de basis)
export const TREE_X = 1300

export const TIERS = [
  { apex: 120, base: 290, half: 110 },
  { apex: 210, base: 430, half: 170 },
  { apex: 330, base: 580, half: 230 },
]

// Halve breedte van de boom op hoogte y
export const halfWidthAt = (y) =>
  Math.max(
    0,
    ...TIERS.filter((t) => y >= t.apex && y <= t.base).map(
      (t) => (t.half * (y - t.apex)) / (t.base - t.apex),
    ),
  )
