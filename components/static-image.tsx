"use client"

import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

type StaticImageProps = {
  src: string
  alt: string
  className?: string
  /** Absolute fill inside a `relative` parent (like next/image fill) */
  fill?: boolean
  width?: number
  height?: number
  /** Eager only for above-the-fold heroes; default lazy */
  priority?: boolean
  sizes?: string
  style?: CSSProperties
  onLoad?: () => void
  onError?: () => void
}

/**
 * Native img that never hits Vercel/Next `/_next/image`.
 * Use on image-heavy pages when the Image Optimization quota is exhausted.
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
}: StaticImageProps) {
  const loading = priority ? "eager" : "lazy"
  const fetchPriority = priority ? "high" : "auto"

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        onLoad={onLoad}
        onError={onError}
        className={cn("absolute inset-0 h-full w-full", className)}
        style={style}
      />
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onLoad={onLoad}
      onError={onError}
      className={className}
      style={style}
    />
  )
}
