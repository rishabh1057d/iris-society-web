"use client"

import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { SECTIONS, type SectionId } from "@/lib/beginner/content"
import { bmEaseOut } from "@/lib/beginner/motion"
import RisingWords from "@/components/beginner/rising-words"

type Props = {
  sectionId: SectionId
  onBack: () => void
}

export default function SectionStub({ sectionId, onBack }: Props) {
  const section = SECTIONS.find((s) => s.id === sectionId) ?? SECTIONS[0]

  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col px-5 pb-8 pt-4 md:max-w-2xl md:justify-center md:px-10">
      <motion.button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full text-sm text-slate-500 transition hover:text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: bmEaseOut, delay: 0.1 }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </motion.button>

      <div className="mt-10 md:mt-12">
        <RisingWords
          as="h1"
          text={section.label}
          className="bm-display-lg justify-start text-left text-white"
          delay={0.15}
          stagger={0.12}
          rise={32}
          duration={0.85}
        />
      </div>

      <motion.p
        className="bm-lead-airy mt-5 text-slate-400"
        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.75, ease: bmEaseOut, delay: 0.55 }}
      >
        {section.blurb}
      </motion.p>

      <motion.p
        className="bm-body mt-8 max-w-prose text-slate-500"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: bmEaseOut, delay: 0.75 }}
      >
        Guides, videos, and articles for this path are on the way.
      </motion.p>

      <div className="bm-dock mt-auto pt-10 md:hidden">
        <button type="button" onClick={onBack} className="btn-secondary w-full !min-h-[52px]">
          Back
        </button>
      </div>
    </div>
  )
}
