"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import gsap from "gsap"

export interface CardItem {
  imgUrl: string
  alt?: string
  linkUrl?: string
  /** Optional click handler (e.g. open lightbox). Used when linkUrl is not set. */
  onClick?: () => void
}

export type FanLayout = "desktop" | "mobile"

interface SocialCardsProps {
  cards: CardItem[]
  className?: string
  /**
   * desktop — wide 7-card fan (lg+)
   * mobile  — tighter 5-card fan tuned for phone/tablet widths
   */
  layout?: FanLayout
}

const DESKTOP = {
  maxVisible: 7,
  half: 3,
  positions: [
    { rot: -21, scale: 0.7756, x: -30, y: 7.3, zIndex: 1 },
    { rot: -14, scale: 0.8498, x: -22, y: 4.0, zIndex: 2 },
    { rot: -7, scale: 0.9346, x: -11, y: 1.3, zIndex: 3 },
    { rot: 0, scale: 1.0, x: 0, y: 0.0, zIndex: 10 },
    { rot: 7, scale: 0.9346, x: 11, y: 1.3, zIndex: 3 },
    { rot: 14, scale: 0.8498, x: 22, y: 4.0, zIndex: 2 },
    { rot: 21, scale: 0.7756, x: 30, y: 7.3, zIndex: 1 },
  ],
  enterX: 40,
} as const

/**
 * Phone/tablet: 5 cards, tight horizontal spread so nothing paints
 * outside the viewport (prevents mobile browser zoom / hamburger loss).
 */
const MOBILE = {
  maxVisible: 5,
  half: 2,
  positions: [
    { rot: -9, scale: 0.88, x: -5.2, y: 2.0, zIndex: 1 },
    { rot: -4.5, scale: 0.94, x: -2.6, y: 0.7, zIndex: 3 },
    { rot: 0, scale: 1.0, x: 0, y: 0.0, zIndex: 10 },
    { rot: 4.5, scale: 0.94, x: 2.6, y: 0.7, zIndex: 3 },
    { rot: 9, scale: 0.88, x: 5.2, y: 2.0, zIndex: 1 },
  ],
  enterX: 10,
} as const

function getSpreadMultiplier(layout: FanLayout, width: number) {
  if (layout === "mobile") {
    // Keep fan well inside the clipped shell
    if (width < 360) return 0.78
    if (width < 400) return 0.85
    if (width < 480) return 0.9
    if (width < 640) return 0.95
    return 1.0
  }
  if (width < 480) return 0.28
  if (width < 640) return 0.38
  if (width < 768) return 0.5
  if (width < 1024) return 0.75
  return 1.0
}

function getHeightMultiplier(layout: FanLayout, width: number) {
  let idealPx: number
  if (layout === "mobile") {
    idealPx = Math.min(window.innerHeight * 0.4, width < 400 ? 280 : 320)
    const available = window.innerHeight * 0.45
    if (available >= idealPx) return 1
    return Math.max(0.7, available / idealPx)
  }
  if (width < 480) idealPx = 22 * 16
  else if (width < 640) idealPx = 26 * 16
  else if (width < 768) idealPx = 28 * 16
  else if (width < 1024) idealPx = 34 * 16
  else idealPx = 38 * 16

  const available = window.innerHeight * 0.7
  if (available >= idealPx) return 1
  return available / idealPx
}

function getSlotConfig(
  layout: FanLayout,
  totalCards: number,
  slot: number,
  maxVisible: number,
  positions: readonly { rot: number; scale: number; x: number; y: number; zIndex: number }[]
) {
  if (totalCards >= maxVisible) return positions[slot]
  const center = totalCards >> 1
  const distance = totalCards > 1 ? (slot - center) / center : 0
  const absDistance = Math.abs(distance)
  const maxRot = layout === "mobile" ? 9 : 21
  const maxX = layout === "mobile" ? 5.2 : 30
  const maxY = layout === "mobile" ? 2.0 : 7.3
  return {
    rot: distance * maxRot,
    scale: 1.0 - (layout === "mobile" ? 0.12 : 0.2244) * absDistance * absDistance,
    x: distance * maxX,
    y: absDistance * absDistance * maxY,
    zIndex: 10 - Math.abs(slot - center),
  }
}

const ARROW_CLASSES =
  "relative flex items-center justify-center rounded-full border-[1.5px] border-white/15 bg-white/5 backdrop-blur-[16px] text-white/60 cursor-pointer shrink-0 z-30 outline-none shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-white/30 hover:text-white/90 active:opacity-70 transition-colors duration-300 before:content-[''] before:absolute before:inset-[3px] before:rounded-full before:border before:border-white/[0.06] before:pointer-events-none min-h-[44px] min-w-[44px]"

