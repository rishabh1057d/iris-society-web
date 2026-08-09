"use client"

import { useEffect, useRef, useState } from "react"
import Footer from "@/components/footer"
import Image from "next/image"
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { spring, staggerContainer, staggerItem } from "@/lib/motion"

export default function Meetups() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const upcomingRef = useRef<HTMLElement>(null)
  const previousRef = useRef<HTMLElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [meetups, setMeetups] = useState<any[]>([])

  const isTitleInView = useInView(titleRef, { once: true })
  const isUpcomingInView = useInView(upcomingRef, { once: true, margin: "-40px" })
  const isPreviousInView = useInView(previousRef, { once: true, margin: "-40px" })

  useEffect(() => {
    fetch("/meetup.json")
      .then((res) => res.json())
      .then((data) => {
        data.sort((a: { id: number }, b: { id: number }) => b.id - a.id)
        setMeetups(data)
      })
      .catch(() => setMeetups([]))
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

  const upcomingMeetups = meetups.filter(
    (m) => m.status === "upcoming" || m.status === "ongoing"
  )
  const previousMeetups = meetups.filter((m) => m.status === "previous")

  const MeetupCard = ({ meetup }: { meetup: any }) => (
    <motion.div
      className="meetup-card glass-card-event w-full bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden"
      variants={staggerItem}
      whileHover={{ y: -3, transition: spring.snappy }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="aspect-[3/4] bg-slate-800 relative">
        <Image
          src={meetup.image}
          alt={meetup.title}
          width={300}
          height={400}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-semibold mb-3 text-white tracking-tight">
          {meetup.title}
        </h3>
        {meetup.description && (
          <p className="text-slate-300 mb-3 text-sm leading-relaxed">{meetup.description}</p>
        )}
        <div className="space-y-1.5 text-xs text-sky-200/80">
          {meetup.dates && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{meetup.dates}</span>
            </div>
          )}
          {meetup.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{meetup.location}</span>
            </div>
          )}
          {meetup.collab && (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 shrink-0 opacity-80" />
              <span>{meetup.collab}</span>
            </div>
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
          <h1 className="page-hero-title">Photowalks</h1>
          <p className="page-hero-sub">
            Meet up, explore locations, and shoot together with the IRIS community.
          </p>
        </motion.header>

        <motion.section
          className="mb-14 md:mb-16"
          ref={upcomingRef}
          initial={{ opacity: 0, y: 12 }}
          animate={isUpcomingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <h2 className="section-title">Upcoming Photowalks</h2>
          {upcomingMeetups.length === 0 ? (
            <p className="text-slate-400 text-sm">No upcoming photowalks scheduled.</p>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate={isUpcomingInView ? "visible" : "hidden"}
            >
              {upcomingMeetups.map((meetup) => (
                <MeetupCard key={meetup.id} meetup={meetup} />
              ))}
            </motion.div>
          )}
        </motion.section>

        <motion.section
          ref={previousRef}
          initial={{ opacity: 0, y: 12 }}
          animate={isPreviousInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="section-title !mb-0 flex-1">Past Photowalks</h2>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                aria-label="Scroll past photowalks left"
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
                aria-label="Scroll past photowalks right"
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
            {previousMeetups.map((meetup) => (
              <div key={meetup.id} className="snap-start flex-shrink-0 w-[min(100%,18rem)] sm:w-72">
                <MeetupCard meetup={meetup} />
              </div>
            ))}
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  )
}
