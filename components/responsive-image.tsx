"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  aspectRatio?: "16/9" | "4/3" | "1/1" | "auto"
  loading?: "lazy" | "eager"
  quality?: number
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  isTeamMember?: boolean
}

export default function ResponsiveImage({
  src,
  alt,
  width = 800,
  height = 600,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  aspectRatio = "auto",
  loading = "lazy",
  quality = 85,
  placeholder = "empty",
  blurDataURL,
  objectFit = "cover",
  isTeamMember = false,
}: ResponsiveImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const aspectRatioClass = {
    "16/9": "aspect-ratio-16-9",
    "4/3": "aspect-ratio-4-3",
    "1/1": "aspect-ratio-1-1",
    auto: "",
  }[aspectRatio]

  // Use contain for team members to preserve full image visibility
  const finalObjectFit = isTeamMember ? "contain" : objectFit

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div className={`bg-gray-800 rounded-lg flex items-center justify-center ${aspectRatioClass} ${className}`}>
        <div className="text-center p-4">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-400">Image failed to load</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${aspectRatioClass} ${className} ${isTeamMember ? "bg-gray-900" : ""}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
          <div className="loading-skeleton w-full h-full rounded-lg" />
        </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full"
      >
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          {...(!priority ? { loading } : {})}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full image-responsive`}
          style={{ objectFit: finalObjectFit }}
        />
      </motion.div>
    </div>
  )
}
