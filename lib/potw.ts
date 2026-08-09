/**
 * Helpers for Photo of the Week selection on the homepage.
 * Always prefer the latest real winner when the current week has no entry.
 */

export type PotwEntry = {
  id?: number
  week?: number
  month?: string
  year?: string | number
  theme?: string
  photographer?: string
  email?: string
  description?: string
  image?: string
  [key: string]: unknown
}

export type PotwTree = Record<string, Record<string, PotwEntry[]>>

const MONTH_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const

/** Skip placeholders, TBA, and break weeks with no real winner */
export function isUnusablePotw(p: PotwEntry | null | undefined): boolean {
  if (!p) return true
  const theme = (p.theme ?? "").trim().toLowerCase()
  const photographer = (p.photographer ?? "").trim().toLowerCase()
  const image = (p.image ?? "").trim().toLowerCase()

  if (!image || image === "tba" || image === "/placeholder.svg") return true
  if (theme === "tba" || photographer === "tba") return true
  if (photographer === "no winner" || photographer === "no winner.") return true
  if (theme.includes("break due") || theme === "break" || theme.includes("saavan break"))
    return true
  return false
}

function monthIndex(name: string): number {
  const i = MONTH_ORDER.findIndex(
    (m) => m.toLowerCase() === name.trim().toLowerCase()
  )
  return i >= 0 ? i : -1
}

/** Flatten tree into entries tagged with year + month for sorting */
export function flattenPotw(data: PotwTree): PotwEntry[] {
  const out: PotwEntry[] = []
  for (const year of Object.keys(data)) {
    const months = data[year]
    if (!months) continue
    for (const month of Object.keys(months)) {
      const list = months[month]
      if (!Array.isArray(list)) continue
      for (const photo of list) {
        out.push({
          ...photo,
          year,
          month: photo.month || month,
        })
      }
    }
  }
  return out
}

/** Newest first: year, then calendar month, then week number */
export function comparePotwNewestFirst(a: PotwEntry, b: PotwEntry): number {
  const ya = parseInt(String(a.year ?? 0), 10)
  const yb = parseInt(String(b.year ?? 0), 10)
  if (yb !== ya) return yb - ya

  const ma = monthIndex(String(a.month ?? ""))
  const mb = monthIndex(String(b.month ?? ""))
  if (mb !== ma) return mb - ma

  return (b.week ?? 0) - (a.week ?? 0)
}

/**
 * Pick the photo to feature on the homepage:
 * 1) Current calendar week if a real winner exists
 * 2) Otherwise the single most recent real winner in the whole archive
 *    (so gaps in Jun/Jul/Aug keep showing the last uploaded POTW)
 */
export function selectFeaturedPotw(
  data: PotwTree,
  now: Date = new Date()
): PotwEntry | null {
  if (!data || Object.keys(data).length === 0) return null

  const all = flattenPotw(data).filter((p) => !isUnusablePotw(p))
  if (all.length === 0) return null

  all.sort(comparePotwNewestFirst)

  const currentYear = String(now.getFullYear())
  const monthName = now.toLocaleString("en-US", { month: "long" })
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
  const weekOfMonth = Math.ceil((now.getDate() + firstDay) / 7)

  const currentWeek = all.find(
    (p) =>
      String(p.year) === currentYear &&
      String(p.month).toLowerCase() === monthName.toLowerCase() &&
      p.week === weekOfMonth
  )
  if (currentWeek) return currentWeek

  // Latest real photo anywhere in the archive
  return all[0] ?? null
}
