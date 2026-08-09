"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import Footer from "@/components/footer"
import Image from "next/image"
import {
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Instagram,
  PlayCircle,
  Trophy,
  ArrowUpRight,
} from "lucide-react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { spring, staggerContainer, staggerItem } from "@/lib/motion"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

type IrisEvent = {
  id: number
  title: string
  description?: string
  dates?: string
  location?: string
  collab?: string
  image: string
  registrationOpen?: boolean
  registrationLink?: string
  status: "ongoing" | "previous" | string
  resultLink?: string
  liveSessionLink?: string
  speakerInstagram?: string
}

function ActionChip({
  href,
  children,
  tone = "brand",
}: {
  href?: string
  children: ReactNode
  tone?: "brand" | "emerald" | "pink" | "muted"
}) {
  const tones = {
    brand:
      "event-glass-chip text-[#c8c7ff] border-[#3230e0]/35 bg-[#3230e0]/20 hover:bg-[#3230e0]/30",
    emerald:
      "event-glass-chip text-emerald-100 border-emerald-400/30 bg-emerald-500/15 hover:bg-emerald-500/25",
    pink: "event-glass-chip text-pink-100 border-pink-400/30 bg-pink-500/15 hover:bg-pink-500/25",
    muted: "event-glass-chip text-slate-400 border-white/10 bg-white/5 cursor-default",
  }

  const className = cn(
    "inline-flex items-center justify-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-full text-xs font-medium border transition active:scale-95",
    tones[tone]
  )

  if (!href || tone === "muted") {
    return <span className={className}>{children}</span>
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  )
}

function EventActions({ event }: { event: IrisEvent }) {
  const isPrevious = event.status === "previous"
  return (
    <div className="flex flex-wrap gap-1.5">
      {isPrevious ? (
        <>
          {event.resultLink?.trim() && (
            <ActionChip href={event.resultLink} tone="brand">
              <Trophy className="w-3 h-3" />
              Results
            </ActionChip>
          )}
          {event.liveSessionLink?.trim() && (
            <ActionChip href={event.liveSessionLink} tone="emerald">
              <PlayCircle className="w-3 h-3" />
              Session
            </ActionChip>
          )}
        </>
      ) : event.registrationOpen && event.registrationLink?.trim() ? (
        <ActionChip href={event.registrationLink} tone="brand">
          Join Now
          <ArrowUpRight className="w-3 h-3" />
        </ActionChip>
      ) : (
        <ActionChip tone="muted">Registration Closed</ActionChip>
      )}
      {event.speakerInstagram?.trim() && (
        <ActionChip href={event.speakerInstagram} tone="pink">
          <Instagram className="w-3 h-3" />
          Guest
        </ActionChip>
      )}
    </div>
  )
}

function MetaRow({ event, compact }: { event: IrisEvent; compact?: boolean }) {
  const items = [
    event.dates && { icon: Calendar, text: event.dates },
    event.location && { icon: MapPin, text: event.location },
    !compact && event.collab && { icon: Users, text: event.collab },
  ].filter(Boolean) as { icon: typeof Calendar; text: string }[]

  if (!items.length) return null

  return (
    <div
      className={cn(
        "space-y-1.5 text-xs text-sky-200/80",
        compact && "space-y-1"
      )}
    >
      {items.map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-2 min-w-0">
          <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span className="truncate">{text}</span>
        </div>
      ))}
    </div>
  )
}

/** Desktop / tablet equal-height grid card — image fixed, copy clamped */
function EventGridCard({
  event,
  onOpen,
}: {
  event: IrisEvent
  onOpen: (e: IrisEvent) => void
}) {
  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -3, transition: spring.snappy }}
      whileTap={{ scale: 0.99 }}
      className="event-card meetup-card glass-card-event group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl"
    >
      <button
        type="button"
        onClick={() => onOpen(event)}
        className="flex h-full min-h-0 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3230e0]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1013]"
      >
        {/* Fixed media ratio — same for every card */}
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-800/80">
          <Image
            src={event.image}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <span
            className={cn(
              "event-glass-chip absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
              event.status === "ongoing"
                ? "text-emerald-100 border-emerald-400/30 bg-emerald-500/20"
                : "text-slate-100 border-white/20"
            )}
          >
            {event.status === "ongoing" ? "Live" : "Past"}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-5 md:p-6">
          <h3 className="line-clamp-2 mb-3 min-h-[2.75em] text-lg md:text-xl font-semibold text-white tracking-tight">
            {event.title}
          </h3>

          {event.description ? (
            <p className="line-clamp-2 mb-3 min-h-[2.75em] text-sm leading-relaxed text-slate-300">
              {event.description}
            </p>
          ) : (
            <p className="mb-3 min-h-[2.75em] text-sm text-transparent select-none">—</p>
          )}

          <div className="mb-4">
            <MetaRow event={event} />
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span className="text-xs font-medium text-sky-200/70 opacity-0 transition group-hover:opacity-100">
              View details
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 transition group-hover:text-sky-200" />
          </div>
        </div>
      </button>

      <div className="border-t border-white/10 bg-white/[0.03] px-5 pb-5 pt-3 md:px-6">
        <EventActions event={event} />
      </div>
    </motion.article>
  )
}

