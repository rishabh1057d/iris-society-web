"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { SECTIONS, type SectionId } from "@/lib/beginner/content"
import { bmEase, bmEaseOut } from "@/lib/beginner/motion"
import RisingWords from "@/components/beginner/rising-words"

type Props = {
  mode: "roll" | "hub"
  reducedMotion: boolean
  isPhone: boolean
  onRollComplete: () => void
  onSkip: () => void
  onOpenSection: (id: SectionId) => void
}

export default function TitleRollHub({
  mode,
  reducedMotion,
  isPhone,
  onRollComplete,
  onSkip,
  onOpenSection,
}: Props) {
  const [index, setIndex] = useState(0)
  const holdMs = reducedMotion ? 450 : isPhone ? 1300 : 1600

  useEffect(() => {
    if (mode !== "roll") return
    setIndex(0)
  }, [mode])

  useEffect(() => {
    if (mode !== "roll") return
    if (index >= SECTIONS.length) {
      onRollComplete()
      return
    }
    const t = window.setTimeout(() => {
      if (index >= SECTIONS.length - 1) onRollComplete()
      else setIndex((i) => i + 1)
    }, holdMs)
    return () => window.clearTimeout(t)
  }, [mode, index, holdMs, onRollComplete])

  if (mode === "hub") {
    return (
      <div
        className={cnHub(isPhone)}
      >
        <RisingWords
          as="h2"
          text="Choose your way in"
          className="bm-display-md text-white"
          delay={0.1}
          stagger={isPhone ? 0.09 : 0.07}
          rise={isPhone ? 30 : 22}
          duration={0.75}
          reducedMotion={reducedMotion}
        />

        {isPhone ? (
          <nav className="mt-10 flex flex-col gap-3" aria-label="Beginner sections">
            {SECTIONS.map((s, i) => (
              <motion.button
                key={s.id}
                type="button"
                onClick={() => onOpenSection(s.id)}
                initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.75,
                  ease: bmEaseOut,
                  delay: 0.55 + i * 0.1,
                }}
                className="group flex min-h-[112px] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-2.5 pr-4 text-left transition hover:border-[#a8a6ff]/30 hover:bg-[#3230e0]/10 active:scale-[0.99]"
              >
                <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white/5">
                  <Image src={s.image} alt="" fill sizes="80px" className="object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-xs tabular-nums text-[#8b89ff]">0{i + 1}</span>
                  <span>
                    <span className="mt-1 block font-[family-name:var(--font-bm-display)] text-[1.4rem] font-semibold leading-none text-white">{s.label}</span>
                    <span className="mt-1 block text-xs leading-4 text-slate-400">{s.blurb}</span>
                  </span>
                </span>
                <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
              </motion.button>
            ))}
          </nav>
        ) : (
          <nav
            className="mt-14 grid grid-cols-3 gap-4"
            aria-label="Beginner sections"
          >
            {SECTIONS.map((s, i) => (
              <motion.button
                key={s.id}
                type="button"
                onClick={() => onOpenSection(s.id)}
                initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.75,
                  ease: bmEaseOut,
                  delay: 0.5 + i * 0.09,
                }}
                className="group flex min-h-[300px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] text-left transition hover:-translate-y-1 hover:border-[#a8a6ff]/30 hover:bg-[#3230e0]/10"
              >
                <span className="relative block h-36 w-full overflow-hidden bg-white/5">
                  <Image src={s.image} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0F1013]/75 to-transparent" />
                </span>
                <span className="flex flex-1 flex-col p-6">
                  <span className="text-xs tabular-nums text-[#aaa8ff]">0{i + 1}</span>
                  <span className="mt-auto block font-[family-name:var(--font-bm-display)] text-[2.1rem] font-semibold leading-none text-white transition group-hover:text-[#c8c7ff]">{s.label}</span>
                  <span className="mt-3 block text-sm leading-6 text-slate-400">{s.blurb}</span>
                </span>
              </motion.button>
            ))}
          </nav>
        )}
      </div>
    )
  }

  const current = SECTIONS[Math.min(index, SECTIONS.length - 1)]

  return (
    <div className="relative flex h-full flex-1 flex-col items-center justify-center px-6">
      <div className="relative flex min-h-[7rem] w-full max-w-2xl items-center justify-center md:min-h-[9rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            className="absolute inset-x-0"
            initial={{ opacity: 0, y: isPhone ? 40 : 32, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: isPhone ? -28 : -22, filter: "blur(8px)" }}
            transition={{ duration: reducedMotion ? 0.25 : 0.8, ease: bmEase }}
          >
            <RisingWords
              as="h2"
              text={current.label}
              className="bm-display-lg text-center text-white"
              delay={0.05}
              stagger={isPhone ? 0.14 : 0.11}
              rise={isPhone ? 40 : 28}
              duration={isPhone ? 0.9 : 0.8}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-12 flex gap-2" aria-hidden>
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.id}
            className="h-[2px] rounded-full bg-white/20"
            animate={{
              width: i === index ? 28 : 10,
              backgroundColor:
                i === index
                  ? "rgba(168,166,255,0.9)"
                  : i < index
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.15)",
            }}
            transition={{ duration: 0.45, ease: bmEase }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="bm-safe-bottom absolute bottom-8 rounded-full px-4 py-2 text-sm text-slate-600 transition hover:text-white"
      >
        Skip
      </button>
    </div>
  )
}

function cnHub(isPhone: boolean) {
  return isPhone
    ? "mx-auto flex h-full w-full max-w-lg flex-col px-5 pb-10 pt-2"
    : "mx-auto flex h-full w-full max-w-5xl flex-col justify-center px-10 pb-12"
}
