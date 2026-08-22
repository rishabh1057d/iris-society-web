"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import StaticImage from "@/components/static-image"
import Link from "next/link"
import Footer from "@/components/footer"
import {
  ChevronLeft,
  ChevronRight,
  X,
  Camera,
  User,
  BookOpen,
  Send,
  CalendarDays,
} from "lucide-react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { spring, staggerContainer, staggerItem } from "@/lib/motion"
import { cn } from "@/lib/utils"

type WeeklyPhoto = {
  id: number
  week: number
  month: string
  theme: string
  photographer: string
  email: string
  description: string
  image: string
}

const ALL_MONTHS = [
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

const GUIDELINES_URL =
  "https://docs.google.com/document/d/1pytF-tK4XXgi8r6lLzEMzyEXjD0vAjT63ff6oejznrY/edit?usp=sharing"
const SUBMIT_URL =
  "https://docs.google.com/forms/u/1/d/e/1FAIpQLSczSzMGIAd-sE_nxe9wOFSrsYy59lzRBhU9e5uhOjMtmIquLQ/viewform"

function getAvailableMonths(year: number) {
  if (year === 2025) return ALL_MONTHS.slice(1) // February onwards
  return [...ALL_MONTHS]
}

function getCurrentYear() {
  return new Date().getFullYear()
}

function getDefaultMonth(year: number) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthName = now.toLocaleString("default", { month: "long" })
  const available = getAvailableMonths(year)
  if (currentYear === year && available.includes(currentMonthName as (typeof ALL_MONTHS)[number])) {
    return currentMonthName
  }
  return available[0]
}

function isBreakOrEmpty(photo: WeeklyPhoto) {
  const photographer = photo.photographer?.trim().toLowerCase() ?? ""
  const theme = photo.theme?.trim().toLowerCase() ?? ""
  return (
    photographer === "no winner" ||
    photographer === "tba" ||
    theme === "tba" ||
    theme.includes("break due")
  )
}

/** Compact grid card - photo-first, equal aspect, glass rim */
function PotwCard({
  photo,
  onOpen,
}: {
  photo: WeeklyPhoto
  onOpen: (p: WeeklyPhoto) => void
}) {
  const isBreak = isBreakOrEmpty(photo)

  return (
    <motion.button
      type="button"
      variants={staggerItem}
      whileHover={{ y: -3, transition: spring.snappy }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onOpen(photo)}
      className={cn(
        "potw-card glass-card-event group relative flex w-full flex-col overflow-hidden rounded-2xl text-left",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3230e0]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1013]"
      )}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900/80 sm:aspect-[4/5]">
        <StaticImage
          src={photo.image || "/placeholder.svg"}
          alt={
            isBreak
              ? `${photo.theme} - Week ${photo.week}`
              : `${photo.theme} by ${photo.photographer}`
          }
          fill
          className={cn(
            "object-cover transition duration-500 ease-out group-hover:scale-[1.04]",
            isBreak && "opacity-80 grayscale-[0.25]"
          )}
        />

        {/* Soft bottom wash so text stays legible */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

        {/* Week chip */}
        <span className="event-glass-chip absolute left-2.5 top-2.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-100 sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs">
          Week {photo.week}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5">
          <p className="line-clamp-2 text-sm font-semibold leading-snug tracking-tight text-white sm:text-base">
            {photo.theme}
          </p>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-300">
            <User className="h-3 w-3 shrink-0 opacity-70" />
            <span className="truncate">
              {isBreak ? "No winner" : photo.photographer}
            </span>
          </p>
        </div>
      </div>
    </motion.button>
  )
}

