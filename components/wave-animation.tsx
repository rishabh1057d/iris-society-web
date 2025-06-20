"use client"

import { useEffect, useRef, useState } from "react"

export default function WaveAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setIsReducedMotion(mediaQuery.matches)

    const handleMediaChange = () => setIsReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleMediaChange)

    return () => mediaQuery.removeEventListener("change", handleMediaChange)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const animate = () => {
      if (isReducedMotion) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create multiple wave layers
      const waves = [
        { amplitude: 20, frequency: 0.01, speed: 0.02, opacity: 0.1, color: "59, 130, 246" },
        { amplitude: 15, frequency: 0.015, speed: 0.025, opacity: 0.08, color: "139, 92, 246" },
        { amplitude: 25, frequency: 0.008, speed: 0.015, opacity: 0.06, color: "99, 102, 241" },
      ]

      waves.forEach((wave, index) => {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height)

        for (let x = 0; x <= canvas.width; x += 2) {
          const y =
            canvas.height -
            100 -
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude -
            Math.sin(x * wave.frequency * 2 + time * wave.speed * 1.5) * (wave.amplitude * 0.5)

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.lineTo(canvas.width, canvas.height)
        ctx.lineTo(0, canvas.height)
        ctx.closePath()

        const gradient = ctx.createLinearGradient(0, canvas.height - 200, 0, canvas.height)
        gradient.addColorStop(0, `rgba(${wave.color}, ${wave.opacity})`)
        gradient.addColorStop(1, `rgba(${wave.color}, ${wave.opacity * 0.3})`)

        ctx.fillStyle = gradient
        ctx.fill()
      })

      time += 1
      animationRef.current = requestAnimationFrame(animate)
    }

    resize()
    animate()

    window.addEventListener("resize", resize)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", resize)
    }
  }, [isReducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="absolute bottom-0 left-0 w-full h-full pointer-events-none opacity-60"
      style={{ mixBlendMode: "multiply" }}
    />
  )
}
