"use client"

import type { ReactNode } from "react"

interface ResponsiveContainerProps {
  children: ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  className?: string
}

export default function ResponsiveContainer({
  children,
  size = "lg",
  padding = "md",
  className = "",
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  }

  const paddingClasses = {
    none: "",
    sm: "px-4",
    md: "px-6",
    lg: "px-8",
    xl: "px-12",
  }

  return (
    <div
      className={`
        w-full
        ${sizeClasses[size]}
        mx-auto
        ${paddingClasses[padding]}
        safe-area-inset-left
        safe-area-inset-right
        ${className}
      `.trim()}
    >
      {children}
    </div>
  )
}
