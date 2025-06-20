"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export default function ParallaxBackground() {
  const ref = useRef(null)
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check for reduced motion preference and mobile devices
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mediaQuery.matches)

    // Check if device is mobile or has low performance
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

  // Transform values for parallax effect - reduced number of animations
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200])
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity1 = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  // Reduce the number of animated elements based on device capability
  const REDUCED_ELEMENTS = {
    triangles: isMobile ? 0 : isReducedMotion ? 2 : 4,
    squares: isMobile ? 0 : isReducedMotion ? 1 : 3,
    circles: isMobile ? 2 : isReducedMotion ? 3 : 5,
    lines: isMobile ? 0 : isReducedMotion ? 4 : 8,
    particles: isMobile ? 2 : isReducedMotion ? 3 : 5,
  }

  return (
    <div ref={ref} className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient with subtle texture */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900 via-blue-800 to-black opacity-90"></div>

      {/* Subtle noise texture overlay - only on desktop */}
      {!isMobile && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Large gradient orbs - reduced number and simplified animations */}
      <motion.div
        className="absolute top-[5%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-gradient-radial from-blue-500/20 to-transparent blur-3xl will-change-transform hardware-accelerated"
        style={{ y: y1 }}
        animate={
          !isReducedMotion
            ? {
                x: [0, 30, 0],
              }
            : {}
        }
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="absolute top-[30%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-gradient-radial from-indigo-600/15 to-transparent blur-3xl will-change-opacity hardware-accelerated"
        style={{ y: y2, opacity: opacity1 }}
        animate={
          !isReducedMotion
            ? {
                x: [0, -40, 0],
              }
            : {}
        }
        transition={{
          duration: 35,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />

      {/* Only render complex animations if not on mobile and not reduced motion */}
      {!isReducedMotion && !isMobile && (
        <>
          {/* Animated geometric shapes - reduced quantity and simplified */}
          <div className="geometric-shapes">
            {/* Triangles - reduced quantity */}
            {[...Array(REDUCED_ELEMENTS.triangles)].map((_, i) => (
              <motion.div
                key={`triangle-${i}`}
                className="absolute will-change-transform hardware-accelerated"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 40 + 20}px`,
                  height: `${Math.random() * 40 + 20}px`,
                  borderLeft: `${Math.random() * 20 + 10}px solid transparent`,
                  borderRight: `${Math.random() * 20 + 10}px solid transparent`,
                  borderBottom: `${Math.random() * 30 + 15}px solid rgba(255, 255, 255, ${Math.random() * 0.08 + 0.02})`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
                animate={{
                  y: [0, Math.random() * 50 - 25],
                  opacity: [Math.random() * 0.08 + 0.02, Math.random() * 0.05 + 0.01, Math.random() * 0.08 + 0.02],
                }}
                transition={{
                  duration: Math.random() * 20 + 15,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            ))}

            {/* Squares - reduced quantity */}
            {[...Array(REDUCED_ELEMENTS.squares)].map((_, i) => (
              <motion.div
                key={`square-${i}`}
                className="absolute rounded-sm will-change-transform hardware-accelerated"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 30 + 10}px`,
                  height: `${Math.random() * 30 + 10}px`,
                  border: `1px solid rgba(255, 255, 255, ${Math.random() * 0.08 + 0.02})`,
                  backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.03 + 0.01})`,
                }}
                animate={{
                  y: [0, Math.random() * 60 - 30],
                  opacity: [Math.random() * 0.08 + 0.02, Math.random() * 0.05 + 0.01, Math.random() * 0.08 + 0.02],
                }}
                transition={{
                  duration: Math.random() * 25 + 20,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            ))}

            {/* Lines - reduced quantity */}
            {[...Array(REDUCED_ELEMENTS.lines)].map((_, i) => {
              const length = Math.random() * 80 + 20
              const angle = Math.random() * 360
              return (
                <motion.div
                  key={`line-${i}`}
                  className="absolute will-change-transform hardware-accelerated"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${length}px`,
                    height: "1px",
                    background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05}), transparent)`,
                    transform: `rotate(${angle}deg)`,
                  }}
                  animate={{
                    opacity: [Math.random() * 0.1 + 0.05, Math.random() * 0.05 + 0.02, Math.random() * 0.1 + 0.05],
                  }}
                  transition={{
                    duration: Math.random() * 20 + 10,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
              )
            })}
          </div>
        </>
      )}

      {/* Glowing particles - reduced quantity and always present but fewer on mobile */}
      <div className="particles">
        {[...Array(REDUCED_ELEMENTS.particles)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full will-change-transform hardware-accelerated"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: `rgba(${150 + Math.random() * 105}, ${180 + Math.random() * 75}, 255, ${Math.random() * 0.5 + 0.3})`,
              boxShadow: `0 0 ${Math.random() * 5 + 2}px rgba(100, 150, 255, ${Math.random() * 0.3 + 0.2})`,
            }}
            animate={
              !isReducedMotion
                ? {
                    y: [0, Math.random() * 100 - 50],
                    opacity: [Math.random() * 0.5 + 0.3, Math.random() * 0.3 + 0.1, Math.random() * 0.5 + 0.3],
                  }
                : {}
            }
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Subtle wave effect - only on desktop and non-reduced motion */}
      {!isMobile && !isReducedMotion && (
        <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <motion.path
            fill="rgba(100, 150, 255, 0.3)"
            fillOpacity="1"
            initial={{
              d: "M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,197.3C672,224,768,224,864,197.3C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
            }}
            animate={{
              d: [
                "M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,197.3C672,224,768,224,864,197.3C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,128L48,149.3C96,171,192,213,288,213.3C384,213,480,171,576,165.3C672,160,768,192,864,197.3C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              ],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            className="will-change-transform hardware-accelerated"
          />
        </svg>
      )}
    </div>
  )
}