export default function SocialCards({
  cards,
  className = "",
  layout = "desktop",
}: SocialCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isAnimating = useRef(false)
  const hasEntered = useRef(false)
  const directionRef = useRef<"left" | "right" | null>(null)
  const prevVisible = useRef<Set<number>>(new Set())
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const cfg = layout === "mobile" ? MOBILE : DESKTOP
  const maxVisible = cfg.maxVisible
  const half = cfg.half
  const positions = cfg.positions
  const enterXBase = cfg.enterX

  const totalCards = cards.length
  const needsPagination = totalCards > maxVisible
  const [centerIndex, setCenterIndex] = useState(needsPagination ? half : totalCards >> 1)

  // Reset entry animation when layout switches
  useEffect(() => {
    hasEntered.current = false
    prevVisible.current = new Set()
    setCenterIndex(totalCards > maxVisible ? half : totalCards >> 1)
  }, [layout, totalCards, maxVisible, half])

  const getVisibleMap = useCallback(
    (center: number) => {
      const map = new Map<number, number>()
      if (!needsPagination) {
        cards.forEach((_, i) => map.set(i, i))
        return map
      }
      for (let slot = 0; slot < maxVisible; slot++) {
        map.set(((center + slot - half) % totalCards + totalCards) % totalCards, slot)
      }
      return map
    },
    [totalCards, needsPagination, cards, maxVisible, half]
  )

  const cycle = useCallback(
    (direction: "left" | "right") => {
      if (isAnimating.current || !needsPagination) return
      isAnimating.current = true
      directionRef.current = direction
      setCenterIndex((prev) =>
        direction === "right" ? (prev + 1) % totalCards : (prev - 1 + totalCards) % totalCards
      )
    },
    [totalCards, needsPagination]
  )

  useEffect(() => {
    const container = containerRef.current
    if (!container || !totalCards) return

    const cardElements = Array.from(container.querySelectorAll<HTMLElement>(".fan-card"))
    if (!cardElements.length) return

    const visibleMap = getVisibleMap(centerIndex)
    const previouslyVisible = prevVisible.current
    const direction = directionRef.current
    const isFirstMount = !hasEntered.current
    const multiplier = getSpreadMultiplier(layout, window.innerWidth)
    const hMult = getHeightMultiplier(layout, window.innerWidth)
    const slotCount = needsPagination ? maxVisible : totalCards
    const config = (slot: number) =>
      getSlotConfig(layout, slotCount, slot, maxVisible, positions)

    if (isFirstMount) isAnimating.current = true

    let completedCount = 0
    const visibleCount = visibleMap.size
    const onCardDone = () => {
      if (++completedCount >= visibleCount) {
        isAnimating.current = false
        if (isFirstMount) hasEntered.current = true
      }
    }

    const enterX = enterXBase * (layout === "mobile" ? 1 : 1)

    cardElements.forEach((card, cardIndex) => {
      const slot = visibleMap.get(cardIndex)
      const wasVisible = previouslyVisible.has(cardIndex)

      if (slot !== undefined) {
        const { x, y, rot, scale, zIndex } = config(slot)
        const target = {
          x: `${x * multiplier}rem`,
          y: `${y * hMult}rem`,
          rotation: rot,
          scale,
          opacity: 1,
          zIndex,
        }

        if (isFirstMount) {
          gsap.set(card, {
            x: 0,
            y: `${(layout === "mobile" ? 8 : 12) * hMult}rem`,
            rotation: 0,
            scale: 0.55,
            opacity: 0,
          })
          gsap.to(card, {
            ...target,
            duration: layout === "mobile" ? 0.85 : 1.2,
            ease: layout === "mobile" ? "power3.out" : "elastic.out(1.05,.78)",
            delay: 0.12 + slot * 0.05,
            onComplete: onCardDone,
          })
        } else if (!wasVisible) {
          const ex = direction === "right" ? enterX : -enterX
          gsap.set(card, {
            x: `${ex}rem`,
            y: `${y * hMult}rem`,
            rotation: direction === "right" ? 22 : -22,
            scale: 0.55,
            opacity: 0,
          })
          gsap.to(card, {
            ...target,
            duration: 0.5,
            ease: "power2.out",
            onComplete: onCardDone,
          })
        } else {
          gsap.to(card, {
            ...target,
            duration: 0.45,
            ease: "power2.out",
            onComplete: onCardDone,
          })
        }
      } else if (wasVisible) {
        const exitX = direction === "right" ? -enterX : enterX
        gsap.to(card, {
          x: `${exitX}rem`,
          opacity: 0,
          scale: 0.55,
          rotation: direction === "right" ? -22 : 22,
          duration: 0.35,
          ease: "power2.in",
          zIndex: 0,
        })
      } else if (isFirstMount) {
        gsap.set(card, { opacity: 0, scale: 0.3, x: 0, y: 0, zIndex: 0 })
      }
    })

    prevVisible.current = new Set(visibleMap.keys())

    // Desktop hover fan expand — skip on mobile (touch)
    if (layout === "mobile") {
      const onResize = () => {
        if (isAnimating.current) return
        const mult = getSpreadMultiplier(layout, window.innerWidth)
        const hM = getHeightMultiplier(layout, window.innerWidth)
        cardElements.forEach((el, i) => {
          const slot = visibleMap.get(i)
          if (slot === undefined) return
          const base = config(slot)
          gsap.to(el, {
            x: `${base.x * mult}rem`,
            y: `${base.y * hM}rem`,
            rotation: base.rot,
            scale: base.scale,
            duration: 0.3,
            overwrite: "auto",
          })
          gsap.set(el, { zIndex: base.zIndex })
        })
      }
      window.addEventListener("resize", onResize)
      return () => window.removeEventListener("resize", onResize)
    }

    const visibleEntries: { el: HTMLElement; slot: number }[] = []
    cardElements.forEach((el, i) => {
      const slot = visibleMap.get(i)
      if (slot !== undefined) visibleEntries.push({ el, slot })
    })
    visibleEntries.sort((a, b) => a.slot - b.slot)

    let activeSlot: number | null = null
    let leaveTimer: ReturnType<typeof setTimeout> | null = null
    const centerSlot = visibleEntries.length >> 1

    const updateHoverLayout = (hoveredSlot: number | null) => {
      const mult = getSpreadMultiplier(layout, window.innerWidth)
      const hM = getHeightMultiplier(layout, window.innerWidth)

      visibleEntries.forEach(({ el, slot }) => {
        const base = config(slot)
        let targetX = base.x * mult
        let targetY = base.y * hM
        let targetRot = base.rot
        let targetScale = base.scale
        let delay = 0

        if (hoveredSlot !== null) {
          const distance = Math.abs(slot - hoveredSlot)
          delay = distance * 0.02

          if (slot === hoveredSlot) {
            targetY -= 2.5 * hM
            targetScale *= 1.08
          } else {
            const normalized = centerSlot > 0 ? (slot - centerSlot) / centerSlot : 0
            const pushStrength =
              8 * (1 - Math.abs(normalized)) * (1 + 0.2 * Math.max(0, 3 - distance))

            if (slot < hoveredSlot) {
              targetX -= pushStrength * mult
              targetRot -= 3 / (distance + 1)
            } else {
              targetX += pushStrength * mult
              targetRot += 3 / (distance + 1)
            }

            if (slot === visibleEntries.length - 1 && hoveredSlot < centerSlot) targetY -= 1 * hM
            if (slot === 0 && hoveredSlot > centerSlot) targetY -= 1 * hM
          }
        } else {
          delay = Math.abs(slot - centerSlot) * 0.02
        }

        gsap.to(el, {
          x: `${targetX}rem`,
          y: `${targetY}rem`,
          rotation: targetRot,
          scale: targetScale,
          duration: 0.5,
          delay,
          ease: "elastic.out(1,.75)",
          overwrite: "auto",
        })
        gsap.set(el, { zIndex: base.zIndex })
      })
    }

    const enterHandlers = visibleEntries.map(({ el, slot }) => {
      const handler = () => {
        if (isAnimating.current) return
        if (leaveTimer) {
          clearTimeout(leaveTimer)
          leaveTimer = null
        }
        if (activeSlot !== slot) {
          activeSlot = slot
          updateHoverLayout(slot)
        }
      }
      el.addEventListener("mouseenter", handler)
      return { el, handler }
    })

    const onMouseLeave = () => {
      if (isAnimating.current) return
      if (leaveTimer) clearTimeout(leaveTimer)
      leaveTimer = setTimeout(() => {
        activeSlot = null
        updateHoverLayout(null)
      }, 50)
    }
    container.addEventListener("mouseleave", onMouseLeave)

    const onResize = () => {
      if (!isAnimating.current) updateHoverLayout(activeSlot)
    }
    window.addEventListener("resize", onResize)

    return () => {
      enterHandlers.forEach(({ el, handler }) => el.removeEventListener("mouseenter", handler))
      container.removeEventListener("mouseleave", onMouseLeave)
      window.removeEventListener("resize", onResize)
      if (leaveTimer) clearTimeout(leaveTimer)
    }
  }, [
    centerIndex,
    totalCards,
    getVisibleMap,
    needsPagination,
    layout,
    maxVisible,
    positions,
    enterXBase,
  ])

  // Keyboard
  useEffect(() => {
    if (!needsPagination) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") cycle("left")
      if (e.key === "ArrowRight") cycle("right")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [cycle, needsPagination])

  // Touch swipe (mobile-first, works everywhere)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!needsPagination) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Horizontal swipe only
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.2) return
    cycle(dx < 0 ? "right" : "left")
  }

  if (!totalCards) return null

  const chevron = (direction: "left" | "right") => (
    <svg
      className="relative z-[2] w-4 h-4 md:w-5 md:h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points={direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
    </svg>
  )

  // Compact progress for many photos (especially mobile)
  const useCounter = layout === "mobile" || totalCards > 12

  const layoutClass = layout === "mobile" ? "fan-layout fan-layout--mobile" : "fan-layout"
  const cardExtra = layout === "mobile" ? " fan-card--mobile" : ""

  return (
    <section
      className={`fan-carousel-shell flex flex-col items-center w-full max-w-full py-1 sm:py-3 lg:py-6 px-0 sm:px-2 md:px-6 ${className}`}
    >
      <div className="flex items-center justify-center w-full max-w-full overflow-hidden">
        <div
          ref={containerRef}
          className={`${layoutClass} flex relative justify-center items-center w-full max-w-full touch-pan-y`}
          role="list"
          aria-label="Photo carousel"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          {cards.map((card, index) => {
            const image = (
              <div className="relative w-full h-full overflow-hidden bg-slate-950">
                <div
                  className="absolute inset-0 z-0 opacity-45"
                  style={{
                    backgroundImage: `url(${card.imgUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(24px) saturate(1.1)",
                    transform: "scale(1.12)",
                  }}
                  aria-hidden
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.imgUrl}
                  loading={index < maxVisible ? "eager" : "lazy"}
                  alt={card.alt || `Card ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-contain z-10"
                  draggable={false}
                />
              </div>
            )

            const baseClass = `fan-card${cardExtra} block select-none rounded-2xl overflow-hidden border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] bg-slate-900/80`

            if (card.linkUrl) {
              return (
                <a
                  key={index}
                  href={card.linkUrl}
                  target={card.linkUrl.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className={`${baseClass} cursor-pointer`}
                  role="listitem"
                >
                  {image}
                </a>
              )
            }

            if (card.onClick) {
              return (
                <button
                  key={index}
                  type="button"
                  onClick={card.onClick}
                  className={`${baseClass} cursor-pointer p-0 text-left`}
                  role="listitem"
                  aria-label={card.alt || `Open photo ${index + 1}`}
                >
                  {image}
                </button>
              )
            }

            return (
              <div key={index} className={baseClass} role="listitem">
                {image}
              </div>
            )
          })}
        </div>
      </div>

      {needsPagination && (
        <div
          className={`flex items-center justify-center gap-3 sm:gap-4 z-30 ${
            layout === "mobile" ? "mt-2 sm:mt-3" : "mt-4 md:mt-6"
          }`}
        >
          <button
            type="button"
            className={`${ARROW_CLASSES} w-11 h-11 md:w-12 md:h-12`}
            onClick={() => cycle("left")}
            aria-label="Previous"
          >
            {chevron("left")}
          </button>

          {useCounter ? (
            <p className="text-sm text-white/70 tabular-nums min-w-[4.5rem] text-center m-0">
              <span className="text-white font-medium">{centerIndex + 1}</span>
              <span className="text-white/40"> / {totalCards}</span>
            </p>
          ) : (
            <div className="flex items-center gap-1.5 max-w-[12rem] sm:max-w-none overflow-hidden">
              {cards.map((_, i) => (
                <span
                  key={i}
                  className={`shrink-0 rounded-full transition-all duration-300 ${
                    i === centerIndex
                      ? "w-2 h-2 bg-white/80 scale-[1.25]"
                      : "w-1.5 h-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            className={`${ARROW_CLASSES} w-11 h-11 md:w-12 md:h-12`}
            onClick={() => cycle("right")}
            aria-label="Next"
          >
            {chevron("right")}
          </button>
        </div>
      )}
    </section>
  )
}

export { SocialCards }
