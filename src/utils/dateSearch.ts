export interface ParsedDate {
  year: number
  month: number
  day: number
}

const PATTERNS: RegExp[] = [
  /^(\d{4})(\d{2})(\d{2})$/,          // YYYYMMDD
  /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, // YYYY/M/D or YYYY/MM/DD
  /^(\d{4})-(\d{1,2})-(\d{1,2})$/,   // YYYY-M-D or YYYY-MM-DD
]

export function parseDateSearch(input: string): ParsedDate | null {
  for (const pattern of PATTERNS) {
    const m = input.match(pattern)
    if (m) {
      return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) }
    }
  }
  return null
}

export function matchesDateSearch(timestamp: number, parsed: ParsedDate): boolean {
  const d = new Date(timestamp)
  return (
    d.getFullYear() === parsed.year &&
    d.getMonth() + 1 === parsed.month &&
    d.getDate() === parsed.day
  )
}
