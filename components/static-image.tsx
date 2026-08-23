"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { cn } from "@/lib/utils"

type StaticImageProps = {
  src: string
  alt: string
  className?: string
  /** Absolute fill inside a `relative` parent (like next/image fill) */
  fill?: boolean
  width?: number
  height?: number
  /** Eager only for above-the-fold heroes; default deferred until near viewport */
  priority?: boolean
  sizes?: string
  style?: CSSProperties
  onLoad?: () => void
  onError?: () => void
  /**
   * How early to start loading relative to the viewport.
   * Keep modest on image-heavy pages so we do not stampede huge assets.
   */
  rootMargin?: string
}

/**
 * Native img that never hits Vercel/Next `/_next/image`.
 * Defers setting `src` until near the viewport (true progressive load),
 * which works reliably even when parent panels use overflow:hidden /
 * height animations that defeat native `loading="lazy"`.
 */
export default function StaticImage({
  src,
  alt,
  className,
  fill = false,
  width,
  height,
  priority = false,
  style,
  onLoad,
  onError,
  rootMargin = "180px 0px",
}: StaticImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [activeSrc, setActiveSrc] = useState<string | undefined>(
    priority ? src : undefined
  )
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
    if (priority) {
      setActiveSrc(src)
      return
    }

    setActiveSrc(undefined)
    const node = imgRef.current
    if (!node) return

    if (typeof IntersectionObserver === "undefined") {
      setActiveSrc(src)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActiveSrc(src)
          io.disconnect()
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [src, priority, rootMargin])

  const handleError = () => {
    setFailed(true)
    onError?.()
  }

  const shared = {
    ref: imgRef,
    alt,
    onLoad,
    onError: handleError,
    decoding: "async" as const,
    // Native lazy as a backup once src is set; priority stays eager.
    loading: (priority ? "eager" : "lazy") as "eager" | "lazy",
    fetchPriority: (priority ? "high" : "low") as "high" | "low" | "auto",
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...shared}
        src={failed ? "/placeholder.svg" : activeSrc}
        className={cn(
          "absolute inset-0 h-full w-full bg-slate-900/40",
          !activeSrc && !failed && "animate-pulse",
          className
        )}
        style={style}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...shared}
      src={failed ? "/placeholder.svg" : activeSrc}
      width={width}
      height={height}
      className={cn(!activeSrc && !failed && "animate-pulse bg-slate-900/40", className)}
      style={style}
    />
  )
}
