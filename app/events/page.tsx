"use client"

import { useRef, useState } from "react"
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

  const isTitleInView = useInView(titleRef, { once: true })
  const isOngoingInView = useInView(ongoingRef, { once: true })
  const isPreviousInView = useInView(previousRef, { once: true })

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

        <motion.section
          className="mb-12"
          ref={ongoingRef}
          variants={sectionVariants}
          initial="hidden"
          animate={isOngoingInView ? "visible" : "hidden"}
          style={{ y: y1 }}
        >
          <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-blue-400/30 text-white">Ongoing Events</h2>
          <p className="text-blue-200">No events are going on right now.</p>
        </motion.section>

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
            {/* Shutter Safari 2.0 – Paradox'25 Special (Most Recent) */}
            <motion.div
              className="event-card glass-card-event flex-shrink-0 w-80 backdrop-blur-md bg-white/5 border border-blue-400/20"
              variants={cardVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <div className="aspect-[3/4] bg-gray-700 relative">
                <Image
                  src="/images/Shutter Safari sponsorerd.png"
                  alt="Shutter Safari 2.0 – Paradox'25 Special"
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Shutter Safari 2.0 – Paradox'25 Special</h3>
                <p className="text-blue-200 mb-3 text-sm">Campus-themed multi-round offline photo contest</p>
                <div className="space-y-1 text-xs text-blue-300 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>4–7 June 2025</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span>Offline, IIT Madras</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2" />
                    <span>IRIS x Kanha House</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="text-xs px-3 py-1 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/20">
                    Registration Closed
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Through Stillness – Mental Health Week Special */}
            <motion.div
              className="event-card glass-card-event flex-shrink-0 w-80 backdrop-blur-md bg-white/5 border border-blue-400/20"
              variants={cardVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <div className="aspect-[3/4] bg-gray-700 relative">
                <Image
                  src="/images/raahat_poster.png"
                  alt="Through Stillness – Mental Health Week Special"
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-white">
                  Through Stillness – Mental Health Week Special
                </h3>
                <p className="text-blue-200 mb-3 text-sm">Mental health storytelling through reflective photography.</p>
                <div className="space-y-1 text-xs text-blue-300 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>14–20 May 2025</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span>Online</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2" />
                    <span>IRIS x Raahat x Kanha House</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="text-xs px-3 py-1 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/20">
                    Registration Closed
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Lumen Astrum – Astrophotography Competition */}
            <motion.div
              className="event-card glass-card-event flex-shrink-0 w-80 backdrop-blur-md bg-white/5 border border-blue-400/20"
              variants={cardVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <div className="aspect-[3/4] bg-gray-700 relative">
                <Image
                  src="/images/lumen_astrum.png"
                  alt="Lumen Astrum – Astrophotography Competition"
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Lumen Astrum – Astrophotography Competition</h3>
                <p className="text-blue-200 mb-3 text-sm">Space-themed photo contest with expert judging and talk.</p>
                <div className="space-y-1 text-xs text-blue-300 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>19–29 Apr (Submissions), 1 May (Judging)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span>Online</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2" />
                    <span>IRIS x AVASYA</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="text-xs px-3 py-1 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/20">
                    Registration Closed
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Festive Frames – Holi Edition */}
            <motion.div
              className="event-card glass-card-event flex-shrink-0 w-80 backdrop-blur-md bg-white/5 border border-blue-400/20"
              variants={cardVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <div className="aspect-[3/4] bg-gray-700 relative">
                <Image
                  src="/images/festive frames.png"
                  alt="Festive Frames – Holi Edition"
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Festive Frames – Holi Edition</h3>
                <p className="text-blue-200 mb-3 text-sm">Holi-themed photography challenge with live feedback.</p>
                <div className="space-y-1 text-xs text-blue-300 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>10–19 Mar 2025</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span>Online</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2" />
                    <span>IRIS x Kanha House</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="text-xs px-3 py-1 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/20">
                    Registration Closed
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Unstoppable Her – She Frames */}
            <motion.div
              className="event-card glass-card-event flex-shrink-0 w-80 backdrop-blur-md bg-white/5 border border-blue-400/20"
              variants={cardVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <div className="aspect-[3/4] bg-gray-700 relative">
                <Image
                  src="/images/she_frames.png"
                  alt="Unstoppable Her – She Frames"
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Unstoppable Her – She Frames</h3>
                <p className="text-blue-200 mb-3 text-sm">Women's Day contest on powerful female narratives.</p>
                <div className="space-y-1 text-xs text-blue-300 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>4–8 Mar 2025</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span>Online</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2" />
                    <span>IRIS x Kanha House</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="text-xs px-3 py-1 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/20">
                    Registration Closed
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Frame Quest */}
            <motion.div
              className="event-card glass-card-event flex-shrink-0 w-80 backdrop-blur-md bg-white/5 border border-blue-400/20"
              variants={cardVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <div className="aspect-[3/4] bg-gray-700 relative">
                <Image
                  src="/images/frame quest.png"
                  alt="Frame Quest"
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Frame Quest</h3>
                <p className="text-blue-200 mb-3 text-sm">Portrait challenge with 3 stages + workshop + judgment.</p>
                <div className="space-y-1 text-xs text-blue-300 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>10–16 Feb 2025</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span>Online</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2" />
                    <span>IRIS x Sundarbans House</span>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <span className="text-xs px-3 py-1 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/20">
                    Registration Closed
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="event-card glass-card-event flex-shrink-0 w-80 backdrop-blur-md bg-white/5 border border-blue-400/20"
              variants={cardVariants}
              whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            >
              <div className="aspect-[3/4] bg-gray-700 relative">
                <Image
                  src="/images/ssve.png"
                  alt="Shutter Safari - Virtual Edition"
                  width={300}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Shutter Safari Virtual Edition - Margazhi</h3>
                <p className="text-blue-200 mb-3 text-sm">Uniqe themed multi-round Online photo contest</p>
                <div className="space-y-1 text-xs text-blue-300 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>4–7 Jan 2025</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-2" />
                    <span>Online</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2" />
                    <span>IRIS x Kanha House</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <span className="text-xs px-3 py-1 bg-gray-600/20 text-gray-400 rounded-md border border-gray-500/20">
                    Registration Closed
                  </span>
                </div>
              </div>
            </motion.div>
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
