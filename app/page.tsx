"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ResponsiveContainer from "@/components/responsive-container"
import ResponsiveImage from "@/components/responsive-image"
import ErrorBoundary from "@/components/error-boundary"
import RedirectHandler from "@/components/redirect-handler"
import { motion, useAnimation, useInView, useScroll, useTransform } from "framer-motion"
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
  const heroRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const potwRef = useRef<HTMLDivElement>(null)
  const isPotwInView = useInView(potwRef, { once: false, margin: "-100px 0px" })
  const controls = useAnimation()
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [showHiringModal, setShowHiringModal] = useState(true)

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

  return (
    <ErrorBoundary>
      {/* Hiring Popup Modal */}
      <Dialog open={showHiringModal} onOpenChange={setShowHiringModal}>
        <DialogContent className="backdrop-blur-md max-w-[90vw] sm:max-w-lg p-8 rounded-xl shadow-2xl border-0 bg-neutral-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-center mb-2 text-white">We are Hiring</DialogTitle>
            <DialogDescription className="text-center text-base sm:text-lg mb-6 text-gray-300">
              We are looking for people to join our core team.<br />If you are interested, join now!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <a
              href="https://forms.gle/XkNmxfYLzbR6E7Xt8"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-6 py-2 text-lg rounded shadow w-full sm:w-auto text-center"
            >
              Join the core team
            </a>
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
                  <span className="relative z-10">{isRedirecting ? "Redirecting..." : "Join Now"}</span>
                </button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="will-change-transform w-full sm:w-auto">
                <a
                  href="https://forms.gle/XkNmxfYLzbR6E7Xt8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full sm:w-auto border-2 border-blue-400 text-blue-400 bg-transparent hover:bg-blue-50 transition-colors duration-200 font-semibold py-2 px-6 rounded shadow"
                >
                  Join The Core Team
                </a>
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
