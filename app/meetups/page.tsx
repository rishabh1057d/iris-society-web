"use client"

import { useEffect, useRef, useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import { Calendar, MapPin, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"

export default function Meetups() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const upcomingRef = useRef<HTMLHeadingElement>(null)
  const previousRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [meetups, setMeetups] = useState<any[]>([])

  const isTitleInView = useInView(titleRef, { once: true })
  const isUpcomingInView = useInView(upcomingRef, { once: true })
  const isPreviousInView = useInView(previousRef, { once: true })

  useEffect(() => {
    fetch("/meetup.json")
      .then((res) => res.json())
      .then((data) => {
        // Sort by id descending
        data.sort((a: { id: number }, b: { id: number }) => b.id - a.id)
        setMeetups(data)
      })
      .catch(() => setMeetups([]))
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

  // Split meetups into upcoming and previous
  const upcomingMeetups = meetups.filter(m => m.status === "upcoming")
  const previousMeetups = meetups.filter(m => m.status === "previous")

  return (
    <main className="flex min-h-screen flex-col items-center relative">
      <Navbar />
      <div ref={containerRef} className="pt-28 md:pt-32 pb-16 md:pb-20 px-4 sm:px-6 w-full max-w-7xl mx-auto relative z-10">
        <motion.h1
          ref={titleRef}
          className="text-3xl md:text-5xl font-extrabold tracking-tight mb-10 md:mb-12 text-center text-white inline-block"
          initial={{ opacity: 0, y: -20 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          style={{ opacity }}
        >
          Meetups & Photowalks
        </motion.h1>

        {/* Upcoming Meetups */}
        <motion.section
          className="mb-16 md:mb-20"
          ref={upcomingRef}
          variants={sectionVariants}
          initial="hidden"
          animate={isUpcomingInView ? "visible" : "hidden"}
          style={{ y: y1 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 pb-2 border-b border-blue-400/30 text-white">Upcoming Meetups</h2>
          {upcomingMeetups.length === 0 ? (
            <p className="text-blue-200">No upcoming meetups scheduled.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {upcomingMeetups.map((meetup, idx) => (
                <motion.div
                  key={meetup.id}
                  className="meetup-card glass-card-event w-full backdrop-blur-md bg-white/5 border border-blue-400/20 rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(96,165,250,0.08)] hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.35)] transition-shadow"
                  variants={cardVariants}
                  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                >
                  <div className="aspect-[3/4] bg-gray-700 relative">
                    <Image
                      src={meetup.image}
                      alt={meetup.title}
                      width={300}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="text-lg md:text-xl font-semibold mb-3 text-white tracking-tight">{meetup.title}</h3>
                    <div className="space-y-1.5 text-xs md:text-sm text-blue-300 mb-5">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-2" />
                        <span>{meetup.dates}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-2" />
                        <span>{meetup.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-2" />
                        <span>{meetup.collab}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                      {meetup.registrationOpen ? (
                        <a
                          href={meetup.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs md:text-sm px-3 py-2 bg-blue-600/20 text-blue-200 rounded-md border border-blue-400/20 hover:bg-blue-600/30 transition w-full sm:w-auto text-center"
                        >
                          Register Now
                        </a>
                      ) : (
                        <span className="text-xs md:text-sm px-3 py-2 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/20 text-center w-full sm:w-auto">
                          Registration Closed
                        </span>
                      )}
                      {meetup.locationLink && meetup.locationLink.trim() !== "" && (
                        <a
                          href={meetup.locationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs md:text-sm px-3 py-2 bg-green-600/20 text-green-200 rounded-md border border-green-400/20 hover:bg-green-600/30 transition w-full sm:w-auto text-center"
                        >
                          Location
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Previous Meetups */}
        <motion.section
          ref={previousRef}
          variants={sectionVariants}
          initial="hidden"
          animate={isPreviousInView ? "visible" : "hidden"}
          style={{ y: y2 }}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold pb-2 border-b border-blue-400/30 text-white">Previous Meetups</h2>
            <div className="hidden sm:flex space-x-2">
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
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-2 md:pb-4 snap-x snap-mandatory scroll-pl-4 sm:scroll-pl-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onScroll={handleScroll}
            variants={cardContainerVariants}
            initial="hidden"
            animate={isPreviousInView ? "visible" : "hidden"}
          >
            {previousMeetups.map((meetup, idx) => (
              <motion.div
                key={meetup.id}
                className="meetup-card glass-card-event flex-shrink-0 w-72 sm:w-80 snap-start backdrop-blur-md bg-white/5 border border-blue-400/20 rounded-xl overflow-hidden shadow-[0_0_0_1px_rgba(96,165,250,0.08)] hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.35)] transition-shadow"
                variants={cardVariants}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <div className="aspect-[3/4] bg-gray-700 relative">
                  <Image
                    src={meetup.image}
                    alt={meetup.title}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-3 text-white tracking-tight">{meetup.title}</h3>
                  <div className="space-y-1.5 text-xs md:text-sm text-blue-300 mb-5">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-2" />
                      <span>{meetup.dates}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-2" />
                      <span>{meetup.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-2" />
                      <span>{meetup.collab}</span>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    {meetup.status === "previous" ? (
                      <div className="flex items-center justify-center gap-2">
                        {meetup.locationLink && meetup.locationLink.trim() !== "" && (
                          <a
                            href={meetup.locationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs md:text-sm px-3 py-2 bg-green-600/20 text-green-200 rounded-md border border-green-400/20 hover:bg-green-600/30 transition"
                          >
                            Location
                          </a>
                        )}
                      </div>
                    ) : (
                      <>
                        {meetup.registrationOpen ? (
                          <a
                            href={meetup.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs md:text-sm px-3 py-2 bg-blue-600/20 text-blue-200 rounded-md border border-blue-400/20 hover:bg-blue-600/30 transition"
                          >
                            Register Now
                          </a>
                        ) : (
                          <span className="text-xs md:text-sm px-3 py-2 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/20">
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
