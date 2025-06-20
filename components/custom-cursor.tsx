"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue } from "framer-motion"

type CursorVariant = "default" | "button" | "text" | "image" | "link"

export function CustomCursor() {
  const [cursorVariant, setCursorVariant] = useState<CursorVariant>("default")
  const [isVisible, setIsVisible] = useState(false)

  // Use motion values for better performance
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    // Only enable custom cursor on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
      setIsVisible(true)

      // More efficient mouse tracking with requestAnimationFrame
      const handleMouseMove = (e: MouseEvent) => {
        // Update motion values directly instead of using state
        mouseX.set(e.clientX)
        mouseY.set(e.clientY)
      }

      // Set cursor variant based on element being hovered
      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement

        if (
          target.tagName === "BUTTON" ||
          target.closest("button") ||
          target.tagName === "A" ||
          target.closest("a") ||
          target.classList.contains("btn-primary") ||
          target.classList.contains("btn-secondary")
        ) {
          setCursorVariant("button")
        } else if (
          target.tagName === "IMG" ||
          target.closest(".gallery-item") ||
          target.closest(".potw-card") ||
          target.closest(".team-card")
        ) {
          setCursorVariant("image")
        } else if (
          target.tagName === "P" ||
          target.tagName === "H1" ||
          target.tagName === "H2" ||
          target.tagName === "H3" ||
          target.tagName === "SPAN"
        ) {
          setCursorVariant("text")
        } else {
          setCursorVariant("default")
        }
      }

      // Throttle mouseover events for better performance
      let lastMouseOverTime = 0
      const throttledMouseOver = (e: MouseEvent) => {
        const now = performance.now()
        if (now - lastMouseOverTime > 50) {
          // Only process every 50ms
          handleMouseOver(e)
          lastMouseOverTime = now
        }
      }

      window.addEventListener("mousemove", handleMouseMove, { passive: true })
      window.addEventListener("mouseover", throttledMouseOver, { passive: true })

      // Hide default cursor
      document.body.style.cursor = "none"

      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseover", throttledMouseOver)
        document.body.style.cursor = "auto"
      }
    }
  }, [mouseX, mouseY])

  // Simplified variants with fewer animations
  const variants = {
    default: {
      height: 32,
      width: 32,
      transition: {
        type: "spring" as const,
        mass: 0.3,
        stiffness: 800,
        damping: 25,
      },
    },
    button: {
      height: 50,
      width: 50,
      transition: {
        type: "spring" as const,
        mass: 0.6,
        stiffness: 500,
        damping: 28,
      },
    },
    text: {
      height: 40,
      width: 40,
      transition: {
        type: "spring" as const,
        mass: 0.4,
        stiffness: 600,
        damping: 25,
      },
    },
    image: {
      height: 60,
      width: 60,
      transition: {
        type: "spring" as const,
        mass: 0.7,
        stiffness: 400,
        damping: 28,
      },
    },
  }

  // Define a style map for non-animatable properties
  const styleMap: Record<CursorVariant, React.CSSProperties> = {
    default: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
    },
    button: {
      backgroundColor: "rgba(0, 112, 243, 0.2)",
      border: "1px solid rgba(0, 112, 243, 0.5)",
      mixBlendMode: "difference",
    },
    text: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
    },
    image: {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      mixBlendMode: "difference",
    },
    link: {
      backgroundColor: "rgba(0, 112, 243, 0.1)",
      border: "1px solid rgba(0, 112, 243, 0.3)",
      mixBlendMode: "difference",
    },
  }

  if (!isVisible) return null

  return (
    <>
      <motion.div
        className="cursor-dot fixed top-0 left-0 z-[9999] rounded-full pointer-events-none will-change-transform hardware-accelerated"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          ...styleMap[cursorVariant],
        }}
        variants={variants}
        animate={cursorVariant}
      />
      <motion.div
        className="cursor-ring fixed top-0 left-0 z-[9998] rounded-full pointer-events-none bg-transparent will-change-transform hardware-accelerated"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          height: 16,
          width: 16,
          border: "2px solid rgba(255, 255, 255, 0.5)",
        }}
        transition={{
          type: "spring",
          mass: 0.1,
          stiffness: 1000,
          damping: 20,
        }}
      />
    </>
  )
}

export default CustomCursor
