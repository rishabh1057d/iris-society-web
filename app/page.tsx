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

export default function Home() {
  const [scrollY, setScrollY] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const potwRef = useRef<HTMLDivElement>(null)
  const isPotwInView = useInView(potwRef, { once: false, margin: "-100px 0px" })
  const controls = useAnimation()
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSczSzMGIAd-sE_nxe9wOFSrsYy59lzRBhU9e5uhOjMtmIquLQ/viewform"

  // Handle Join Now click
  const handleJoinNowClick = (e: React.MouseEvent) => {
    e.preventDefault()
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

  return (
    <ErrorBoundary>
      {/* Redirect Handler */}
      <RedirectHandler
        isRedirecting={isRedirecting}
        targetUrl={GOOGLE_FORM_URL}
        onComplete={() => setIsRedirecting(false)}
      />

      <main ref={mainRef} className="flex min-h-screen flex-col items-center relative overflow-hidden">
        <Navbar />

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
                width={240}
                height={240}
                priority
                className="mx-auto filter drop-shadow-lg max-w-[180px] sm:max-w-[200px] md:max-w-[240px]"
                aspectRatio="1/1"
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

            <div className="flex flex-col lg:flex-row gap-8 items-center">
              <motion.div
                className="w-full lg:w-1/2 hardware-accelerated"
                initial={{ opacity: 0, x: -50 }}
                animate={isPotwInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="glass-card">
                  <ResponsiveImage
                    src="/images/week1.jpeg"
                    alt="Photo of the Week - Nature's Patterns by Priya Sharma"
                    width={600}
                    height={400}
                    className="rounded-lg w-full shadow-lg"
                    aspectRatio="4/3"
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
                    Priya Sharma
                  </h3>
                  <p className="text-gray-400 text-responsive break-all sm:break-normal">
                    24f1002346@ds.study.iitm.ac.in
                  </p>
                  <p className="text-gray-300 text-responsive">Theme: "Nature's Patterns"</p>
                  <p className="text-gray-300 text-responsive">
                    This beautiful butterfly was captured during early morning at the campus garden. The intricate
                    patterns on its wings showcase nature's artistic precision.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }} className="mt-4">
                    <Link href="/potw" className="btn-primary inline-block w-full sm:w-auto text-center">
                      View All Weekly Photos
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </ResponsiveContainer>
        </motion.div>

        <Footer />
      </main>
    </ErrorBoundary>
  )
}
