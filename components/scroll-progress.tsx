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
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight
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

    updateScrollProgress()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full origin-left will-change-transform"
        style={{
          width: "100%",
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #a78bfa)",
          transform: `scaleX(${scrollProgress / 100})`,
          transition: "transform 80ms linear",
          boxShadow: "0 0 8px rgba(59, 130, 246, 0.45)",
        }}
      />
    </div>
  )
}
