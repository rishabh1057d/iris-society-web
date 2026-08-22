"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Construction } from "lucide-react"
import { bmEaseOut } from "@/lib/beginner/motion"
import BeginnerField from "@/components/beginner/beginner-field"
import RisingWords from "@/components/beginner/rising-words"
import "@/components/beginner/beginner.css"

/**
 * Public gate while Beginner Mode is still in progress.
 * Keeps /beginner linkable without releasing the unfinished flow.
 */
export default function BeginnerWip() {
  return (
    <div className="beginner-root relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-[#0F1013]">
      <BeginnerField />

      <div className="bm-safe-top absolute left-0 top-0 z-30 px-4 md:px-6">
        <Link
          href="/"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} />
        </Link>
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.75, ease: bmEaseOut }}
          className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[#a8a6ff]"
        >
          <Construction className="h-5 w-5" strokeWidth={1.75} />
        </motion.div>

        <RisingWords
          as="h1"
          text="We are still working on this"
          className="bm-display-lg max-w-[14ch] text-white sm:max-w-[18ch]"
          delay={0.15}
          stagger={0.1}
          rise={32}
          duration={0.8}
        />

        <motion.p
          className="bm-body mt-5 max-w-md text-slate-400"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: bmEaseOut, delay: 0.85 }}
        >
          Beginner Mode is almost ready: guides, tutorials, and a calmer way to
          learn the craft. Check back soon.
        </motion.p>

        <motion.div
          className="mt-9 flex w-full max-w-xs flex-col gap-2.5 sm:max-w-none sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: bmEaseOut, delay: 1.05 }}
        >
          <Link href="/" className="btn-primary !min-h-[48px] !px-6 !text-sm">
            Back to home
          </Link>
          <Link
            href="/team"
            className="btn-secondary !min-h-[48px] !px-6 !text-sm"
          >
            Meet the team
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
