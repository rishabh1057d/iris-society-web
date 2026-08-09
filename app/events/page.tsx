"use client"

import { useEffect, useRef, useState } from "react"
import Footer from "@/components/footer"
import Image from "next/image"
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { spring, staggerContainer, staggerItem } from "@/lib/motion"

export default function Events() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const ongoingRef = useRef<HTMLElement>(null)
  const previousRef = useRef<HTMLElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [events, setEvents] = useState<any[]>([])

  const isTitleInView = useInView(titleRef, { once: true })
  const isOngoingInView = useInView(ongoingRef, { once: true, margin: "-40px" })
  const isPreviousInView = useInView(previousRef, { once: true, margin: "-40px" })

  useEffect(() => {
    fetch("/events.json")
      .then((res) => res.json())
      .then((data) => {
        data.sort((a: { id: number }, b: { id: number }) => b.id - a.id)
        setEvents(data)
      })
      .catch(() => setEvents([]))
  }, [])

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -320, behavior: "smooth" })
  }

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 320, behavior: "smooth" })
  }

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const ongoingEvents = events.filter((e) => e.status === "ongoing")
  const previousEvents = events.filter((e) => e.status === "previous")

  /** Same card shell as Photowalks — full-width in grids, fixed width in carousels */
  const EventCard = ({ event }: { event: any }) => (
    <motion.div
      className="event-card meetup-card glass-card-event w-full bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden"
      variants={staggerItem}
      whileHover={{ y: -3, transition: spring.snappy }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="aspect-[3/4] bg-slate-800 relative">
        <Image
          src={event.image}
          alt={event.title}
          width={300}
          height={400}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-3 text-white tracking-tight">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-slate-300 mb-3 text-sm leading-relaxed">{event.description}</p>
        )}
        <div className="space-y-1.5 text-xs text-sky-200/80 mb-4">
          {event.dates && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{event.dates}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{event.location}</span>
            </div>
          )}
          {event.collab && (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{event.collab}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {event.status === "previous" ? (
            <>
              {event.resultLink?.trim() && (
                <a
                  href={event.resultLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs min-h-[36px] inline-flex items-center px-3 py-1.5 rounded-full bg-[#d4a574]/15 text-[#f5f0e8] border border-[#d4a574]/25 hover:bg-[#d4a574]/25 active:scale-95 transition"
                >
                  View Results
                </a>
              )}
              {event.liveSessionLink?.trim() && (
                <a
                  href={event.liveSessionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs min-h-[36px] inline-flex items-center px-3 py-1.5 rounded-full bg-emerald-600/20 text-emerald-100 border border-emerald-400/20 hover:bg-emerald-600/30 active:scale-95 transition"
                >
                  Live Session
                </a>
              )}
            </>
          ) : event.registrationOpen ? (
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs min-h-[36px] inline-flex items-center px-3 py-1.5 rounded-full bg-[#d4a574]/15 text-[#f5f0e8] border border-[#d4a574]/25 hover:bg-[#d4a574]/25 active:scale-95 transition"
            >
              Join Now
            </a>
          ) : (
            <span className="text-xs min-h-[36px] inline-flex items-center px-3 py-1.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
              Registration Closed
            </span>
          )}
          {event.speakerInstagram?.trim() && (
            <a
              href={event.speakerInstagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs min-h-[36px] inline-flex items-center px-3 py-1.5 rounded-full bg-pink-600/20 text-pink-100 border border-pink-400/20 hover:bg-pink-600/30 active:scale-95 transition"
            >
              Our Guest
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <div className="page-shell max-w-7xl flex-1">
        <motion.header
          ref={titleRef}
          className="page-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <h1 className="page-hero-title">Event Calendar</h1>
          <p className="page-hero-sub">Workshops, competitions, and showcases from IRIS.</p>
        </motion.header>

        {/* Ongoing — same responsive grid as Photowalks (1 col phone → 3 col desktop) */}
        <motion.section
          className="mb-14 md:mb-16"
          ref={ongoingRef}
          initial={{ opacity: 0, y: 12 }}
          animate={isOngoingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <h2 className="section-title">Ongoing Events</h2>
          {ongoingEvents.length === 0 ? (
            <p className="text-slate-400 text-sm">No events are going on right now.</p>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate={isOngoingInView ? "visible" : "hidden"}
            >
              {ongoingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Previous — horizontal carousel matching Past Photowalks */}
        <motion.section
          ref={previousRef}
          initial={{ opacity: 0, y: 12 }}
          animate={isPreviousInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="section-title !mb-0 flex-1">Previous Events</h2>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                aria-label="Scroll previous events left"
                className={`inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-full border backdrop-blur-md transition active:scale-95 ${
                  canScrollLeft
                    ? "bg-[#d4a574]/15 border-[#d4a574]/30 text-[#f5f0e8] hover:bg-[#d4a574]/25"
                    : "bg-white/5 border-white/10 text-slate-600 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                disabled={!canScrollRight}
                aria-label="Scroll previous events right"
                className={`inline-flex items-center justify-center min-h-[40px] min-w-[40px] rounded-full border backdrop-blur-md transition active:scale-95 ${
                  canScrollRight
                    ? "bg-[#d4a574]/15 border-[#d4a574]/30 text-[#f5f0e8] hover:bg-[#d4a574]/25"
                    : "bg-white/5 border-white/10 text-slate-600 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex gap-5 md:gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
            onScroll={handleScroll}
          >
            {previousEvents.map((event) => (
              <div
                key={event.id}
                className="snap-start flex-shrink-0 w-[min(100%,18rem)] sm:w-72"
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  )
}
