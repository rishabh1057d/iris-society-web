"use client"

import { motion } from "framer-motion"
import { bmEaseOut } from "@/lib/beginner/motion"
import { cn } from "@/lib/utils"

type Props = {
  text: string
  className?: string
  /** Delay before first word */
  delay?: number
  /** Stagger between words (s) */
  stagger?: number
  /** How far words rise from (px) - phone wants more */
  rise?: number
  /** Per-word duration */
  duration?: number
  reducedMotion?: boolean
  as?: "h1" | "h2" | "p" | "span"
}

/**
 * Swish-flow reveal: each word rises and clears blur one after another.
 */
export default function RisingWords({
  text,
  className,
  delay = 0,
  stagger = 0.12,
  rise = 36,
  duration = 0.85,
  reducedMotion = false,
  as: Tag = "p",
}: Props) {
  const words = text.trim().split(/\s+/)

  if (reducedMotion) {
    return <Tag className={className}>{text}</Tag>
  }

  return (
    <Tag
      className={cn(
        "flex flex-wrap gap-x-[0.28em] gap-y-[0.12em]",
        !className?.includes("justify-") && "justify-center",
        className,
      )}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em]">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: rise, opacity: 0, filter: "blur(10px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration,
              ease: bmEaseOut,
              delay: delay + i * stagger,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
