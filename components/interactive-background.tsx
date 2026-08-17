"use client"

/**
 * IRIS Lightfield background
 * Soft photographic bokeh + anamorphic glints over the mesh field.
 * Click opens a brief aperture bloom and seeds a few new orbs of light.
 * Replaces the old connected particle / bouncing-ball field.
 */

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import MeshGradientComponent from "@/components/mesh-gradient"

interface Bokeh {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  baseR: number
  hue: number
  sat: number
  light: number
  alpha: number
  phase: number
  speed: number
  depth: number // 0 near ... 1 far (parallax + blur feel)
  life: number
  maxLife: number
  ephemeral: boolean // click-spawned, fades out
}

interface Glint {
  x: number
  y: number
  w: number
  h: number
  angle: number
  alpha: number
  phase: number
  speed: number
}

interface ApertureRipple {
  id: number
  x: number
  y: number
}

const BRAND_HUES = [235, 248, 262, 220] // indigo / violet family around #3230e0

function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const bokehRef = useRef<Bokeh[]>([])
  const glintsRef = useRef<Glint[]>([])
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const timeRef = useRef(0)
  const [ripples, setRipples] = useState<ApertureRipple[]>([])
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 120, damping: 28 })
  const springY = useSpring(mouseY, { stiffness: 120, damping: 28 })

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mediaQuery.matches)
    setIsMobile(window.innerWidth < 768 || navigator.hardwareConcurrency <= 4)

    const handleMediaChange = () => setIsReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleMediaChange)
    return () => mediaQuery.removeEventListener("change", handleMediaChange)
  }, [])

  const spawnBokeh = useCallback(
    (
      canvas: HTMLCanvasElement,
      opts?: Partial<Bokeh> & { at?: { x: number; y: number } },
    ): Bokeh => {
      const depth = opts?.depth ?? Math.random()
      const baseR = opts?.baseR ?? (isMobile ? 18 + Math.random() * 42 : 28 + Math.random() * 70) * (0.55 + depth * 0.9)
      const hue = opts?.hue ?? BRAND_HUES[Math.floor(Math.random() * BRAND_HUES.length)] + (Math.random() - 0.5) * 18
      const ephemeral = opts?.ephemeral ?? false
      const at = opts?.at

      return {
        x: at?.x ?? Math.random() * canvas.width,
        y: at?.y ?? Math.random() * canvas.height,
        vx: opts?.vx ?? (Math.random() - 0.5) * (0.12 + depth * 0.18),
        vy: opts?.vy ?? (Math.random() - 0.5) * (0.1 + depth * 0.14) - 0.02,
        r: baseR,
        baseR,
        hue,
        sat: opts?.sat ?? 55 + Math.random() * 30,
        light: opts?.light ?? 52 + Math.random() * 22,
        alpha: opts?.alpha ?? (0.04 + (1 - depth) * 0.1) * (ephemeral ? 1.4 : 1),
        phase: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.008,
        depth,
        life: 0,
        maxLife: ephemeral ? 90 + Math.random() * 50 : 1e9,
        ephemeral,
      }
    },
    [isMobile],
  )

  const initializeField = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const count = isReducedMotion ? 5 : isMobile ? 9 : 16
    const bokeh: Bokeh[] = []
    for (let i = 0; i < count; i++) {
      bokeh.push(spawnBokeh(canvas))
    }
    bokehRef.current = bokeh

    // Cinematic anamorphic horizontal glints
    const glintCount = isReducedMotion ? 0 : isMobile ? 2 : 4
    const glints: Glint[] = []
    for (let i = 0; i < glintCount; i++) {
      glints.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        w: (isMobile ? 80 : 140) + Math.random() * (isMobile ? 120 : 280),
        h: 1.2 + Math.random() * 2.2,
        angle: (Math.random() - 0.5) * 0.08,
        alpha: 0.03 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.005,
      })
    }
    glintsRef.current = glints
  }, [isMobile, isReducedMotion, spawnBokeh])

  const drawBokeh = (ctx: CanvasRenderingContext2D, b: Bokeh, t: number) => {
    const pulse = 1 + Math.sin(t * b.speed * 60 + b.phase) * 0.08
    const r = b.r * pulse
    const a = b.alpha * (b.ephemeral ? Math.max(0, 1 - b.life / b.maxLife) : 0.85 + 0.15 * Math.sin(t * b.speed * 40 + b.phase))

    // Soft photographic disc: multi-stop radial, slightly brighter rim (lens bokeh)
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r)
    g.addColorStop(0, `hsla(${b.hue}, ${b.sat}%, ${Math.min(78, b.light + 18)}%, ${a * 0.55})`)
    g.addColorStop(0.35, `hsla(${b.hue}, ${b.sat}%, ${b.light}%, ${a * 0.35})`)
    g.addColorStop(0.72, `hsla(${b.hue}, ${b.sat - 8}%, ${b.light - 8}%, ${a * 0.14})`)
    g.addColorStop(0.92, `hsla(${b.hue}, ${b.sat}%, ${b.light + 10}%, ${a * 0.1})`)
    g.addColorStop(1, `hsla(${b.hue}, ${b.sat}%, ${b.light}%, 0)`)

    ctx.globalCompositeOperation = "screen"
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2)
    ctx.fill()

    // Tiny core sparkle on nearer orbs
    if (b.depth < 0.45 && !b.ephemeral) {
      const core = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r * 0.18)
      core.addColorStop(0, `hsla(${b.hue}, 40%, 90%, ${a * 0.35})`)
      core.addColorStop(1, `hsla(${b.hue}, 50%, 70%, 0)`)
      ctx.fillStyle = core
      ctx.beginPath()
      ctx.arc(b.x, b.y, r * 0.18, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawGlint = (ctx: CanvasRenderingContext2D, g: Glint, t: number) => {
    const flicker = 0.65 + 0.35 * Math.sin(t * g.speed * 50 + g.phase)
    const alpha = g.alpha * flicker
    ctx.save()
    ctx.translate(g.x, g.y)
    ctx.rotate(g.angle)
    ctx.globalCompositeOperation = "screen"

    const grad = ctx.createLinearGradient(-g.w / 2, 0, g.w / 2, 0)
    grad.addColorStop(0, "hsla(240, 80%, 70%, 0)")
    grad.addColorStop(0.35, `hsla(248, 85%, 72%, ${alpha})`)
    grad.addColorStop(0.5, `hsla(220, 60%, 88%, ${alpha * 1.4})`)
    grad.addColorStop(0.65, `hsla(262, 80%, 70%, ${alpha})`)
    grad.addColorStop(1, "hsla(240, 80%, 70%, 0)")

    ctx.fillStyle = grad
    ctx.fillRect(-g.w / 2, -g.h / 2, g.w, g.h)

    // Soft vertical bloom on the glint
    const bloom = ctx.createRadialGradient(0, 0, 0, 0, 0, g.w * 0.12)
    bloom.addColorStop(0, `hsla(230, 70%, 80%, ${alpha * 0.5})`)
    bloom.addColorStop(1, "hsla(230, 70%, 80%, 0)")
    ctx.fillStyle = bloom
    ctx.beginPath()
    ctx.arc(0, 0, g.w * 0.12, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const update = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const mouse = mouseRef.current
    const t = timeRef.current
    const maxBokeh = isMobile ? 18 : 28

    bokehRef.current = bokehRef.current.filter((b) => {
      if (b.ephemeral) {
        b.life += 1
        if (b.life >= b.maxLife) return false
      }

      // Slow drift
      b.x += b.vx
      b.y += b.vy

      // Gentle mouse parallax / attraction by depth
      if (mouse.active && !isReducedMotion) {
        const dx = mouse.x - b.x
        const dy = mouse.y - b.y
        const dist = Math.hypot(dx, dy) || 1
        const reach = 220 + b.depth * 80
        if (dist < reach) {
          const force = ((reach - dist) / reach) * 0.004 * (1 - b.depth)
          b.vx += (dx / dist) * force
          b.vy += (dy / dist) * force
        }
      }

      // Soft friction + keep alive motion
      b.vx *= 0.992
      b.vy *= 0.992
      b.vx += Math.sin(t * 0.02 + b.phase) * 0.002
      b.vy += Math.cos(t * 0.015 + b.phase * 1.3) * 0.0015

      // Wrap edges softly
      const m = b.baseR
      if (b.x < -m) b.x = canvas.width + m
      if (b.x > canvas.width + m) b.x = -m
      if (b.y < -m) b.y = canvas.height + m
      if (b.y > canvas.height + m) b.y = -m

      b.r = b.baseR
      return true
    })

    // Cap density
    if (bokehRef.current.length > maxBokeh) {
      // Prefer dropping oldest ephemeral first, then trim
      bokehRef.current.sort((a, b) => Number(b.ephemeral) - Number(a.ephemeral) || b.life - a.life)
      bokehRef.current = bokehRef.current.slice(0, maxBokeh)
    }

    glintsRef.current.forEach((g) => {
      g.x += Math.sin(t * g.speed + g.phase) * 0.15
      g.y += Math.cos(t * g.speed * 0.7 + g.phase) * 0.08
      if (g.x < -g.w) g.x = canvas.width + g.w
      if (g.x > canvas.width + g.w) g.x = -g.w
    })
  }, [isMobile, isReducedMotion])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const t = timeRef.current

    // Far bokeh first (larger, softer), then nearer
    const sorted = [...bokehRef.current].sort((a, b) => b.depth - a.depth)
    sorted.forEach((b) => drawBokeh(ctx, b, t))

    if (!isReducedMotion) {
      glintsRef.current.forEach((g) => drawGlint(ctx, g, t))
    }

    // Subtle vignette of light near cursor (like light into a lens)
    if (mouseRef.current.active && !isMobile && !isReducedMotion) {
      const { x, y } = mouseRef.current
      const lens = ctx.createRadialGradient(x, y, 0, x, y, 180)
      lens.addColorStop(0, "hsla(240, 70%, 65%, 0.06)")
      lens.addColorStop(0.5, "hsla(250, 60%, 50%, 0.02)")
      lens.addColorStop(1, "hsla(240, 60%, 40%, 0)")
      ctx.globalCompositeOperation = "screen"
      ctx.fillStyle = lens
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    ctx.globalCompositeOperation = "source-over"
    ctx.globalAlpha = 1
  }, [isMobile, isReducedMotion])

  const animate = useCallback(() => {
    timeRef.current += 1
    if (!isReducedMotion) update()
    draw()
    animationRef.current = requestAnimationFrame(animate)
  }, [update, draw, isReducedMotion])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mouseRef.current = { x, y, active: true }
      mouseX.set(x)
      mouseY.set(y)
    },
    [mouseX, mouseY],
  )

  const handleClick = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas || isReducedMotion) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const id = Date.now()
      setRipples((prev) => [...prev, { id, x, y }])
      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 900)

      // Aperture release: a few new bokeh of light expand outward
      const burst = isMobile ? 2 : 3
      for (let i = 0; i < burst; i++) {
        const angle = (i / burst) * Math.PI * 2 + Math.random() * 0.4
        const speed = 0.6 + Math.random() * 1.1
        bokehRef.current.push(
          spawnBokeh(canvas, {
            at: { x, y },
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            baseR: 20 + Math.random() * 48,
            depth: Math.random() * 0.5,
            alpha: 0.14 + Math.random() * 0.08,
            ephemeral: true,
            hue: BRAND_HUES[i % BRAND_HUES.length] + Math.random() * 12,
          }),
        )
      }

      // Permanent soft orb chance (keeps field alive without unbounded growth)
      if (bokehRef.current.filter((b) => !b.ephemeral).length < (isMobile ? 12 : 20) && Math.random() > 0.35) {
        bokehRef.current.push(
          spawnBokeh(canvas, {
            at: { x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 40 },
            baseR: 32 + Math.random() * 50,
            depth: 0.2 + Math.random() * 0.5,
            alpha: 0.07,
          }),
        )
      }
    },
    [isMobile, isReducedMotion, spawnBokeh],
  )

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    initializeField()
  }, [initializeField])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    initializeField()
    animationRef.current = requestAnimationFrame(animate)

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("click", handleClick)
    window.addEventListener("resize", handleResize)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick)
      window.removeEventListener("resize", handleResize)
    }
  }, [animate, handleMouseMove, handleClick, handleResize, initializeField])

  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      {/* Mesh field — brand ink base under the lightfield */}
      <MeshGradientComponent
        id="gradient-canvas"
        colors={["#0F1013", "#11131a", "#15182e", "#0a0b12"]}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Soft focus ring that follows the pointer (desktop) */}
      {!isMobile && !isReducedMotion && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
            width: 96,
            height: 96,
          }}
        >
          <div
            className="h-full w-full rounded-full opacity-[0.12]"
            style={{
              background:
                "radial-gradient(circle, rgba(91,89,240,0.35) 0%, rgba(50,48,224,0.12) 40%, transparent 70%)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          />
        </motion.div>
      )}

      {/* Click: aperture iris rings */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.div
            key={r.id}
            className="absolute pointer-events-none"
            style={{
              left: r.x,
              top: r.y,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ opacity: 0.55, scale: 0.15 }}
            animate={{ opacity: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative h-28 w-28 sm:h-36 sm:w-36">
              {[0.28, 0.48, 0.68, 0.88].map((s, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border border-[#5b59f0]/40"
                  style={{
                    transform: `scale(${s})`,
                    opacity: 0.9 - i * 0.18,
                    boxShadow: i === 3 ? "0 0 24px rgba(50,48,224,0.25)" : undefined,
                  }}
                />
              ))}
              <div
                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8b89ff]/70"
                style={{ boxShadow: "0 0 16px rgba(91,89,240,0.7)" }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Ambient depth wash */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0F1013]/20 via-transparent to-[#0F1013]/35" />
    </div>
  )
}

export default InteractiveBackground
export { InteractiveBackground }
