"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import Footer from "@/components/footer"
import ErrorBoundary from "@/components/error-boundary"
import RedirectHandler from "@/components/redirect-handler"
import { motion, AnimatePresence, useAnimation, useInView, useScroll, useTransform } from "framer-motion"
import SymphonyOverlay from "@/components/symphony-overlay"
import HomeLanding from "@/components/home/home-landing"
import { selectFeaturedPotw } from "@/lib/potw"
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

function RetroPixelArtOverlay() {
  // Warm sunset palette: reds, oranges, yellows, creams (for coins/collectibles)
  const collectiblePalette = [
    '#FFD700', // gold
    '#FFA500', // orange
    '#FF6347', // tomato red
    '#FFD700', // gold (more weight)
    '#FFFFFF', // white
    '#F5B041', // golden yellow
    '#E67E22', // deep orange
  ]

  // Pixel confetti/coins that fall and bounce
  const pixelConfetti = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
    const count = isMobile ? 30 : 60
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100
      const startTop = -10 - Math.random() * 20 // Start above viewport
      const delay = Math.random() * 5
      const size = 6 + Math.random() * 10 // 6-16px blocks (chunky pixels)
      const color = collectiblePalette[Math.floor(Math.random() * collectiblePalette.length)]
      const fallDuration = 3 + Math.random() * 4 // 3-7 seconds to fall
      const bounceHeight = 20 + Math.random() * 40
      const horizontalDrift = (Math.random() - 0.5) * 30
      const rotation = Math.random() * 360
      return { 
        id: i, 
        left, 
        startTop, 
        delay, 
        size, 
        color, 
        fallDuration, 
        bounceHeight,
        horizontalDrift,
        rotation
      }
    })
  }, [])

  // Glitch blocks for pixel displacement effect
  const glitchBlocks = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      delay: i * 0.3,
      offset: (Math.random() - 0.5) * 15,
    }))
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden retro-container">
      {/* Dithering background gradient with warm sunset tones */}
      <div className="retro-dither-bg" />
      
      {/* Enhanced CRT Scanlines - more prominent */}
      <div className="retro-scanlines" />
      
      {/* Vignette - darker corners like old CRT screen */}
      <div className="retro-vignette" />
      
      {/* Screen flicker effect */}
      <div className="retro-flicker" />
      
      {/* RGB Glitch Split Effect */}
      <div className="retro-glitch-rgb" />
      
      {/* Pixel displacement glitch blocks */}
      {glitchBlocks.map((g) => (
        <div
          key={g.id}
          className="retro-glitch-block"
          style={{
            animationDelay: `${g.delay}s`,
            // @ts-ignore
            '--glitch-offset': `${g.offset}px`,
          } as React.CSSProperties}
        />
      ))}
      
      {/* Pixel Confetti/Coins - collectible style */}
      {pixelConfetti.map((p) => (
        <div
          key={p.id}
          className="retro-coin"
          style={{
            left: `${p.left}%`,
            top: `${p.startTop}%`,
            animationDelay: `${p.delay}s`,
            // @ts-ignore
            '--coin-size': `${p.size}px`,
            '--coin-color': p.color,
            '--coin-dur': `${p.fallDuration}s`,
            '--bounce-height': `${p.bounceHeight}px`,
            '--drift-x': `${p.horizontalDrift}px`,
            '--coin-rotation': `${p.rotation}deg`,
          } as React.CSSProperties}
        />
      ))}

      {/* Static noise overlay */}
      <div className="retro-static" />

      <style jsx>{`
        .retro-container {
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }

        .retro-dither-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #5C1A0F 0%, #8B2E1F 25%, #C94A1F 50%, #E67E22 75%, #F5B041 100%);
          opacity: 0.3;
          /* Dithering pattern - checkerboard for color blending */
          background-image: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 3px,
              rgba(0, 0, 0, 0.15) 3px,
              rgba(0, 0, 0, 0.15) 6px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 3px,
              rgba(0, 0, 0, 0.15) 3px,
              rgba(0, 0, 0, 0.15) 6px
            );
        }

        /* Enhanced CRT Scanlines - every 2-3 pixels */
        .retro-scanlines {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.3) 2px,
            rgba(0, 0, 0, 0.3) 3px
          );
          pointer-events: none;
          animation: scanlineMove 0.08s linear infinite;
          opacity: 0.7;
          mix-blend-mode: multiply;
        }

        @keyframes scanlineMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(3px); }
        }

        /* Vignette - darker corners like curved CRT glass */
        .retro-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 40%,
            rgba(0, 0, 0, 0.4) 70%,
            rgba(0, 0, 0, 0.7) 100%
          );
          pointer-events: none;
          opacity: 0.6;
        }

        /* Screen flicker - subtle brightness pulse */
        .retro-flicker {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.02);
          animation: screenFlicker 0.15s infinite;
          pointer-events: none;
        }

        @keyframes screenFlicker {
          0%, 100% { opacity: 0; }
          48% { opacity: 0; }
          49% { opacity: 1; }
          50% { opacity: 0; }
          51% { opacity: 1; }
          52% { opacity: 0; }
        }

        /* RGB Glitch Split - horizontal color separation */
        .retro-glitch-rgb {
          position: absolute;
          inset: 0;
          background: 
            linear-gradient(90deg, 
              rgba(255, 0, 0, 0.1) 0%,
              transparent 50%,
              rgba(0, 0, 255, 0.1) 100%
            );
          pointer-events: none;
          animation: rgbGlitch 4s ease-in-out infinite;
          mix-blend-mode: screen;
          opacity: 0;
        }

        @keyframes rgbGlitch {
          0%, 90%, 100% { 
            opacity: 0;
            transform: translateX(0);
          }
          2% { 
            opacity: 0.8;
            transform: translateX(-3px);
          }
          4% { 
            opacity: 0.6;
            transform: translateX(3px);
          }
          6% { 
            opacity: 0;
            transform: translateX(0);
          }
        }

        /* Pixel displacement glitch blocks */
        .retro-glitch-block {
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(0, 255, 0, 0.3);
          left: calc(20% + var(--glitch-offset));
          top: 30%;
          animation: glitchBlock 3s ease-in-out infinite;
          image-rendering: pixelated;
          mix-blend-mode: difference;
        }

        @keyframes glitchBlock {
          0%, 95%, 100% { 
            opacity: 0;
            transform: translate(0, 0);
          }
          1% { 
            opacity: 1;
            transform: translate(var(--glitch-offset), 5px);
          }
          2% { 
            opacity: 0.5;
            transform: translate(calc(var(--glitch-offset) * -1), -5px);
          }
          3% { 
            opacity: 0;
            transform: translate(0, 0);
          }
        }

        /* Pixel Confetti/Coins - collectible style with gravity */
        .retro-coin {
          position: absolute;
          width: var(--coin-size);
          height: var(--coin-size);
          background-color: var(--coin-color);
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          box-shadow: 
            0 0 4px var(--coin-color),
            inset 0 0 3px rgba(255, 255, 255, 0.4),
            inset 0 0 6px rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          animation: coinFall var(--coin-dur) ease-in infinite;
          transform: translate(-50%, -50%) rotate(var(--coin-rotation));
        }

        @keyframes coinFall {
          0% {
            transform: translate(-50%, -50%) translateX(0) translateY(0) rotate(var(--coin-rotation)) scale(1);
            opacity: 1;
          }
          10% {
            transform: translate(-50%, -50%) translateX(calc(var(--drift-x) * 0.2)) translateY(10vh) rotate(calc(var(--coin-rotation) + 90deg)) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) translateX(calc(var(--drift-x) * 0.5)) translateY(50vh) rotate(calc(var(--coin-rotation) + 180deg)) scale(1.1);
            opacity: 0.9;
          }
          85% {
            transform: translate(-50%, -50%) translateX(var(--drift-x)) translateY(calc(100vh + var(--bounce-height))) rotate(calc(var(--coin-rotation) + 270deg)) scale(0.9);
            opacity: 0.8;
          }
          90% {
            transform: translate(-50%, -50%) translateX(var(--drift-x)) translateY(calc(100vh - var(--bounce-height) * 0.3)) rotate(calc(var(--coin-rotation) + 300deg)) scale(1.05);
            opacity: 0.9;
          }
          95% {
            transform: translate(-50%, -50%) translateX(var(--drift-x)) translateY(calc(100vh + var(--bounce-height) * 0.1)) rotate(calc(var(--coin-rotation) + 320deg)) scale(0.95);
            opacity: 0.7;
          }
          100% {
            transform: translate(-50%, -50%) translateX(var(--drift-x)) translateY(calc(100vh + 20px)) rotate(calc(var(--coin-rotation) + 360deg)) scale(0.8);
            opacity: 0;
          }
        }

        /* Static noise overlay */
        .retro-static {
          position: absolute;
          inset: 0;
          background-image: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.03) 2px,
              rgba(255, 255, 255, 0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0, 0, 0, 0.03) 2px,
              rgba(0, 0, 0, 0.03) 4px
            );
          pointer-events: none;
          opacity: 0.4;
          animation: staticNoise 0.1s steps(4) infinite;
        }

        @keyframes staticNoise {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-1px, 1px); }
          50% { transform: translate(1px, -1px); }
          75% { transform: translate(-1px, -1px); }
          100% { transform: translate(1px, 1px); }
        }

        /* Mobile optimizations */
        @media (max-width: 640px) {
          .retro-coin {
            opacity: 0.7;
          }
          .retro-scanlines {
            opacity: 0.5;
          }
          .retro-vignette {
            opacity: 0.4;
          }
          .retro-static {
            opacity: 0.3;
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
  const [potwData, setPotwData] = useState<Record<string, Record<string, any[]>>>({})
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
  const [showRetroEffect, setShowRetroEffect] = useState(false)
  const [showSymphony, setShowSymphony] = useState(false)
  const [popupData, setPopupData] = useState<{ enabled?: boolean; title?: string; description?: string; image?: string; registerUrl?: string; rulebookUrl?: string; registrationDeadline?: string; fireworks?: boolean; retro?: boolean; symphony?: boolean } | null>(null)
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

  // Feature current week if present; otherwise always the latest real winner in the archive
  useEffect(() => {
    if (!potwData || Object.keys(potwData).length === 0) {
      setCurrentPotw(null)
      return
    }
    setCurrentPotw(selectFeaturedPotw(potwData))
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
          // Fireworks and retro effect triggers specifically under popup
          try {
            setShowFireworks(Boolean(data.popup.fireworks))
            setShowRetroEffect(Boolean(data.popup.retro))
            setShowSymphony(Boolean(data.popup.symphony))
          } catch {
            setShowFireworks(false)
            setShowRetroEffect(false)
            setShowSymphony(false)
          }
        } else {
          setShowFireworks(false)
          setShowRetroEffect(false)
          setShowSymphony(false)
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
              {showRetroEffect && <RetroPixelArtOverlay />}
              {showSymphony && <SymphonyOverlay />}
              <motion.div
                className={`relative z-[55] rounded-2xl overflow-hidden w-full max-w-[1100px] h-[90vh] md:h-[80vh] max-h-[90vh] md:max-h-[85vh] flex flex-col md:flex-row backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ${showRetroEffect ? 'retro-popup-glitch' : ''} ${showSymphony ? 'symphony-popup' : ''}`}
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

      {/* Global styles for retro popup glitch effect */}
      {showRetroEffect && (
        <style jsx global>{`
          .retro-popup-glitch {
            position: relative;
            animation: popupGlitch 5s ease-in-out infinite;
          }

          .retro-popup-glitch::before,
          .retro-popup-glitch::after {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 1;
          }

          .retro-popup-glitch::before {
            background: linear-gradient(90deg, 
              transparent 0%,
              rgba(255, 0, 0, 0.1) 48%,
              rgba(255, 0, 0, 0.1) 52%,
              transparent 100%
            );
            mix-blend-mode: screen;
            animation: rgbSplitBefore 4s ease-in-out infinite;
          }

          .retro-popup-glitch::after {
            background: linear-gradient(90deg, 
              transparent 0%,
              rgba(0, 0, 255, 0.1) 48%,
              rgba(0, 0, 255, 0.1) 52%,
              transparent 100%
            );
            mix-blend-mode: screen;
            animation: rgbSplitAfter 4s ease-in-out infinite;
          }

          @keyframes popupGlitch {
            0%, 90%, 100% {
              transform: translateX(0);
              filter: hue-rotate(0deg);
            }
            1% {
              transform: translateX(-2px);
              filter: hue-rotate(5deg);
            }
            2% {
              transform: translateX(2px);
              filter: hue-rotate(-5deg);
            }
            3% {
              transform: translateX(0);
              filter: hue-rotate(0deg);
            }
          }

          @keyframes rgbSplitBefore {
            0%, 90%, 100% {
              transform: translateX(0);
              opacity: 0;
            }
            1% {
              transform: translateX(-4px);
              opacity: 0.8;
            }
            2% {
              transform: translateX(4px);
              opacity: 0.6;
            }
            3% {
              transform: translateX(0);
              opacity: 0;
            }
          }

          @keyframes rgbSplitAfter {
            0%, 90%, 100% {
              transform: translateX(0);
              opacity: 0;
            }
            1% {
              transform: translateX(4px);
              opacity: 0.8;
            }
            2% {
              transform: translateX(-4px);
              opacity: 0.6;
            }
            3% {
              transform: translateX(0);
              opacity: 0;
            }
          }

          /* Pixel displacement on hover for buttons inside retro popup */
          .retro-popup-glitch button:hover,
          .retro-popup-glitch a:hover {
            animation: buttonGlitch 0.3s ease-in-out;
          }

          @keyframes buttonGlitch {
            0%, 100% {
              transform: translateX(0) translateY(0);
            }
            25% {
              transform: translateX(-1px) translateY(1px);
            }
            50% {
              transform: translateX(1px) translateY(-1px);
            }
            75% {
              transform: translateX(-1px) translateY(-1px);
            }
          }

          /* Pixelated image effect */
          .retro-popup-glitch img {
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
            filter: contrast(1.1) saturate(1.2);
          }
        `}</style>
      )}

      {/* Global styles for Symphony ("Symphony in Shades") popup theme */}
      {showSymphony && (
        <style jsx global>{`
          .symphony-popup {
            --primary-pink: #f56483;
            --primary-purple: #703c84;
            --accent-yellow: #ffb000;
            --accent-green: #406014;
            --soft-pink: #fcc4b7;
            --soft-lav: #ebdbe6;
          }

          .symphony-popup {
            background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.04));
            border-color: rgba(112,60,132,0.18) !important;
          }

          .symphony-popup h3 {
            color: var(--primary-purple);
            background: linear-gradient(90deg, var(--primary-pink), var(--primary-purple));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-family: 'Roxaine', 'Cormorant Garamond', serif;
            font-weight: 800;
            font-size: 1.25rem;
          }

          .symphony-popup .btn-primary {
            background: linear-gradient(90deg, var(--primary-pink), var(--primary-purple));
            color: white !important;
            border: none !important;
            box-shadow: 0 10px 30px rgba(117,39,92,0.18);
          }

          .symphony-popup .btn-secondary {
            border-color: rgba(112,60,132,0.12) !important;
          }

          .symphony-popup .rounded-xl.bg-black\/50 {
            background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
            border: 1px solid rgba(112,60,132,0.06);
          }

          /* Subtle decorative accents inside popup */
          .symphony-popup .event-accent {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: var(--accent-yellow);
            border-radius: 9999px;
            margin-right: 8px;
          }

          @media (max-width: 640px) {
            .symphony-popup h3 { font-size: 1.05rem; }
            .symphony-popup .btn-primary { padding-top: 0.5rem; padding-bottom: 0.5rem; }
          }
        `}</style>
      )}

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

      <main ref={mainRef} className="relative z-10 flex min-h-screen w-full flex-col items-center overflow-x-clip">
        <HomeLanding
          currentPotw={currentPotw}
          recruiting={recruiting}
          isRedirecting={isRedirecting}
          onJoin={handleJoinNowClick}
          onApplyCore={() => {
            if (recruiting) {
              window.open("https://forms.gle/XkNmxfYLzbR6E7Xt8", "_blank", "noopener,noreferrer")
            } else {
              setApplyModalOpen(true)
            }
          }}
          videoData={videoData}
          videoMuted={videoMuted}
          onToggleMute={() => setVideoMuted((m) => !m)}
          videoRef={videoRef}
        />
        <Footer />
      </main>
    </ErrorBoundary>
  )
}
