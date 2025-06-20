"use client"

import { useEffect, useState } from "react"

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    let rafId: number | null = null
    let ticking = false

    const updateScrollProgress = () => {
      if (typeof window !== "undefined") {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
        setScrollProgress(Math.min(Math.max(scrollPercent, 0), 100))
      }
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(updateScrollProgress)
        ticking = true
      }
    }

    // Initial calculation
    updateScrollProgress()

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50"
      style={{
        background: `linear-gradient(to right, #3b82f6, #8b5cf6)`,
        transform: `scaleX(${scrollProgress / 100})`,
        transformOrigin: "left",
        transition: "transform 0.1s ease-out",
      }}
    />
  )
}
