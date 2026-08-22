"use client"

import { useEffect, useState } from "react"
import VelvetSweep from "@/app/components/backgrounds/effects/velvet-sweep"

/**
 * Enhanced brand field for Beginner Mode only.
 * VelvetSweep + soft blooms. Lighter on phone / reduced motion.
 */
export default function BeginnerField() {
  const [isMobile, setIsMobile] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const mqPhone = window.matchMedia("(max-width: 767px)")
    setReduced(mqReduce.matches)
    setIsMobile(mqPhone.matches)
    const onReduce = () => setReduced(mqReduce.matches)
    const onPhone = () => setIsMobile(mqPhone.matches)
    mqReduce.addEventListener("change", onReduce)
    mqPhone.addEventListener("change", onPhone)
    return () => {
      mqReduce.removeEventListener("change", onReduce)
      mqPhone.removeEventListener("change", onPhone)
    }
  }, [])

  const intensity = reduced ? 0.35 : isMobile ? 0.55 : 0.78
  const speed = reduced ? 0.35 : isMobile ? 0.55 : 0.7

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#0F1013]" />
      <VelvetSweep
        color="#3230e0"
        background="#0F1013"
        intensity={intensity}
        speed={speed}
        className="absolute inset-0 h-full w-full"
      />
      {/* Soft depth blooms */}
      <div
        className="absolute -left-1/4 top-1/4 h-[55vmax] w-[55vmax] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(50,48,224,0.35) 0%, transparent 68%)",
        }}
      />
      <div
        className="absolute -right-1/4 bottom-0 h-[45vmax] w-[45vmax] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(91,89,240,0.28) 0%, transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F1013]/30 via-transparent to-[#0F1013]/55" />
    </div>
  )
}