/** Phone: dense horizontal row — fits ~2–3 per viewport without giant posters */
function EventListRow({
  event,
  onOpen,
}: {
  event: IrisEvent
  onOpen: (e: IrisEvent) => void
}) {
  return (
    <motion.article
      variants={staggerItem}
      whileTap={{ scale: 0.99 }}
      className="event-card meetup-card glass-card-event overflow-hidden rounded-2xl"
    >
      <button
        type="button"
        onClick={() => onOpen(event)}
        className="flex w-full gap-3 p-3 text-left active:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3230e0]/50"
      >
        <div className="relative h-[5rem] w-[5rem] shrink-0 overflow-hidden rounded-xl bg-slate-800/80 sm:h-[5.25rem] sm:w-[5.25rem]">
          <Image
            src={event.image}
            alt=""
            fill
            sizes="84px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-white">
              {event.title}
            </h3>
            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
          </div>
          <MetaRow event={event} compact />
          {event.description && (
            <p className="mt-2 line-clamp-1 text-sm leading-relaxed text-slate-300">
              {event.description}
            </p>
          )}
        </div>
      </button>

      {/* Actions sit under row but compact — only if any exist */}
      {(event.resultLink?.trim() ||
        event.liveSessionLink?.trim() ||
        event.speakerInstagram?.trim() ||
        event.status !== "previous" ||
        event.registrationOpen) && (
        <div className="border-t border-white/10 bg-white/[0.03] px-3 py-2.5">
          <EventActions event={event} />
        </div>
      )}
    </motion.article>
  )
}

/** Fixed-height carousel card for previous events on desktop */
function EventCarouselCard({
  event,
  onOpen,
}: {
  event: IrisEvent
  onOpen: (e: IrisEvent) => void
}) {
  return (
    <motion.article
      whileHover={{ y: -2, transition: spring.snappy }}
      whileTap={{ scale: 0.99 }}
      className="event-card meetup-card glass-card-event flex h-full w-full flex-col overflow-hidden rounded-2xl"
    >
      <button
        type="button"
        onClick={() => onOpen(event)}
        className="flex h-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3230e0]/50"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-800/80">
          <Image
            src={event.image}
            alt=""
            fill
            sizes="280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="line-clamp-2 mb-3 min-h-[2.75em] text-lg font-semibold tracking-tight text-white">
            {event.title}
          </h3>
          <p className="line-clamp-2 mb-3 min-h-[2.75em] text-sm leading-relaxed text-slate-300">
            {event.description || "\u00A0"}
          </p>
          <div className="mb-1">
            <MetaRow event={event} compact />
          </div>
        </div>
      </button>
      <div className="mt-auto border-t border-white/10 bg-white/[0.03] px-5 py-3">
        <EventActions event={event} />
      </div>
    </motion.article>
  )
}

