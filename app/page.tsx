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
  const palette = [
    '#fff2b2', // bright gold
    '#ffd166', // gold
    '#ff9f1c', // deep orange
    '#ff3b3b', // bright red
    '#ff7ae6', // pink
    '#93c5fd', // blue
    '#22d3ee', // cyan
    '#86efac', // green
    '#f0abfc', // purple
    '#ffffff', // white core
  ]

  const bursts = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
    const count = isMobile ? 14 : 28
    return Array.from({ length: count }).map((_, i) => {
      const left = 8 + Math.random() * 84
      const top = 18 + Math.random() * 52
      const delay = Math.random() * 2.2
      const size = (isMobile ? 60 : 90) + Math.random() * (isMobile ? 80 : 120)
      const color = palette[Math.floor(Math.random() * palette.length)]
      const sparks = (isMobile ? 10 : 14) + Math.floor(Math.random() * (isMobile ? 4 : 6))
      const duration = (isMobile ? 1.0 : 1.2) + Math.random() * (isMobile ? 0.6 : 0.8)
      return { id: i, left, top, delay, size, color, sparks, duration }
    })
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">

      {bursts.map((b) => (
        <div
          key={b.id}
          className="firework"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            animationDelay: `${b.delay}s`,
            // CSS vars for children
            // @ts-ignore
            '--size': `${b.size}px`,
            '--clr': b.color,
            '--dur': `${b.duration}s`,
          } as React.CSSProperties}
        >
          {Array.from({ length: b.sparks }).map((_, i) => (
            <span
              key={i}
              className="spark"
              style={{ ['--i' as any]: i, ['--angle' as any]: `${(360 / b.sparks) * i}deg` } as React.CSSProperties}
            />
          ))}
          <span className="core" />
        </div>
      ))}

      <style jsx>{`
        .firework {
          position: absolute;
          width: 2px;
          height: 2px;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 0 10px var(--clr)) drop-shadow(0 0 18px var(--clr));
        }

        .core {
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          background: radial-gradient(circle, var(--clr), rgba(255,255,255,0.4) 30%, transparent 65%);
          animation: corePulse var(--dur) ease-out infinite;
          opacity: 0.95;
        }

        .spark {
          position: absolute;
          left: 0;
          top: 0;
          width: 3px;
          height: 10px;
          transform-origin: center calc(var(--size) * 0.1);
          background: linear-gradient(to bottom, #ffffff, var(--clr), transparent 80%);
          border-radius: 9999px;
          box-shadow: 0 0 10px var(--clr), 0 0 18px var(--clr);
          transform: rotate(var(--angle)) translateY(0);
          animation: explode var(--dur) ease-out infinite;
        }

        @keyframes corePulse {
          0% { opacity: 0; transform: scale(0.2); }
          12% { opacity: 1; transform: scale(1.05); }
          60% { opacity: 0.5; transform: scale(0.9); }
          100% { opacity: 0; transform: scale(0.2); }
        }

        @keyframes explode {
          0% {
            transform: rotate(var(--angle)) translateY(0) scale(0.6);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          60% {
            transform: rotate(var(--angle)) translateY(calc(var(--size) * -0.85)) scale(1.05);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angle)) translateY(calc(var(--size) * -1)) scale(0.95);
            opacity: 0;
          }
        }

        /* Mobile: tone down intensity for readability */
        @media (max-width: 640px) {
          .firework {
            filter: drop-shadow(0 0 6px var(--clr)) drop-shadow(0 0 10px var(--clr));
          }
          .core {
            opacity: 0.6;
          }
          .spark {
            height: 8px;
            box-shadow: 0 0 6px var(--clr), 0 0 10px var(--clr);
            background: linear-gradient(to bottom, rgba(255,255,255,0.7), var(--clr), transparent 80%);
          }
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
  const [showFireworks, setShowFireworks] = useState(false)
  const [popupData, setPopupData] = useState<{ enabled?: boolean; title?: string; description?: string; image?: string; registerUrl?: string; rulebookUrl?: string; registrationDeadline?: string } | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [videoMuted, setVideoMuted] = useState(true)
  const [videoData, setVideoData] = useState<{ enabled?: boolean; src?: string; title?: string; description?: string; instagramUrl?: string } | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoSectionRef = useRef<HTMLDivElement>(null)

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
          // Fireworks trigger specifically under popup
          try {
            setShowFireworks(Boolean(data.popup.fireworks))
          } catch {
            setShowFireworks(false)
          }
        } else {
          setShowFireworks(false)
        }
        if (data && data.video_home) {
          setVideoData(data.video_home)
        }
      })
      .catch(() => {
        setRecruiting(false)
        setShowHiringModal(false)
      })
  }, [])

  // Auto-scroll to video when popup closes
  useEffect(() => {
    if (!showEventPopup && popupData?.enabled && videoData?.enabled && videoSectionRef.current) {
      // Small delay to ensure popup animation completes
      setTimeout(() => {
        videoSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        })
        
        // Start playing video after scroll
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(console.error)
          }
        }, 1000)
      }, 500)
    }
  }, [showEventPopup, popupData?.enabled, videoData?.enabled])

  // Close event popup on ESC
  useEffect(() => {
    if (!showEventPopup) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEventPopup(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showEventPopup])

  // Auto-scroll and autoplay when popup is disabled but video section is enabled
  useEffect(() => {
    if (videoData?.enabled && !popupData?.enabled && videoSectionRef.current) {
      // Give the page a moment to settle, then scroll and attempt autoplay
      const scrollTimeout = setTimeout(() => {
        videoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

        const playTimeout = setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {
              // Ignore autoplay rejection silently
            })
          }
        }, 800)

        return () => clearTimeout(playTimeout)
      }, 500)

      return () => clearTimeout(scrollTimeout)
    }
  }, [videoData?.enabled, popupData?.enabled])

  // Best-effort autoplay once video can play (muted autoplay is allowed by most browsers)
  useEffect(() => {
    if (!videoData?.enabled) return
    const video = videoRef.current
    if (!video) return

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay may still be blocked in some environments; no-op
      })
    }

    if (video.readyState >= 2) {
      tryPlay()
      return
    }

    video.addEventListener('canplay', tryPlay, { once: true })
    return () => {
      video.removeEventListener('canplay', tryPlay)
    }
  }, [videoData?.enabled])

  // Sync video muted property with state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = videoMuted;
    }
  }, [videoMuted])

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
              {showFireworks && <RainOverlay />}
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

        {/* Enhanced Hero section with improved visual hierarchy */}
        <div
          ref={heroRef}
          className="min-h-screen w-full flex flex-col items-center justify-center text-center safe-area-inset-top relative z-10"
        >
          {/* Enhanced background overlay with gradient mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-indigo-900/25 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          
          {/* Floating orbs for depth */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl top-1/4 left-1/4 animate-pulse" />
            <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/8 to-pink-500/8 blur-3xl top-3/4 right-1/4 animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-indigo-500/6 to-blue-500/6 blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '4s' }} />
          </div>

          <ResponsiveContainer size="lg" padding="lg">
            {/* Enhanced Logo with better visual impact */}
            <motion.div
              ref={logoRef}
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              style={{ scale: logoScale, opacity: logoOpacity, y: logoY }}
              className="mb-12 cursor-pointer hardware-accelerated will-change-transform relative"
            >
              {/* Logo glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl scale-110 opacity-60" />
              <div className="relative">
                <ResponsiveImage
                  src="/images/logo.png"
                  alt="IRIS Society Logo"
                  width={300}
                  height={300}
                  priority
                  className="mx-auto filter drop-shadow-2xl max-w-[220px] sm:max-w-[250px] md:max-w-[300px] relative z-10"
                />
                {/* Subtle border glow */}
                <div className="absolute inset-0 rounded-full border-2 border-white/10 scale-105" />
              </div>
            </motion.div>

            {/* Enhanced title with gradient text */}
            <motion.h1
              variants={textVariants}
              initial="hidden"
              animate="visible"
              style={{ y: titleY, fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
              className="font-extrabold mb-6 text-white drop-shadow-2xl will-change-transform relative"
            >
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                IRIS Society
              </span>
              {/* Decorative underline */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
            </motion.h1>

            {/* Enhanced subtitle with better typography */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="mb-6 max-w-2xl mx-auto will-change-transform"
            >
              <p 
                style={{ fontSize: "clamp(1.125rem, 3.5vw, 1.5rem)" }}
                className="text-gray-200 font-medium leading-relaxed"
              >
                Photography & Videography Society of IITM BS Degree
              </p>
            </motion.div>

            {/* Enhanced tagline with better styling */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="mb-16 max-w-xl mx-auto will-change-transform"
            >
              <p 
                style={{ fontSize: "clamp(1rem, 2.5vw, 1.25rem)" }}
                className="text-gray-300 italic font-light leading-relaxed relative"
              >
                <span className="absolute -left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-2xl">"</span>
                Through Our Lenses, Beyond the Ordinary
                <span className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-2xl">"</span>
              </p>
            </motion.div>

            {/* Enhanced CTA buttons with modern design */}
            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-lg mx-auto"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                whileHover="hover" 
                className="will-change-transform w-full sm:w-auto relative group"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 scale-110" />
                <button 
                  onClick={handleJoinNowClick} 
                  className="relative btn-primary w-full sm:w-auto px-8 py-4 text-lg font-bold shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300" 
                  disabled={isRedirecting}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isRedirecting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Redirecting...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
                        </svg>
                        Be a Member
                      </>
                    )}
                  </span>
                </button>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                className="will-change-transform w-full sm:w-auto relative group"
              >
                <button
                  onClick={() => {
                    if (recruiting) {
                      window.open("https://forms.gle/XkNmxfYLzbR6E7Xt8", "_blank", "noopener,noreferrer")
                    } else {
                      setApplyModalOpen(true)
                    }
                  }}
                  className="relative w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-lg border-2 border-blue-400/60 text-blue-300 bg-transparent hover:bg-blue-400/10 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 backdrop-blur-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                    </svg>
                    Join Core Team
                  </span>
                </button>
              </motion.div>
            </motion.div>

          </ResponsiveContainer>
        </div>

        {/* Enhanced transition element with better visual flow */}
        <div className="w-full relative">
          {/* Multi-layer gradient transition */}
          <div className="absolute top-0 left-0 w-full h-40 md:h-80 bg-gradient-to-b from-transparent via-blue-900/25 to-blue-900/50 transform -translate-y-40 md:-translate-y-80"></div>
          <div className="absolute top-0 left-0 w-full h-32 md:h-64 bg-gradient-to-b from-transparent via-purple-900/15 to-purple-900/30 transform -translate-y-32 md:-translate-y-64"></div>
          <div className="w-full h-20 md:h-40 bg-gradient-to-b from-transparent to-blue-900/40"></div>
          
          {/* Decorative wave pattern */}
          <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20"></div>
        </div>

        {/* Enhanced Video Section with improved design */}
        {videoData?.enabled && (
          <motion.div
            ref={videoSectionRef}
            className="w-full relative z-10 bg-gradient-to-b from-blue-900/40 via-purple-900/20 to-blue-900/30"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-3xl top-1/4 left-1/4 animate-pulse" />
              <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-3xl bottom-1/4 right-1/4 animate-pulse" style={{ animationDelay: '3s' }} />
            </div>

            <ResponsiveContainer size="xl" padding="lg" className="py-12 md:py-24">
              {/* Enhanced section title */}
              <motion.div
                className="text-center mb-8 md:mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.h2
                  className="font-extrabold mb-4 relative"
                  style={{ fontSize: "clamp(1.75rem, 4.5vw, 3rem)" }}
                >
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    {videoData.title || "Watch Our Story"}
                  </span>
                  {/* Decorative underline */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                </motion.h2>
                
                <motion.p
                  className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Experience the passion and creativity of our photography community
                </motion.p>
              </motion.div>
              
              {/* Enhanced video container */}
              <motion.div
                className="relative max-w-5xl mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {/* Enhanced glass card with better styling */}
                <div className="relative glass-card p-2 md:p-6 overflow-hidden">
                  {/* Decorative border gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-xl blur-sm" />
                  <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-2 md:p-4">
                    {/* 16:9 Aspect Ratio Container */}
                    <div className="relative w-full rounded-lg overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
                      <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted={videoMuted}
                        loop
                        playsInline
                        preload="metadata"
                        poster="/placeholder.jpg"
                        onLoadedData={() => {
                          // Ensure video is muted initially
                          if (videoRef.current) {
                            videoRef.current.muted = videoMuted;
                          }
                        }}
                      >
                        <source src={videoData.src || "/videos/iris_reel_1.mp4"} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      
                      {/* Enhanced video controls overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <motion.button
                          onClick={() => {
                            const newMutedState = !videoMuted;
                            setVideoMuted(newMutedState);
                            if (videoRef.current) {
                              videoRef.current.muted = newMutedState;
                            }
                          }}
                          className="bg-white/20 backdrop-blur-md rounded-full p-4 hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {videoMuted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0 11.5 11.5 0 0 1 0 13.788.75.75 0 0 1-1.06-1.06 10 10 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z"/>
                              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6.5 6.5 0 0 1 0 8.486.75.75 0 0 1-1.06-1.06 5 5 0 0 0 0-6.366.75.75 0 0 1 0-1.06Z"/>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L19.5 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L19.5 10.94l-1.72-1.72Z"/>
                            </svg>
                          )}
                        </motion.button>
                      </div>
                      
                      {/* Enhanced mute indicator */}
                      {videoMuted && (
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full p-3 border border-white/20">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0 11.5 11.5 0 0 1 0 13.788.75.75 0 0 1-1.06-1.06 10 10 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z"/>
                            <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6.5 6.5 0 0 1 0 8.486.75.75 0 0 1-1.06-1.06 5 5 0 0 0 0-6.366.75.75 0 0 1 0-1.06Z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Enhanced description */}
                <motion.div
                  className="text-center mt-6 md:mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                    {videoData.description || "Click the speaker icon to unmute and experience the full audio"}
                  </p>
                </motion.div>
                
                {/* Enhanced Instagram Link Button */}
                {videoData.instagramUrl && (
                  <motion.div
                    className="flex justify-center mt-6 md:mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <motion.a
                      href={videoData.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-white/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      View on Instagram
                    </motion.a>
                  </motion.div>
                )}
              </motion.div>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Enhanced Photo of the Week Section */}
        <motion.div
          ref={potwRef}
          variants={potwVariants}
          initial="hidden"
          animate={controls}
          className="w-full relative z-10 bg-gradient-to-b from-blue-900/40 via-purple-900/20 to-transparent"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-blue-500/5 to-purple-500/5 blur-3xl top-1/4 right-1/4 animate-pulse" />
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-3xl bottom-1/4 left-1/4 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <ResponsiveContainer size="xl" padding="lg" className="py-12 md:py-24">
            {/* Enhanced section title */}
            <motion.div
              className="text-center mb-12 md:mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={isPotwInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2
                className="font-extrabold mb-4 relative"
                style={{ fontSize: "clamp(1.75rem, 4.5vw, 3rem)" }}
              >
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Photo of the Week
                </span>
                {/* Decorative underline */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
              </motion.h2>
              
              <motion.p
                className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={isPotwInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Celebrating exceptional photography from our talented community
              </motion.p>
            </motion.div>

            {currentPotw ? (
              <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center">
                {/* Enhanced image section */}
                <motion.div
                  className="w-full lg:w-1/2 hardware-accelerated"
                  initial={{ opacity: 0, x: -50 }}
                  animate={isPotwInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="relative group">
                    {/* Enhanced glass card with better styling */}
                    <div className="relative glass-card p-2 md:p-4 overflow-hidden">
                      {/* Decorative border gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-xl blur-sm" />
                      <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-2 md:p-4">
                        <ResponsiveImage
                          src={currentPotw.image || "/placeholder.svg"}
                          alt={`Photo of the Week - ${currentPotw.theme || ""} by ${currentPotw.photographer || ""}`}
                          width={600}
                          height={400}
                          className="rounded-lg w-full shadow-2xl transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                    
                  </div>
                </motion.div>

                {/* Enhanced content section */}
                <motion.div
                  className="w-full lg:w-1/2 space-y-6 hardware-accelerated"
                  initial={{ opacity: 0, x: 50 }}
                  animate={isPotwInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <div className="relative glass-card p-6 md:p-8 overflow-hidden">
                    {/* Decorative border gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-xl blur-sm" />
                    <div className="relative bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 md:p-8">
                      {/* Photographer name */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isPotwInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <h3 
                          className="font-extrabold mb-3 relative"
                          style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)" }}
                        >
                          <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                            {currentPotw.photographer}
                          </span>
                          {/* Decorative underline */}
                          <div className="absolute -bottom-1 left-0 w-16 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
                        </h3>
                      </motion.div>

                      {/* Theme */}
                      {currentPotw.theme && (
                        <motion.div
                          className="mb-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={isPotwInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                          transition={{ duration: 0.6, delay: 0.7 }}
                        >
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-blue-400">
                              <path fillRule="evenodd" d="M9.53 2.47a.75.75 0 0 1 0 1.06L4.81 8.25H15a6.75 6.75 0 0 1 0 13.5h-3a.75.75 0 0 1 0-1.5h3a5.25 5.25 0 1 0 0-10.5H4.81l4.72 4.72a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
                            </svg>
                            <span className="text-blue-300 font-medium text-sm">
                              Theme: "{currentPotw.theme}"
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {/* Description */}
                      <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isPotwInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                      >
                        <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                          {currentPotw.description}
                        </p>
                      </motion.div>

                      {/* CTA Button */}
                      <motion.div 
                        className="mt-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isPotwInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.6, delay: 0.9 }}
                      >
                        <motion.div 
                          whileHover={{ scale: 1.05 }} 
                          transition={{ duration: 0.2 }}
                          className="relative group"
                        >
                          {/* Button glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 scale-110" />
                          <Link 
                            href="/potw" 
                            className="relative btn-primary inline-block w-full sm:w-auto text-center px-8 py-3 text-lg font-bold shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300"
                          >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-6.19 6.19a1.5 1.5 0 0 1-2.12 0L3 16.06Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                              </svg>
                              View All Weekly Photos
                            </span>
                          </Link>
                        </motion.div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={isPotwInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="glass-card p-8 max-w-md mx-auto">
                  <div className="text-gray-400 text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-4 text-gray-500">
                      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-6.19 6.19a1.5 1.5 0 0 1-2.12 0L3 16.06Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                    </svg>
                    No Photo of the Week available at the moment.
                  </div>
                </div>
              </motion.div>
            )}
          </ResponsiveContainer>
        </motion.div>

        <Footer />
      </main>
    </ErrorBoundary>
  )
}
