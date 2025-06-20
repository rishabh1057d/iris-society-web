"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import InteractiveBackground from "./interactive-background"
import WaveAnimation from "./wave-animation"

export default function EnhancedParallaxBackground() {
  const ref = useRef(null)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check for reduced motion preference and mobile devices
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mediaQuery.matches)
    setIsMobile(window.innerWidth < 768 || navigator.hardwareConcurrency <= 4)

    const handleMediaChange = () => setIsReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleMediaChange)

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange)
    }
  }, [])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Transform values for parallax effect
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity1 = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
    <div ref={ref} className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-black opacity-90"></div>

      {/* Interactive particle system */}
      <InteractiveBackground />

      {/* Animated wave background */}
      <WaveAnimation />

      {/* Large gradient orbs with parallax */}
      <motion.div
        className="absolute top-[5%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-radial from-blue-500/20 to-transparent blur-3xl will-change-transform"
        style={{ y: y1 }}
        animate={
          !isReducedMotion
            ? {
                x: [0, 30, 0],
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="absolute top-[30%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-gradient-radial from-indigo-600/15 to-transparent blur-3xl will-change-opacity"
        style={{ y: y2, opacity: opacity1 }}
        animate={
          !isReducedMotion
            ? {
                x: [0, -40, 0],
                scale: [1, 1.2, 1],
              }
            : {}
        }
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      {/* Floating geometric shapes */}
      {!isReducedMotion && !isMobile && (
        <div className="geometric-shapes">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`floating-${i}`}
              className="absolute will-change-transform"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 60 + 20}px`,
                height: `${Math.random() * 60 + 20}px`,
                borderRadius: i % 2 === 0 ? "50%" : "0%",
                background: `rgba(${100 + Math.random() * 155}, ${150 + Math.random() * 105}, 255, ${
                  Math.random() * 0.1 + 0.05
                })`,
                border: `1px solid rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`,
              }}
              animate={{
                y: [0, Math.random() * 100 - 50],
                x: [0, Math.random() * 50 - 25],
                rotate: [0, 360],
                opacity: [Math.random() * 0.1 + 0.05, Math.random() * 0.08 + 0.02, Math.random() * 0.1 + 0.05],
              }}
              transition={{
                duration: Math.random() * 20 + 15,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle noise texture overlay */}
      {!isMobile && (
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />
      )}

      {/* Dynamic gradient overlay that responds to scroll */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
        style={{ opacity: scrollYProgress }}
      />
    </div>
  )
}