export default function Events() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const ongoingRef = useRef<HTMLElement>(null)
  const previousRef = useRef<HTMLElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [events, setEvents] = useState<IrisEvent[]>([])
  const [selected, setSelected] = useState<IrisEvent | null>(null)
  const [loading, setLoading] = useState(true)

  const isTitleInView = useInView(titleRef, { once: true })
  const isOngoingInView = useInView(ongoingRef, { once: true, margin: "-40px" })
  const isPreviousInView = useInView(previousRef, { once: true, margin: "-40px" })

  useEffect(() => {
    fetch("/events.json")
      .then((res) => res.json())
      .then((data: IrisEvent[]) => {
        data.sort((a, b) => b.id - a.id)
        setEvents(data)
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: "smooth" })
  }
  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: "smooth" })
  }
  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const ongoingEvents = useMemo(
    () => events.filter((e) => e.status === "ongoing"),
    [events]
  )
  const previousEvents = useMemo(
    () => events.filter((e) => e.status === "previous"),
    [events]
  )

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="page-shell max-w-6xl flex-1">
        <motion.header
          ref={titleRef}
          className="page-hero mb-8 md:mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <h1 className="page-hero-title">Event Calendar</h1>
          <p className="page-hero-sub">
            Workshops, competitions, and showcases from IRIS — tap a card for the full story.
          </p>
        </motion.header>

        {/* ── Ongoing ── */}
        <motion.section
          className="mb-10 md:mb-14"
          ref={ongoingRef}
          initial={{ opacity: 0, y: 12 }}
          animate={isOngoingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <div className="mb-4 flex items-end justify-between gap-3 md:mb-5">
            <h2 className="section-title !mb-0">Ongoing</h2>
            {!loading && (
              <span className="text-xs text-slate-500 tabular-nums">
                {ongoingEvents.length} live
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl bg-white/[0.04] sm:h-64"
                />
              ))}
            </div>
          ) : ongoingEvents.length === 0 ? (
            <div className="event-glass rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center">
              <p className="text-sm text-slate-300">No events are live right now.</p>
              <p className="mt-1 text-xs text-slate-400">
                Check Previous for past workshops and competitions.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: compact rows */}
              <motion.div
                className="flex flex-col gap-2.5 sm:hidden"
                variants={staggerContainer}
                initial="hidden"
                animate={isOngoingInView ? "visible" : "hidden"}
              >
                {ongoingEvents.map((event) => (
                  <EventListRow
                    key={event.id}
                    event={event}
                    onOpen={setSelected}
                  />
                ))}
              </motion.div>
              {/* Tablet+ : equal grid */}
              <motion.div
                className="hidden grid-cols-2 gap-4 sm:grid lg:grid-cols-3 lg:gap-5"
                variants={staggerContainer}
                initial="hidden"
                animate={isOngoingInView ? "visible" : "hidden"}
              >
                {ongoingEvents.map((event) => (
                  <EventGridCard
                    key={event.id}
                    event={event}
                    onOpen={setSelected}
                  />
                ))}
              </motion.div>
            </>
          )}
        </motion.section>

        {/* ── Previous ── */}
        <motion.section
          ref={previousRef}
          initial={{ opacity: 0, y: 12 }}
          animate={isPreviousInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
          className="mb-4"
        >
          <div className="mb-4 flex items-center justify-between gap-3 md:mb-5">
            <div className="min-w-0">
              <h2 className="section-title !mb-0">Previous</h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {previousEvents.length} past events
              </p>
            </div>
            {/* Carousel controls — desktop only (mobile uses vertical list) */}
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                aria-label="Scroll previous events left"
                className={cn(
                  "inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border backdrop-blur-md transition active:scale-95",
                  canScrollLeft
                    ? "border-[#3230e0]/30 bg-[#3230e0]/15 text-[#c8c7ff] hover:bg-[#3230e0]/25"
                    : "cursor-not-allowed border-white/10 bg-white/5 text-slate-600"
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                disabled={!canScrollRight}
                aria-label="Scroll previous events right"
                className={cn(
                  "inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full border backdrop-blur-md transition active:scale-95",
                  canScrollRight
                    ? "border-[#3230e0]/30 bg-[#3230e0]/15 text-[#c8c7ff] hover:bg-[#3230e0]/25"
                    : "cursor-not-allowed border-white/10 bg-white/5 text-slate-600"
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile: dense vertical list (no huge cards) */}
          <motion.div
            className="flex flex-col gap-2.5 sm:hidden"
            variants={staggerContainer}
            initial="hidden"
            animate={isPreviousInView ? "visible" : "hidden"}
          >
            {previousEvents.map((event) => (
              <EventListRow key={event.id} event={event} onOpen={setSelected} />
            ))}
          </motion.div>

          {/* Tablet+ : horizontal snap carousel with fixed card size */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="hidden gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory sm:flex md:gap-5"
          >
            {previousEvents.map((event) => (
              <div
                key={event.id}
                className="w-[min(72vw,17.5rem)] shrink-0 snap-start md:w-[18.5rem]"
              >
                <div className="h-full min-h-[20.5rem]">
                  <EventCarouselCard event={event} onOpen={setSelected} />
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Detail sheet — full description without stretching cards */}
      <AnimatePresence>
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="event-glass max-h-[min(90dvh,40rem)] w-[min(92vw,32rem)] overflow-y-auto border-white/15 bg-[#0F1013]/55 p-0 text-white shadow-2xl sm:rounded-2xl">
            {selected && (
              <>
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-800/80">
                  <Image
                    src={selected.image}
                    alt=""
                    fill
                    sizes="512px"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1013]/90 via-transparent to-transparent" />
                </div>
                <div className="space-y-4 px-5 pb-6 pt-4 sm:px-6">
                  <DialogHeader className="space-y-2 text-left">
                    <DialogTitle className="text-left text-lg md:text-xl font-semibold tracking-tight text-white">
                      {selected.title}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Event details for {selected.title}
                    </DialogDescription>
                  </DialogHeader>
                  <MetaRow event={selected} />
                  {selected.description && (
                    <p className="text-sm leading-relaxed text-slate-300">
                      {selected.description}
                    </p>
                  )}
                  <div className="pt-1">
                    <EventActions event={selected} />
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </AnimatePresence>

      <Footer />
    </div>
  )
}