/** Full-screen / desktop lightbox - image + caption both in view on phone */
function PotwViewer({
  photo,
  onClose,
}: {
  photo: WeeklyPhoto
  onClose: () => void
}) {
  const isBreak = isBreakOrEmpty(photo)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4 md:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Week ${photo.week}: ${photo.theme}`}
    >
      {/* Scrim */}
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        aria-label="Close photo"
        onClick={onClose}
      />

      <motion.div
        className={cn(
          "relative z-10 flex w-full flex-col overflow-hidden",
          /* Mobile: full-height sheet so image + meta share the viewport */
          "h-[100dvh] max-h-[100dvh] rounded-none",
          /* Tablet+: floating glass panel */
          "sm:h-auto sm:max-h-[min(92dvh,880px)] sm:max-w-5xl sm:rounded-3xl",
          "border border-white/12 bg-[#0F1013]/92 shadow-[0_24px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.1)]",
          "backdrop-blur-2xl"
        )}
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={spring.snappy}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top chrome - safe area for notched phones */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-4 sm:py-3 sm:pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="event-glass-chip shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold text-sky-100">
              Week {photo.week}
            </span>
            <span className="hidden truncate text-xs text-slate-400 sm:inline">
              {photo.month}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/10 active:scale-95"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body: column on phone, row on desktop - both panes always visible */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Image pane - fixed share of viewport on mobile so meta is never below the fold */}
          <div
            className={cn(
              "relative flex min-h-0 items-center justify-center bg-black/40",
              "h-[min(46dvh,420px)] max-h-[46dvh] w-full shrink-0",
              "sm:h-[min(52dvh,520px)] sm:max-h-[min(52dvh,520px)]",
              "md:h-auto md:max-h-none md:min-h-[420px] md:w-[58%] md:flex-1"
            )}
          >
            <div className="relative h-full w-full">
              <StaticImage
                src={photo.image || "/placeholder.svg"}
                alt={photo.theme}
                fill
                className="object-contain p-2 sm:p-3 md:p-4"
                priority
              />
            </div>
          </div>

          {/* Meta pane - always in view on mobile; scroll only if copy is long */}
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain",
              "border-t border-white/10 md:border-l md:border-t-0",
              "bg-white/[0.03] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-5 sm:pb-5 md:w-[42%] md:max-w-md md:px-6 md:py-6"
            )}
          >
            <div className="mb-3 flex items-start gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3230e0]/25 ring-1 ring-[#3230e0]/40">
                <Camera className="h-4 w-4 text-[#c8c7ff]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Photographer
                </p>
                <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                  {isBreak ? "No winner this week" : photo.photographer}
                </h2>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                Theme
              </p>
              <p className="text-sm font-medium leading-snug text-sky-200/90 md:text-base">
                {photo.theme}
              </p>
            </div>

            {photo.description?.trim() && (
              <div className="min-h-0 flex-1">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                  About the shot
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  {photo.description}
                </p>
              </div>
            )}

            <p className="mt-5 text-xs text-slate-500 md:mt-auto md:pt-6">
              {photo.month} · Photo of the Week
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function POTW() {
  const [selectedYear, setSelectedYear] = useState(getCurrentYear)
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getDefaultMonth(getCurrentYear())
  )
  const [selectedPhoto, setSelectedPhoto] = useState<WeeklyPhoto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [weeklyPhotos, setWeeklyPhotos] = useState<
    Record<number, Record<string, WeeklyPhoto[]>>
  >({})

  const titleRef = useRef<HTMLHeadingElement>(null)
  const isTitleInView = useInView(titleRef, { once: true })

  useEffect(() => {
    setIsLoading(true)
    fetch("/potw.json")
      .then((res) => res.json())
      .then((data) => {
        const converted: Record<number, Record<string, WeeklyPhoto[]>> = {}
        Object.keys(data).forEach((yearStr) => {
          converted[parseInt(yearStr, 10)] = data[yearStr]
        })
        setWeeklyPhotos(converted)
      })
      .catch((err) => {
        console.error("Failed to load POTW data:", err)
        setWeeklyPhotos({})
      })
      .finally(() => setIsLoading(false))
  }, [])

  const availableYears = useMemo(() => {
    const years = Object.keys(weeklyPhotos)
      .map(Number)
      .sort((a, b) => b - a)
    const current = getCurrentYear()
    if (!years.includes(current)) years.unshift(current)
    return years
  }, [weeklyPhotos])

  const monthPhotos = useMemo(() => {
    const list = weeklyPhotos[selectedYear]?.[selectedMonth] ?? []
    return [...list].sort((a, b) => a.week - b.week)
  }, [weeklyPhotos, selectedYear, selectedMonth])

  const canGoPrevYear = availableYears.indexOf(selectedYear) < availableYears.length - 1
  const canGoNextYear = availableYears.indexOf(selectedYear) > 0

  const handleMonthChange = useCallback(
    (newMonth: string, year?: number) => {
      const targetYear = year !== undefined ? year : selectedYear
      setSelectedMonth(newMonth)
      if (year !== undefined) setSelectedYear(targetYear)
    },
    [selectedYear]
  )

  const handlePrevMonth = () => {
    const available = getAvailableMonths(selectedYear)
    const idx = available.indexOf(selectedMonth as (typeof ALL_MONTHS)[number])
    if (idx > 0) {
      handleMonthChange(available[idx - 1])
      return
    }
    const prevYear = selectedYear - 1
    if (weeklyPhotos[prevYear]) {
      const prevMonths = getAvailableMonths(prevYear)
      handleMonthChange(prevMonths[prevMonths.length - 1], prevYear)
    }
  }

  const handleNextMonth = () => {
    const available = getAvailableMonths(selectedYear)
    const idx = available.indexOf(selectedMonth as (typeof ALL_MONTHS)[number])
    if (idx < available.length - 1) {
      handleMonthChange(available[idx + 1])
      return
    }
    const nextYear = selectedYear + 1
    if (weeklyPhotos[nextYear] || nextYear === getCurrentYear()) {
      const nextMonths = getAvailableMonths(nextYear)
      handleMonthChange(nextMonths[0], nextYear)
    }
  }

  const handleYearChange = (newYear: number) => {
    const available = getAvailableMonths(newYear)
    const monthToUse = available.includes(selectedMonth as (typeof ALL_MONTHS)[number])
      ? selectedMonth
      : available[0]
    handleMonthChange(monthToUse, newYear)
  }

  const closeViewer = useCallback(() => setSelectedPhoto(null), [])

  return (
    <div
      className="relative flex min-h-full flex-1 flex-col"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="page-shell max-w-6xl flex-1">
        {/* Hero */}
        <motion.header
          ref={titleRef}
          className="page-hero mb-6 md:mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <h1 className="page-hero-title">Photo of the Week</h1>
          <p className="page-hero-sub">
            Members shoot a weekly theme. Browse winners, open a frame for the story.
            Share yours in the WhatsApp group or Gspace to enter.
          </p>
        </motion.header>

        {/* CTAs */}
        <motion.div
          className="mb-8 flex flex-col items-stretch justify-center gap-2.5 sm:mb-10 sm:flex-row sm:items-center sm:gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...spring.default, delay: 0.05 }}
        >
          <Link
            href={GUIDELINES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary !min-h-[44px] !px-5 !py-2.5 !text-sm"
          >
            <BookOpen className="mr-2 h-4 w-4 opacity-80" />
            View Guidelines
          </Link>
          <Link
            href={SUBMIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !min-h-[44px] !px-5 !py-2.5 !text-sm"
          >
            <Send className="mr-2 h-4 w-4" />
            Submit Now
          </Link>
        </motion.div>

        {/* Period navigator */}
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...spring.default, delay: 0.08 }}
        >
          {/* Year */}
          <div className="mb-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                const i = availableYears.indexOf(selectedYear)
                if (i < availableYears.length - 1) handleYearChange(availableYears[i + 1])
              }}
              disabled={!canGoPrevYear}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous year"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <motion.span
              key={selectedYear}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.snappy}
              className="min-w-[4.5rem] text-center text-lg font-semibold tracking-tight text-sky-200 tabular-nums md:text-xl"
            >
              {selectedYear}
            </motion.span>
            <button
              type="button"
              onClick={() => {
                const i = availableYears.indexOf(selectedYear)
                if (i > 0) handleYearChange(availableYears[i - 1])
              }}
              disabled={!canGoNextYear}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next year"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Month bar */}
          <div className="event-glass flex items-center justify-between gap-2 rounded-2xl px-1.5 py-1.5 sm:px-2 sm:py-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-200 transition hover:bg-white/10 active:scale-95"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <motion.div
              key={`${selectedYear}-${selectedMonth}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.snappy}
              className="flex min-w-0 flex-col items-center"
            >
              <span className="flex items-center gap-1.5 text-lg font-semibold tracking-tight text-white md:text-xl">
                <CalendarDays className="hidden h-4 w-4 text-sky-300/80 sm:inline" />
                {selectedMonth}
              </span>
              {!isLoading && (
                <span className="text-xs text-slate-400 tabular-nums">
                  {monthPhotos.length}{" "}
                  {monthPhotos.length === 1 ? "photo" : "photos"}
                </span>
              )}
            </motion.div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-200 transition hover:bg-white/10 active:scale-95"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl bg-white/[0.05] sm:aspect-[4/5]"
              />
            ))}
          </div>
        )}

        {/* Grid */}
        {!isLoading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedYear}-${selectedMonth}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={spring.snappy}
            >
              {monthPhotos.length > 0 ? (
                <motion.div
                  className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {monthPhotos.map((photo) => (
                    <PotwCard
                      key={photo.id}
                      photo={photo}
                      onOpen={setSelectedPhoto}
                    />
                  ))}
                </motion.div>
              ) : (
                <div className="event-glass rounded-2xl border border-dashed border-white/15 px-4 py-12 text-center">
                  <Camera className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                  <p className="text-sm text-slate-300">
                    No photos for {selectedMonth} {selectedYear}.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try another month, or submit this week&apos;s theme.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {selectedPhoto && (
          <PotwViewer photo={selectedPhoto} onClose={closeViewer} />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
