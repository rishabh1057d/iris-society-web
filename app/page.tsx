"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ResponsiveContainer from "@/components/responsive-container"
import ResponsiveImage from "@/components/responsive-image"
import ErrorBoundary from "@/components/error-boundary"
import RedirectHandler from "@/components/redirect-handler"
import { motion, AnimatePresence, useAnimation, useInView, useScroll, useTransform } from "framer-motion"
function RainOverlay() {
  const drops = useMemo(() => {
    const count = 60
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100
      const delay = Math.random() * 1.8
      const duration = 1.6 + Math.random() * 1.4
      const scale = 0.6 + Math.random() * 0.8
      const opacity = 0.25 + Math.random() * 0.35
      return { id: i, left, delay, duration, scale, opacity }
    })
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {drops.map((d) => (
        <span
          key={d.id}
          className="rain-drop"
          style={{
            left: `${d.left}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            opacity: d.opacity,
            transform: `scale(${d.scale})`,
          }}
        />
      ))}
      <style jsx>{`
        .rain-drop {
          position: absolute;
          top: -12vh;
          width: 2px;
          height: 18vh;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.55));
          filter: blur(0.4px);
          border-radius: 9999px;
          animation-name: rainFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes rainFall {
          0% { transform: translate3d(0, -12vh, 0) scale(var(--scale, 1)); }
          100% { transform: translate3d(0, 112vh, 0) scale(var(--scale, 1)); }
        }
      `}</style>
    </div>
  )
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [potwData, setPotwData] = useState<Record<string, any[]>>({})
  const [currentPotw, setCurrentPotw] = useState<any | null>(null)
  const [applyModalOpen, setApplyModalOpen] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const potwRef = useRef<HTMLDivElement>(null)
  const isPotwInView = useInView(potwRef, { once: false, margin: "-100px 0px" })
  const controls = useAnimation()
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [showHiringModal, setShowHiringModal] = useState(false)
  const [recruiting, setRecruiting] = useState(false)
  const [showEventPopup, setShowEventPopup] = useState(false)
  const [popupData, setPopupData] = useState<{ enabled?: boolean; title?: string; description?: string; image?: string; registerUrl?: string; rulebookUrl?: string; registrationDeadline?: string } | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSczSzMGIAd-sE_nxe9wOFSrsYy59lzRBhU9e5uhOjMtmIquLQ/viewform"

  // Handle Join Now click
  const handleJoinNowClick = () => {
    setIsRedirecting(true)
  }

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mediaQuery.matches)

    const handleMediaChange = () => setIsReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleMediaChange)

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange)
    }
  }, [])

  // Scroll progress for animations
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"],
  })

  const mainRef = useRef<HTMLElement>(null)
  const { scrollYProgress: mainScrollProgress } = useScroll({
    target: mainRef,
    offset: ["start start", "end end"],
  })

  // Transform values for scroll-based animations - simplified for performance
  const logoScale = useTransform(scrollYProgress, [0, 0.1], [1, 0.8])
  const logoOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.6])
  const logoY = useTransform(scrollYProgress, [0, 0.1], [0, -20])
  const titleY = useTransform(scrollYProgress, [0, 0.1], [0, -10])
  const subtitleY = useTransform(scrollYProgress, [0, 0.1], [0, -5])

  // Highly optimized scroll handler with requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (heroRef.current) {
      setScrollY(window.scrollY)
    }
  }, [])

  // Update scroll position with debounce for performance
  useEffect(() => {
    let rafId: number | null = null
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [handleScroll])

  // Animate elements when they come into view
  useEffect(() => {
    if (isPotwInView) {
      controls.start("visible")
    } else {
      controls.start("hidden")
    }
  }, [isPotwInView, controls])

  // Logo animation variants - optimized for performance
  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
      },
    },
    hover: isReducedMotion
      ? {}
      : {
          scale: 1.05,
          filter: [
            "drop-shadow(0 0 0px rgba(59, 130, 246, 0))",
            "drop-shadow(0 0 15px rgba(59, 130, 246, 0.7))",
            "drop-shadow(0 0 0px rgba(59, 130, 246, 0))",
          ],
          transition: {
            duration: 0.8,
            filter: {
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
            },
          },
        },
  }

  // Text animation variants - simplified
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  }

  // Button animation variants - simplified
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.3,
      },
    },
    hover: isReducedMotion
      ? {}
      : {
          scale: 1.05,
          transition: {
            duration: 0.2,
          },
        },
  }

  // POTW section animation variants - simplified
  const potwVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  }

  // Modal animation variants (match POTW modal style)
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  }

  // Fetch POTW data from JSON
  useEffect(() => {
    fetch("/potw.json")
      .then((res) => res.json())
      .then((data) => setPotwData(data))
      .catch((err) => {
        console.error("Failed to load POTW data:", err)
        setPotwData({})
      })
  }, [])

  // Determine current month and week, and select the photo
  useEffect(() => {
    if (!potwData || Object.keys(potwData).length === 0) return

    const now = new Date()
    const monthName = now.toLocaleString("default", { month: "long" })
    // Calculate week of month (1-based)
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
    const weekOfMonth = Math.ceil((now.getDate() + firstDay) / 7)

    let photo = null

    // Helper to check if a photo is TBA (by theme or photographer or image)
    const isTBA = (p: any) =>
      (typeof p.theme === "string" && p.theme.trim().toUpperCase() === "TBA") ||
      (typeof p.photographer === "string" && p.photographer.trim().toUpperCase() === "TBA") ||
      (typeof p.image === "string" && p.image.trim().toUpperCase() === "TBA")

    // 1. Try to find the current week's photo (and skip TBA)
    if (potwData[monthName]) {
      photo = potwData[monthName].find((p: any) => p.week === weekOfMonth && !isTBA(p))
      // 2. If not found, fallback to the latest non-TBA photo in the month
      if (!photo) {
        for (let i = potwData[monthName].length - 1; i >= 0; i--) {
          if (!isTBA(potwData[monthName][i])) {
            photo = potwData[monthName][i]
            break
          }
        }
      }
    }
    // 3. If still not found, fallback to the latest non-TBA photo in any month
    if (!photo) {
      const months = Object.keys(potwData)
      for (let i = months.length - 1; i >= 0; i--) {
        const arr = potwData[months[i]]
        for (let j = arr.length - 1; j >= 0; j--) {
          if (!isTBA(arr[j])) {
            photo = arr[j]
            break
          }
        }
        if (photo) break
      }
    }
    setCurrentPotw(photo)
  }, [potwData])

  // Fetch recruiting status and popup config from current_members.json
  useEffect(() => {
    fetch("/current_members.json")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.recruiting === "boolean") {
          setRecruiting(data.recruiting)
          setShowHiringModal(data.recruiting)
        }
        if (data && data.popup) {
          setPopupData(data.popup)
          if (data.popup.enabled) {
            setShowEventPopup(true)
            // Preload the popup image for faster loading
            if (data.popup.image) {
              const link = document.createElement('link')
              link.rel = 'preload'
              link.as = 'image'
              link.href = data.popup.image
              document.head.appendChild(link)
            }
          }
        }
      })
      .catch(() => {
        setRecruiting(false)
        setShowHiringModal(false)
      })
  }, [])

  return (
    <ErrorBoundary>
      {/* Event Announcement Popup (glass-morphism, like POTW modal) */}
      <motion.div>
        <AnimatePresence>
          {showEventPopup && popupData?.enabled && (
            <motion.div
              className="fixed inset-0 bg-black/80 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-16 sm:pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEventPopup(false)}
            >
              <RainOverlay />
              <motion.div
                className="relative z-[55] rounded-2xl overflow-hidden w-full max-w-[1100px] h-[90vh] md:h-[80vh] max-h-[90vh] md:max-h-[85vh] flex flex-col md:flex-row backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Background matching main website mesh gradient */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-purple-900/30 via-blue-900/25 to-indigo-900/30" />
                {/* Additional gradient overlay matching website style */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-blue-900/20 via-transparent to-purple-900/15" />
                {/* Subtle floating orbs effect like main website */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30 blur-sm top-1/4 left-1/4 animate-pulse" />
                  <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-purple-400/20 to-blue-400/20 blur-sm top-3/4 right-1/4 animate-pulse" style={{ animationDelay: '1s' }} />
                </div>
                <motion.button
                  onClick={() => setShowEventPopup(false)}
                  className="absolute top-3 sm:top-2 right-3 sm:right-2 p-1 rounded-full hover:bg-white/10 transition-colors z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/></svg>
                </motion.button>

                <div className="flex flex-col md:flex-row overflow-hidden w-full">
                  {/* Image section */}
                  <div className="md:w-1/2 p-3 md:p-4 md:px-6 flex items-center justify-center">
                    <div className="relative w-full max-w-[320px] md:max-w-[460px] h-[30vh] md:h-full rounded-xl overflow-hidden">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.45 }}
                        className="relative w-full h-full"
                      >
                        <Image
                          src={popupData?.image || "/placeholder.svg"}
                          alt={popupData?.title || "Event"}
                          fill
                          className={`object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                          priority
                          quality={90}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                          onLoad={() => setImageLoaded(true)}
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Details section */}
                  <div className="md:w-1/2 p-3 md:p-6 overflow-y-auto">
                    <div className="rounded-xl bg-black/50 backdrop-blur-md border border-blue-400/20 p-3 md:p-5 ring-1 ring-blue-400/20 shadow-[0_10px_40px_rgba(59,130,246,0.1)]">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-1 md:mb-2">
                        <h3 className="font-extrabold text-white text-lg md:text-2xl leading-tight md:leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                          {popupData?.title || "Special Event"}
                        </h3>
                      </motion.div>
                      <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 0.6, delay: 0.15 }} className="h-[1px] md:h-[2px] bg-gradient-to-r from-blue-400/60 via-purple-400/40 to-blue-500/60 rounded-full mb-2 md:mb-3" />
                      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-gray-100/95 text-sm md:text-base mb-3 md:mb-4 leading-relaxed">
                        {popupData?.description || "Join us for an exciting upcoming event. Stay tuned for more details!"}
                      </motion.p>
                      
                      {/* Registration Deadline Section */}
                      {popupData?.registrationDeadline && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          transition={{ duration: 0.5, delay: 0.25 }}
                          className="mb-3 md:mb-4 p-2 md:p-3 rounded-lg bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30"
                        >
                          <div className="flex items-center gap-1 md:gap-2 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-4 md:h-4 text-red-400">
                              <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75ZM6 6h-.75a1.5 1.5 0 0 0-1.5 1.5v11.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V7.5a1.5 1.5 0 0 0-1.5-1.5H18v1.5a.75.75 0 0 1-1.5 0V6h-9v1.5a.75.75 0 0 1-1.5 0V6Z" clipRule="evenodd"/>
                            </svg>
                            <span className="text-red-300 font-semibold text-xs md:text-sm">Registration Deadline</span>
                          </div>
                          <p className="text-red-200 text-xs md:text-sm font-medium">
                            <span className="md:hidden">
                              {new Date(popupData.registrationDeadline).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span className="hidden md:inline">
                              {new Date(popupData.registrationDeadline).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </p>
                        </motion.div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                        {popupData?.registerUrl && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="relative"
                          >
                            <motion.div
                              initial={{ boxShadow: '0 0 0 rgba(16,185,129,0)' }}
                              animate={{ boxShadow: ['0 0 0 rgba(16,185,129,0)', '0 0 30px rgba(16,185,129,0.35)', '0 0 0 rgba(16,185,129,0)'] }}
                              transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.2 }}
                              className="rounded-md"
                            >
                              <Link href={popupData.registerUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block w-full sm:w-auto text-center py-2 md:py-1.5 px-4 md:px-5 text-sm font-semibold">
                                Register Now
                              </Link>
                            </motion.div>
                          </motion.div>
                        )}
                        {popupData?.rulebookUrl && (
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
                            <Link href={popupData.rulebookUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-block w-full sm:w-auto text-center py-2 md:py-1.5 px-3 md:px-4 text-sm">
                              View Rulebook
                            </Link>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* Hiring Popup Modal */}
      {recruiting && (
        <Dialog open={showHiringModal} onOpenChange={setShowHiringModal}>
          <DialogContent className="backdrop-blur-md max-w-[90vw] sm:max-w-lg p-8 rounded-xl shadow-2xl border-0 bg-neutral-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-center mb-2 text-white">We are Hiring</DialogTitle>
              <DialogDescription className="text-center text-base sm:text-lg mb-6 text-gray-300">
                We are looking for people to join our core team.<br />If you are interested, join now!
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (recruiting) {
                    window.open("https://forms.gle/XkNmxfYLzbR6E7Xt8", "_blank", "noopener,noreferrer")
                  } else {
                    setApplyModalOpen(true)
                  }
                }}
                className="btn-primary px-6 py-2 text-lg rounded shadow w-full sm:w-auto text-center"
              >
                Join the core team
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Apply Modal for when recruiting is false */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="bg-gradient-to-br from-blue-950/95 via-blue-900/90 to-gray-900/95 border border-blue-400/30 shadow-2xl rounded-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-blue-300 text-xl font-bold flex items-center gap-2">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#2563eb" fillOpacity="0.15"/><path d="M12 8v4" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#60a5fa"/></svg>
              Recruitment Closed
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 px-2 text-center text-blue-100 text-base font-medium">
            We aren't recruiting at the moment, but keep an eye out for announcements.
          </div>
        </DialogContent>
      </Dialog>
      {/* Redirect Handler */}
      <RedirectHandler
        isRedirecting={isRedirecting}
        targetUrl={GOOGLE_FORM_URL}
        onComplete={() => setIsRedirecting(false)}
      />

      <main ref={mainRef} className="flex min-h-screen flex-col items-center relative overflow-hidden">
        <Navbar onJoinClick={handleJoinNowClick} />

        {/* Hero section */}
        <div
          ref={heroRef}
          className="min-h-screen w-full flex flex-col items-center justify-center text-center safe-area-inset-top relative z-10"
        >
          <ResponsiveContainer size="lg" padding="lg">
            {/* Logo with optimized animations */}
            <motion.div
              ref={logoRef}
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              style={{ scale: logoScale, opacity: logoOpacity, y: logoY }}
              className="mb-8 cursor-pointer hardware-accelerated will-change-transform"
            >
              <ResponsiveImage
                src="/images/logo.png"
                alt="IRIS Society Logo"
                width={300}
                height={300}
                priority
                className="mx-auto filter drop-shadow-lg max-w-[220px] sm:max-w-[250px] md:max-w-[300px]"
              />
            </motion.div>

            <motion.h1
              variants={textVariants}
              initial="hidden"
              animate="visible"
              style={{ y: titleY, fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              className="text-responsive font-bold mb-4 text-white drop-shadow-lg will-change-transform"
            >
              IRIS Society
            </motion.h1>

            <motion.p
              variants={textVariants}
              initial="hidden"
              animate="visible"
              style={{ y: subtitleY, fontSize: "clamp(1rem, 3vw, 1.25rem)" }}
              transition={{ delay: 0.2 }}
              className="text-responsive text-gray-300 mb-2 max-w-lg mx-auto will-change-transform"
            >
              Photography & Videography Society of IITM BS Degree
            </motion.p>

            <motion.p
              variants={textVariants}
              initial="hidden"
              animate="visible"
              style={{ y: subtitleY, fontSize: "clamp(0.875rem, 2.5vw, 1.125rem)" }}
              transition={{ delay: 0.3 }}
              className="text-responsive text-gray-400 mb-10 max-w-lg mx-auto will-change-transform italic"
            >
              Through Our Lenses, Beyond the Ordinary
            </motion.p>

            {/* Enhanced CTA buttons with distinct styles */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div whileHover="hover" className="will-change-transform w-full sm:w-auto">
                <button onClick={handleJoinNowClick} className="btn-primary w-full sm:w-auto" disabled={isRedirecting}>
                  <span className="relative z-10">{isRedirecting ? "Redirecting..." : "Be a member"}</span>
                </button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="will-change-transform w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (recruiting) {
                      window.open("https://forms.gle/XkNmxfYLzbR6E7Xt8", "_blank", "noopener,noreferrer")
                    } else {
                      setApplyModalOpen(true)
                    }
                  }}
                  className="btn-secondary w-full sm:w-auto border-2 border-blue-400 text-blue-400 bg-transparent hover:bg-blue-50 transition-colors duration-200 font-semibold py-2 px-6 rounded shadow"
                >
                  Join The Core Team
                </button>
              </motion.div>
            </motion.div>
          </ResponsiveContainer>
        </div>

        {/* Improved transition element */}
        <div className="w-full relative">
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-transparent via-blue-900/20 to-blue-900/40 transform -translate-y-64"></div>
          <div className="w-full h-32 bg-gradient-to-b from-transparent to-blue-900/30"></div>
        </div>

        {/* Photo of the Week Section with seamless transition */}
        <motion.div
          ref={potwRef}
          variants={potwVariants}
          initial="hidden"
          animate={controls}
          className="w-full relative z-10 bg-gradient-to-b from-blue-900/30 to-transparent"
        >
          <ResponsiveContainer size="xl" padding="lg" className="py-20">
            <motion.h2
              className="text-responsive font-bold text-center mb-12"
              style={{ fontSize: "clamp(1.875rem, 4vw, 2.5rem)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={isPotwInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              Photo of the Week
            </motion.h2>

            {currentPotw ? (
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                <motion.div
                  className="w-full lg:w-1/2 hardware-accelerated"
                  initial={{ opacity: 0, x: -50 }}
                  animate={isPotwInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="glass-card">
                    <ResponsiveImage
                      src={currentPotw.image || "/placeholder.svg"}
                      alt={`Photo of the Week - ${currentPotw.theme || ""} by ${currentPotw.photographer || ""}`}
                      width={600}
                      height={400}
                      className="rounded-lg w-full shadow-lg"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="w-full lg:w-1/2 space-y-4 hardware-accelerated"
                  initial={{ opacity: 0, x: 50 }}
                  animate={isPotwInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <div className="glass-card p-6">
                    <h3 className="text-responsive font-bold" style={{ fontSize: "clamp(1.25rem, 3vw, 1.5rem)" }}>
                      {currentPotw.photographer}
                    </h3>
                    <p className="text-gray-400 text-responsive break-all sm:break-normal">
                      {currentPotw.theme ? `Theme: "${currentPotw.theme}"` : ""}
                    </p>
                    <p className="text-gray-300 text-responsive">{currentPotw.description}</p>
                    <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }} className="mt-4">
                      <Link href="/potw" className="btn-primary inline-block w-full sm:w-auto text-center">
                        View All Weekly Photos
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">No Photo of the Week available.</div>
            )}
          </ResponsiveContainer>
        </motion.div>

        <Footer />
      </main>
    </ErrorBoundary>
  )
}
