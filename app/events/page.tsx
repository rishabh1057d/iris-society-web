"use client"

import { useEffect, useRef, useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"

export default function Events() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const ongoingRef = useRef<HTMLHeadingElement>(null)
  const previousRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [events, setEvents] = useState<any[]>([])

  const isTitleInView = useInView(titleRef, { once: true })
  const isOngoingInView = useInView(ongoingRef, { once: true })
  const isPreviousInView = useInView(previousRef, { once: true })

  useEffect(() => {
    fetch("/events.json")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch(() => setEvents([]))
  }, [])

  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  // Transform values for parallax effect
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const y2 = useTransform(scrollYProgress, [0, 1], [100, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6])

  // Animation variants
  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  // Horizontal scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 // Width of one card + gap
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320 // Width of one card + gap
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  // Check scroll position
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  // Split events into ongoing and previous
  const ongoingEvents = events.filter(e => e.status === "ongoing")
  const previousEvents = events.filter(e => e.status === "previous")

  return (
    <main className="flex min-h-screen flex-col items-center relative">
      <Navbar />
      <div ref={containerRef} className="pt-24 pb-12 px-6 w-full max-w-7xl mx-auto relative z-10">
        <motion.h1
          ref={titleRef}
          className="text-3xl md:text-4xl font-bold mb-8 text-center text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          style={{ opacity }}
        >
          Event Calendar
        </motion.h1>

        {/* Ongoing Events */}
        <motion.section
          className="mb-12"
          ref={ongoingRef}
          variants={sectionVariants}
          initial="hidden"
          animate={isOngoingInView ? "visible" : "hidden"}
          style={{ y: y1 }}
        >
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-blue-400/30 text-white">Ongoing Events</h2>
          {ongoingEvents.length === 0 ? (
            <p className="text-blue-200">No events are going on right now.</p>
          ) : (
            <div className="flex flex-wrap gap-6">
              {ongoingEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  className="event-card glass-card-event flex-shrink-0 w-80 backdrop-blur-md bg-white/5 border border-blue-400/20"
                  variants={cardVariants}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <div className="aspect-[3/4] bg-gray-700 relative">
                    <Image
                      src={event.image}
                      alt={event.title}
                      width={300}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-white">{event.title}</h3>
                    <p className="text-blue-200 mb-3 text-sm">{event.description}</p>
                    <div className="space-y-1 text-xs text-blue-300 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-2" />
                        <span>{event.dates}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-2" />
                        <span>{event.collab}</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      {event.registrationOpen ? (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1 bg-blue-600/20 text-blue-200 rounded-md border border-blue-400/20 hover:bg-blue-600/30 transition"
                        >
                          Register Now
                        </a>
                      ) : (
                        <span className="text-xs px-3 py-1 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/20">
                          Registration Closed
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Previous Events */}
        <motion.section
          ref={previousRef}
          variants={sectionVariants}
          initial="hidden"
          animate={isPreviousInView ? "visible" : "hidden"}
          style={{ y: y2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold pb-2 border-b border-blue-400/30 text-white">Previous Events</h2>
            <div className="flex space-x-2">
              <button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                  canScrollLeft
                    ? "bg-blue-600/20 border-blue-400/30 text-blue-200 hover:bg-blue-600/30"
                    : "bg-gray-600/10 border-gray-500/20 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                  canScrollRight
                    ? "bg-blue-600/20 border-blue-400/30 text-blue-200 hover:bg-blue-600/30"
                    : "bg-gray-600/10 border-gray-500/20 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <motion.div
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onScroll={handleScroll}
            variants={cardContainerVariants}
            initial="hidden"
            animate={isPreviousInView ? "visible" : "hidden"}
          >
            {previousEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                className="event-card glass-card-event flex-shrink-0 w-80 backdrop-blur-md bg-white/5 border border-blue-400/20"
                variants={cardVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <div className="aspect-[3/4] bg-gray-700 relative">
                  <Image
                    src={event.image}
                    alt={event.title}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 text-white">{event.title}</h3>
                  <p className="text-blue-200 mb-3 text-sm">{event.description}</p>
                  <div className="space-y-1 text-xs text-blue-300 mb-3">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-2" />
                      <span>{event.dates}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-2" />
                      <span>{event.collab}</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    {event.status === "previous" ? (
                      <div className="flex items-center justify-center gap-2">
                        {event.resultLink && event.resultLink.trim() !== "" && (
                          <a
                            href={event.resultLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1 bg-blue-600/20 text-blue-200 rounded-md border border-blue-400/20 hover:bg-blue-600/30 transition"
                          >
                            View Results
                          </a>
                        )}
                        {event.liveSessionLink && event.liveSessionLink.trim() !== "" && (
                          <a
                            href={event.liveSessionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1 bg-green-600/20 text-green-200 rounded-md border border-green-400/20 hover:bg-green-600/30 transition"
                          >
                            View Live Session
                          </a>
                        )}
                      </div>
                    ) : (
                      <>
                        {event.registrationOpen ? (
                          <a
                            href={event.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1 bg-blue-600/20 text-blue-200 rounded-md border border-blue-400/20 hover:bg-blue-600/30 transition"
                          >
                            Register Now
                          </a>
                        ) : (
                          <span className="text-xs px-3 py-1 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/20">
                            Registration Closed
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>
      <Footer />

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  )
}
