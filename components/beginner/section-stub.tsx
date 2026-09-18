"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Camera,
  CheckCircle2,
  Clock3,
  Clapperboard,
  Play,
  Target,
} from "lucide-react"
import { SECTIONS, type SectionId } from "@/lib/beginner/content"
import {
  SECTION_INTROS,
  SECTION_LIBRARY,
  type LearningItem,
  type Medium,
} from "@/lib/beginner/learning-content"
import { bmEaseOut } from "@/lib/beginner/motion"
import { cn } from "@/lib/utils"

type Props = { sectionId: SectionId; onBack: () => void }
const FILTERS = ["All", "Photography", "Videography"] as const

export default function SectionView({ sectionId, onBack }: Props) {
  const section = SECTIONS.find((item) => item.id === sectionId) ?? SECTIONS[0]
  const intro = SECTION_INTROS[sectionId]
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All")
  const [active, setActive] = useState<LearningItem | null>(null)
  const reduceMotion = useReducedMotion()
  const items = useMemo(
    () => SECTION_LIBRARY[sectionId].filter(
      (item) => filter === "All" || item.medium === filter || item.medium === "Both",
    ),
    [filter, sectionId],
  )
  const transition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.45, ease: bmEaseOut }

  return (
    <div className="bm-library mx-auto w-full max-w-6xl px-5 pb-16 pt-2 md:px-10 md:pb-24 lg:px-12">
      <AnimatePresence mode="wait">
        {active ? (
          <motion.article
            key={active.id}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
            transition={transition}
            className="mx-auto max-w-4xl"
          >
            <button type="button" onClick={() => setActive(null)} className="bm-back-link">
              <ArrowLeft aria-hidden className="h-4 w-4" />
              {section.label}
            </button>

            <header className="mt-8 border-b border-white/10 pb-9 md:mt-12 md:pb-12">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
                <MediumIcon medium={active.medium} />
                <span>{active.medium}</span>
                <span aria-hidden className="h-1 w-1 rounded-full bg-[#8b89ff]" />
                <Clock3 aria-hidden className="h-4 w-4" />
                <span>{active.duration}</span>
              </div>
              <motion.h1 layoutId={`learning-title-${active.id}`} className="bm-article-title mt-5 max-w-[18ch] text-white">
                {active.title}
              </motion.h1>
              <p className="bm-article-deck mt-5 max-w-2xl text-slate-300">{active.summary}</p>
              <figure className="bm-article-visual mt-8">
                <Image src={active.image} alt={active.id === "clean-audio" ? "Microphone positioned above a video recording setup" : "An illustrative photograph from the IRIS Society archive"} fill sizes="(max-width: 768px) 100vw, 900px" className="object-cover" />
                <figcaption>{active.id === "clean-audio" ? "Audio recording setup" : "From the IRIS archive"}</figcaption>
              </figure>
              <div className="mt-7 flex max-w-2xl items-start gap-3 rounded-2xl bg-[#3230e0]/15 p-4 text-sm leading-6 text-[#d8d7ff] md:p-5">
                <Target aria-hidden className="mt-1 h-4 w-4 shrink-0" />
                <p><span className="font-semibold text-white">Outcome:</span> {active.outcome}</p>
              </div>
            </header>

            {active.chapters && (
              <div className="mt-10 space-y-5 md:mt-14 md:space-y-7">
                {active.chapters.map((chapter) => (
                  <section key={chapter.title} className="bm-chapter">
                    <h2>{chapter.title}</h2>
                    <p>{chapter.body}</p>
                    {chapter.tryIt && (
                      <div className="bm-try-it">
                        <Play aria-hidden className="h-4 w-4 shrink-0" />
                        <p><span>Try it:</span> {chapter.tryIt}</p>
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}

            {active.keyPoints && (
              <section className="mt-10 md:mt-14">
                <h2 className="bm-section-heading">Keep these in mind</h2>
                <ul className="mt-5 grid gap-3 md:grid-cols-2" role="list">
                  {active.keyPoints.map((point) => (
                    <li key={point} className="bm-key-point">
                      <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#a8a6ff]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {active.practice && (
              <section className="bm-practice mt-10 md:mt-14">
                <span className="bm-kicker">Make something</span>
                <h2>Your practice brief</h2>
                <p>{active.practice}</p>
              </section>
            )}
            {active.links && <ResourceLinks links={active.links} />}
          </motion.article>
        ) : (
          <motion.div
            key={`library-${sectionId}`}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
            transition={transition}
          >
            <button type="button" onClick={onBack} className="bm-back-link">
              <ArrowLeft aria-hidden className="h-4 w-4" />
              All paths
            </button>

            <header className="mt-7 grid gap-6 border-b border-white/10 pb-8 md:mt-10 md:grid-cols-[1fr_0.75fr] md:items-end md:pb-12">
              <div>
                <span className="bm-kicker">{intro.kicker}</span>
                <h1 className="bm-library-title mt-3 text-white">{section.label}</h1>
              </div>
              <p className="bm-body max-w-xl text-slate-400 md:pb-1">{intro.description}</p>
            </header>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:mt-8">
              <p className="text-sm text-slate-500" aria-live="polite">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by craft">
                {FILTERS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                    className="bm-filter"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:mt-8 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <motion.button
                  layout
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item)}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...transition, delay: reduceMotion ? 0 : index * 0.035 }}
                  className="bm-learning-card group"
                >
                  <span className="bm-card-visual">
                    <Image src={item.image} alt="" fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span className="bm-card-visual-shade" />
                  </span>
                  <span className="bm-card-copy">
                    <span className="flex items-center justify-between gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-2"><MediumIcon medium={item.medium} />{item.medium}</span>
                      <span>{item.duration}</span>
                    </span>
                    <motion.h2 layoutId={`learning-title-${item.id}`} className="mt-5 text-xl font-semibold leading-tight text-white">
                      {item.title}
                    </motion.h2>
                    <span className="mt-3 block text-sm leading-6 text-slate-400">{item.summary}</span>
                    <span className="mt-7 flex items-center gap-2 text-sm font-semibold text-[#b9b8ff]">
                      {sectionId === "best" ? "Explore free resource" : "Open lesson"}
                      <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MediumIcon({ medium }: { medium: Medium }) {
  if (medium === "Photography") return <Camera aria-hidden className="h-4 w-4" />
  if (medium === "Videography") return <Clapperboard aria-hidden className="h-4 w-4" />
  return <BookOpen aria-hidden className="h-4 w-4" />
}

function ResourceLinks({ links }: { links: NonNullable<LearningItem["links"]> }) {
  return (
    <section className="mt-10 border-t border-white/10 pt-9 md:mt-14 md:pt-12">
      <h2 className="bm-section-heading">Go deeper</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={cn("bm-resource-link", links.length === 1 && "sm:max-w-md")}>
            <span>
              <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">{link.source} · Free</span>
              <span className="mt-1 block font-semibold text-white">{link.label}</span>
            </span>
            <ArrowUpRight aria-hidden className="h-4 w-4 shrink-0 text-[#a8a6ff]" />
          </a>
        ))}
      </div>
    </section>
  )
}
