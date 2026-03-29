/**
 * Distributes 100% equally across `count` participants at 2 decimal places.
 * Remainder goes to the last participant to guarantee sum rounds to 100.
 * e.g. equalSplit(3) → [33.33, 33.33, 33.34]
 */
export function equalSplit(count: number): number[] {
  if (count === 0) return []
  const base = Math.floor((100 / count) * 100) / 100
  const remainder = Math.round((100 - base * count) * 100) / 100
  return Array.from({ length: count }, (_, i) =>
    i === count - 1 ? Math.round((base + remainder) * 100) / 100 : base
  )
}
