"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
}

interface ClickEffect {
  id: number
  x: number
  y: number
  timestamp: number
}

function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([])
  const [isReducedMotion, setIsReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Motion values for smooth mouse following
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 150, damping: 25 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 25 })

  // Check for reduced motion and device capabilities
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mediaQuery.matches)
    setIsMobile(window.innerWidth < 768 || navigator.hardwareConcurrency <= 4)

    const handleMediaChange = () => setIsReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleMediaChange)

    return () => mediaQuery.removeEventListener("change", handleMediaChange)
  }, [])

  // Initialize particles
  const initializeParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const particleCount = isMobile ? 8 : isReducedMotion ? 6 : 15
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: `hsl(${200 + Math.random() * 60}, 70%, 60%)`,
        life: Math.random() * 1000,
        maxLife: 1000 + Math.random() * 2000,
      })
    }

    particlesRef.current = particles
  }, [isMobile, isReducedMotion])

  // Update particles
  const updateParticles = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const mouse = mouseRef.current
    const particles = particlesRef.current

    particles.forEach((particle) => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Mouse interaction
      const dx = mouse.x - particle.x
      const dy = mouse.y - particle.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 100) {
        const force = (100 - distance) / 100
        particle.vx += (dx / distance) * force * 0.01
        particle.vy += (dy / distance) * force * 0.01
      }

      // Apply friction
      particle.vx *= 0.99
      particle.vy *= 0.99

      // Boundary collision
      if (particle.x < 0 || particle.x > canvas.width) {
        particle.vx *= -0.8
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
      }
      if (particle.y < 0 || particle.y > canvas.height) {
        particle.vy *= -0.8
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))
      }

      // Update life
      particle.life += 1
      if (particle.life > particle.maxLife) {
        particle.life = 0
        particle.x = Math.random() * canvas.width
        particle.y = Math.random() * canvas.height
        particle.vx = (Math.random() - 0.5) * 0.5
        particle.vy = (Math.random() - 0.5) * 0.5
      }

      // Update opacity based on life
      const lifeRatio = particle.life / particle.maxLife
      particle.opacity = 0.1 + 0.4 * Math.sin(lifeRatio * Math.PI)
    })
  }, [])

  // Draw particles and connections
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const particles = particlesRef.current

    // Draw connections
    if (!isReducedMotion) {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.1)"
      ctx.lineWidth = 1

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 70) {
            const opacity = ((70 - distance) / 70) * 0.15
            ctx.globalAlpha = opacity
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
    }

    // Draw particles
    particles.forEach((particle) => {
      ctx.globalAlpha = particle.opacity
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fill()

      // Add glow effect
      if (!isMobile) {
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    })

    ctx.globalAlpha = 1
  }, [isReducedMotion, isMobile])

  // Animation loop
  const animate = useCallback(() => {
    if (!isReducedMotion) {
      updateParticles()
    }
    draw()
    animationRef.current = requestAnimationFrame(animate)
  }, [updateParticles, draw, isReducedMotion])

  // Handle mouse movement
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      mouseRef.current = { x, y }
      mouseX.set(x)
      mouseY.set(y)
    },
    [mouseX, mouseY],
  )

  // Handle clicks
  const handleClick = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Add click effect
    const newEffect: ClickEffect = {
      id: Date.now(),
      x,
      y,
      timestamp: Date.now(),
    }

    setClickEffects((prev) => [...prev, newEffect])

    // Create particle burst
    const burstParticles = 3
    for (let i = 0; i < burstParticles; i++) {
      const angle = (i / burstParticles) * Math.PI * 2
      const speed = 2 + Math.random() * 3
      particlesRef.current.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        opacity: 0.8,
        color: `hsl(${240 + Math.random() * 60}, 80%, 70%)`,
        life: 0,
        maxLife: 60,
      })
    }

    // Remove effect after animation
    setTimeout(() => {
      setClickEffects((prev) => prev.filter((effect) => effect.id !== newEffect.id))
    }, 1000)
  }, [])

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    initializeParticles()
  }, [initializeParticles])

  // Setup canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Initialize
    initializeParticles()

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    // Event listeners
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    window.addEventListener("click", handleClick)
    window.addEventListener("resize", handleResize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("click", handleClick)
      window.removeEventListener("resize", handleResize)
    }
  }, [animate, handleMouseMove, handleClick, handleResize, initializeParticles])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Canvas for particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ mixBlendMode: "screen" }} />

      {/* Mouse follower */}
      {!isMobile && !isReducedMotion && (
        <motion.div
          className="absolute w-8 h-8 pointer-events-none"
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
          }}
        >
          <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-20 blur-sm" />
        </motion.div>
      )}

      {/* Click effects */}
      <AnimatePresence>
        {clickEffects.map((effect) => (
          <motion.div
            key={effect.id}
            className="absolute pointer-events-none"
            style={{
              left: effect.x,
              top: effect.y,
              translateX: "-50%",
              translateY: "-50%",
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ scale: 4, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="w-4 h-4 rounded-full border-2 border-blue-400" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Floating orbs */}
      {!isReducedMotion && (
        <div className="absolute inset-0">
          {[...Array(isMobile ? 2 : 4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 rounded-full opacity-10"
              style={{
                background: `radial-gradient(circle, ${
                  i % 2 === 0 ? "rgba(59, 130, 246, 0.3)" : "rgba(139, 92, 246, 0.3)"
                } 0%, transparent 70%)`,
                left: `${20 + i * 20}%`,
                top: `${30 + i * 15}%`,
              }}
              animate={{
                x: [0, 30, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-900/5 to-purple-900/10 pointer-events-none" />
    </div>
  )
}

export default InteractiveBackground
export { InteractiveBackground }
