"use client"

import React, { useMemo } from "react"

export default function SymphonyOverlay() {
  const ribbons = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
    const count = isMobile ? 4 : 8
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      scale: 0.6 + Math.random() * 1.2,
      duration: 8 + Math.random() * 8,
      rotate: (Math.random() - 0.5) * 30,
    }))
  }, [])

  const sparkles = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
    const count = isMobile ? 12 : 28
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      size: 2 + Math.random() * 6,
      dur: 3 + Math.random() * 4,
    }))
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden symphony-overlay">
      {ribbons.map((r) => (
        <div
          key={r.id}
          className="symph-ribbon"
          style={{ left: `${r.left}%`, top: `${r.top}%`, animationDelay: `${r.delay}s`, transform: `scale(${r.scale}) rotate(${r.rotate}deg)`, '--dur': `${r.duration}s` } as React.CSSProperties}
        />
      ))}

      {sparkles.map((s) => (
        <div
          key={s.id}
          className="symph-spark"
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, width: `${s.size}px`, height: `${s.size}px`, '--dur': `${s.dur}s` } as React.CSSProperties}
        />
      ))}

      <style jsx>{`
        .symphony-overlay { --pink: #f56483; --purple: #703c84; --soft1: #fcc4b7; --soft2: #ebdbe6; }

        .symph-ribbon {
          position: absolute;
          width: 28vw;
          height: 10vh;
          max-width: 680px;
          max-height: 220px;
          border-radius: 999px;
          background: linear-gradient(120deg, var(--pink), var(--purple));
          opacity: 0.18;
          filter: blur(16px) saturate(1.1);
          transform-origin: center;
          animation: ribbonFlow var(--dur) linear infinite;
          mix-blend-mode: screen;
        }

        .symph-spark {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0.2));
          box-shadow: 0 6px 18px rgba(117, 47, 82, 0.14);
          opacity: 0.9;
          transform: translateY(0) scale(0.9);
          animation: sparkleFloat var(--dur) ease-in-out infinite;
          mix-blend-mode: screen;
        }

        @keyframes ribbonFlow {
          0% { transform: translateX(-30vw) translateY(0) scale(0.95) rotate(-6deg); opacity: 0; }
          10% { opacity: 0.45 }
          50% { transform: translateX(30vw) translateY(-8vh) scale(1.05) rotate(6deg); opacity: 0.25 }
          90% { opacity: 0.45 }
          100% { transform: translateX(80vw) translateY(0) scale(0.9) rotate(-6deg); opacity: 0 }
        }

        @keyframes sparkleFloat {
          0% { transform: translateY(0) scale(0.6); opacity: 0 }
          10% { opacity: 1 }
          50% { transform: translateY(-18px) scale(1); opacity: 0.9 }
          100% { transform: translateY(-36px) scale(0.9); opacity: 0 }
        }

        /* Mobile tuning */
        @media (max-width: 640px) {
          .symph-ribbon { width: 56vw; height: 12vh; opacity: 0.16; filter: blur(10px); }
          .symph-spark { opacity: 0.8 }
        }
      `}</style>
    </div>
  )
}
