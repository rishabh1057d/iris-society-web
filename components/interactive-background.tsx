"use client"

import { useEffect, useRef, useState, useCallback } from "react"

/**
 * IRIS atmospheric background — photography darkroom + aperture light.
 * Replaces the old mesh-shader + floating blue orbs + particle network.
 *
 * Layers (back → front):
 *  1. Deep ink void (CSS)
 *  2. Soft warm / teal light wells (CSS, slow drift — desktop only motion)
 *  3. Concentric aperture rings (CSS, pure geometry)
 *  4. Sparse dust motes (canvas — few, tiny; disabled on reduced-motion)
 *  5. Film grain (SVG noise, opacity only)
 *  6. Vignette + top/bottom readability fades
 */

function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const mqMobile = window.matchMedia("(max-width: 768px)")
    const apply = () => {
      setIsReducedMotion(mqMotion.matches)
      setIsMobile(mqMobile.matches || (navigator.hardwareConcurrency || 8) <= 4)
    }
    apply()
    mqMotion.addEventListener("change", apply)
    mqMobile.addEventListener("change", apply)
    return () => {
      mqMotion.removeEventListener("change", apply)
      mqMobile.removeEventListener("change", apply)
    }
  }, [])

  const paintDust = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = window.innerWidth
    const h = window.innerHeight
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    // Static sparse dust — redraw only on resize for reduced motion / mobile
    ctx.clearRect(0, 0, w, h)
    const count = isMobile ? 28 : 55
    for (let i = 0; i < count; i++) {
      // Deterministic-ish scatter from index so it doesn't jump every frame when static
      const x = ((i * 97.3) % 1) * w + ((i * 13) % 17)
      const y = ((i * 61.7) % 1) * h + ((i * 7) % 23)
      const r = 0.4 + (i % 3) * 0.35
      const a = 0.08 + (i % 5) * 0.025
      ctx.beginPath()
      ctx.fillStyle = i % 3 === 0 ? `rgba(212, 165, 116, ${a})` : `rgba(148, 210, 200, ${a * 0.85})`
      ctx.arc((x + w) % w, (y + h) % h, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [isMobile])

  // Animated dust only on desktop without reduced motion
  useEffect(() => {
    if (isReducedMotion || isMobile) {
      paintDust()
      const onResize = () => paintDust()
      window.addEventListener("resize", onResize, { passive: true })
      return () => window.removeEventListener("resize", onResize)
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    type Mote = { x: number; y: number; r: number; a: number; vx: number; vy: number; warm: boolean }
    let motes: Mote[] = []
    let w = 0
    let h = 0

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = 48
      motes = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.1,
        a: 0.06 + Math.random() * 0.12,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.04 - Math.random() * 0.08,
        warm: i % 3 !== 0,
      }))
    }

    seed()
    let last = performance.now()

    const tick = (now: number) => {
      const dt = Math.min(32, now - last) / 16
      last = now
      ctx.clearRect(0, 0, w, h)
      for (const m of motes) {
        m.x += m.vx * dt
        m.y += m.vy * dt
        if (m.y < -4) {
          m.y = h + 4
          m.x = Math.random() * w
        }
        if (m.x < -4) m.x = w + 4
        if (m.x > w + 4) m.x = -4
        ctx.beginPath()
        ctx.fillStyle = m.warm
          ? `rgba(212, 165, 116, ${m.a})`
          : `rgba(125, 211, 192, ${m.a * 0.9})`
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    const onResize = () => seed()
    window.addEventListener("resize", onResize, { passive: true })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", onResize)
    }
  }, [isMobile, isReducedMotion, paintDust])

  return (
    <div
      className="iris-atmosphere fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden
    >
      {/* 1. Base void — warm near-black, not blue navy */}
      <div className="iris-atm-base absolute inset-0" />

      {/* 2. Light wells */}
      <div className="iris-atm-well iris-atm-well--amber absolute" />
      <div className="iris-atm-well iris-atm-well--teal absolute" />
      <div className="iris-atm-well iris-atm-well--rose absolute" />

      {/* 3. Aperture rings — camera / iris motif */}
      <div className="iris-atm-rings absolute inset-0 flex items-center justify-center">
        <div className="iris-atm-ring iris-atm-ring--lg" />
        <div className="iris-atm-ring iris-atm-ring--md" />
        <div className="iris-atm-ring iris-atm-ring--sm" />
      </div>

      {/* 4. Dust motes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 5. Film grain */}
      <div className="iris-atm-grain absolute inset-0" />

      {/* 6. Vignette + edge readability */}
      <div className="iris-atm-vignette absolute inset-0" />
      <div className="iris-atm-top-fade absolute inset-x-0 top-0 h-28 md:h-36" />
      <div className="iris-atm-bottom-fade absolute inset-x-0 bottom-0 h-32 md:h-40" />
    </div>
  )
}

export default InteractiveBackground
export { InteractiveBackground }
