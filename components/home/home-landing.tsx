"use client"

import { useRef, type RefObject } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  Camera,
  Lock,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { spring } from "@/lib/motion"
import VelvetSweep from "@/app/components/backgrounds/effects/velvet-sweep"

type PotwPhoto = {
  image?: string
  theme?: string
  photographer?: string
  description?: string
  week?: number
  month?: string
  year?: string | number
}

type VideoData = {
  enabled?: boolean
  src?: string
  title?: string
  description?: string
  instagramUrl?: string
} | null

export type HomeLandingProps = {
  currentPotw: PotwPhoto | null
  recruiting: boolean
  isRedirecting: boolean
  onJoin: () => void
  onApplyCore: () => void
  videoData: VideoData
  videoMuted: boolean
  onToggleMute: () => void
  videoRef: RefObject<HTMLVideoElement | null>
}

/** Quiet site index: not a card grid, just a typed map of the society */
const INDEX = [
  { href: "/beginner", label: "Beginner Mode", hint: "Coming soon" },
  { href: "/events", label: "Events", hint: "Workshops and competitions" },
  { href: "/potw", label: "Photo of the Week", hint: "Weekly winners" },
  { href: "/gallery", label: "Gallery", hint: "Member work" },
  { href: "/meetups", label: "Photowalks", hint: "Shoot together" },
  { href: "/team", label: "Team", hint: "People behind IRIS" },
  { href: "/about", label: "About", hint: "Our story" },
]

const RIBBON = [
  { src: "/images/PIC00916.JPG", alt: "IRIS at an event" },
  { src: "/images/PIC08926.jpg", alt: "Behind the scenes" },
  { src: "/images/PIC06755.jpg", alt: "A moment with IRIS" },
]

export default function HomeLanding({
  currentPotw,
  recruiting,
  isRedirecting,
  onJoin,
  onApplyCore,
  videoData,
  videoMuted,
  onToggleMute,
  videoRef,
}: HomeLandingProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const featureRef = useRef<HTMLElement>(null)
  const indexRef = useRef<HTMLElement>(null)
  const ribbonRef = useRef<HTMLElement>(null)

  const featureInView = useInView(featureRef, { once: true, margin: "-10% 0px" })
  const indexInView = useInView(indexRef, { once: true, margin: "-10% 0px" })
  const ribbonInView = useInView(ribbonRef, { once: true, margin: "-10% 0px" })

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroShift = useTransform(scrollYProgress, [0, 1], [0, 48])
  const heroFade = useTransform(scrollYProgress, [0, 0.85], [1, 0.4])

  return (
    <>
      {/* ════════════════════════════════════════
          HERO: brand entry only (velvet stays)
          Editorial type, full logo, clear CTAs.
          Not a story page. Not About.
      ════════════════════════════════════════ */}
      <div
        ref={heroRef}
        className="relative z-10 flex min-h-[100dvh] w-full flex-col justify-end overflow-hidden safe-area-inset-top sm:justify-center"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0%, #000 45%, rgba(0,0,0,0.9) 62%, rgba(0,0,0,0.35) 82%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, #000 0%, #000 45%, rgba(0,0,0,0.9) 62%, rgba(0,0,0,0.35) 82%, transparent 100%)",
          }}
        >
          <VelvetSweep
            color="#3230e0"
            background="#0F1013"
            speed={1}
            intensity={0.95}
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0F1013]/70 to-transparent"
          aria-hidden
        />

        <motion.div
          style={{ y: heroShift, opacity: heroFade }}
          className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-20 pt-28 sm:px-8 sm:pb-24 md:pt-20"
        >
          {/* Desktop: logo left, copy right. Mobile: stacked. */}
          <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-14 md:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={spring.soft}
              className="relative shrink-0"
            >
              <div
                className="pointer-events-none absolute inset-[-20%] rounded-full bg-[radial-gradient(circle,rgba(50,48,224,0.45)_0%,transparent_68%)] blur-2xl"
                aria-hidden
              />
              <div className="relative h-[200px] w-[200px] sm:h-[240px] sm:w-[240px] md:h-[280px] md:w-[280px]">
                <Image
                  src="/images/logo.png"
                  alt="IRIS Society logo"
                  fill
                  priority
                  sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, 280px"
                  className="object-contain p-0.5"
                />
              </div>
            </motion.div>

            <div className="flex min-w-0 flex-1 flex-col items-center text-center md:items-start md:text-left">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring.default, delay: 0.06 }}
                className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-sky-200/75"
              >
                IIT Madras BS
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring.default, delay: 0.1 }}
                className="font-extrabold tracking-[-0.035em] text-white"
                style={{
                  fontSize: "clamp(2.5rem, 8vw, 4.25rem)",
                  lineHeight: 1.02,
                }}
              >
                <span className="bg-gradient-to-br from-white via-[#d8d7ff] to-[#3230e0] bg-clip-text text-transparent">
                  IRIS Society
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring.default, delay: 0.16 }}
                className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-300 sm:text-base"
              >
                Photography and videography society of the IIT Madras BS Degree
                program. Through our lenses, beyond the ordinary.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring.default, delay: 0.22 }}
                className="mt-8 flex w-full max-w-sm flex-col gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap md:justify-start"
              >
                <button
                  type="button"
                  onClick={onJoin}
                  disabled={isRedirecting}
                  className="btn-primary !min-h-[48px] !px-6 !text-sm"
                >
                  {isRedirecting ? (
                    "Redirecting..."
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Be a Member
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onApplyCore}
                  className="btn-secondary !min-h-[48px] !px-6 !text-sm"
                >
                  {recruiting ? (
                    "Join Core Team"
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4 opacity-80" />
                      Join Core Team
                    </>
                  )}
                </button>
                <Link
                  href="/beginner"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-sm font-medium text-slate-200 transition hover:border-[#5b59f0]/40 hover:bg-[#3230e0]/15 hover:text-white"
                >
                  <Camera className="h-4 w-4 opacity-90" />
                  Beginner Mode
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...spring.default, delay: 0.3 }}
                className="mt-3 max-w-sm text-center text-xs leading-relaxed text-slate-500 md:text-left"
              >
                New to photography or videography? Beginner Mode is on the way.
                Preview the page while we finish building it.
              </motion.p>
            </div>
          </div>

          <motion.a
            href="#featured"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...spring.default, delay: 0.45 }}
            className="mx-auto mt-14 flex w-fit flex-col items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-slate-500 transition hover:text-slate-300 md:mx-0"
          >
            Continue
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </motion.span>
          </motion.a>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════
          FEATURED FRAME: full-bleed POTW
          Magazine cover, not a glass info card.
      ════════════════════════════════════════ */}
      <section
        id="featured"
        ref={featureRef}
        className="relative z-10 w-full px-0 pb-4 pt-6 sm:px-6 sm:pb-8 sm:pt-10 md:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={featureInView ? { opacity: 1, y: 0 } : {}}
          transition={spring.soft}
          className="mx-auto max-w-6xl"
        >
          <div className="mb-4 flex items-end justify-between gap-4 px-5 sm:mb-5 sm:px-0">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-sky-200/70">
                Featured
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Photo of the Week
              </h2>
            </div>
            <Link
              href="/potw"
              className="hidden items-center gap-1.5 text-sm text-slate-400 transition hover:text-white sm:inline-flex"
            >
              Full archive
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {currentPotw?.image ? (
            <Link
              href="/potw"
              className="group relative block overflow-hidden bg-[#0a0a0c] sm:rounded-2xl"
            >
              {/*
                Stage that fits any aspect ratio: image uses object-contain
                so portrait, landscape, and square all stay fully visible.
              */}
              <div className="relative flex w-full items-center justify-center min-h-[min(58dvh,420px)] max-h-[min(78dvh,760px)]">
                <Image
                  src={currentPotw.image}
                  alt={
                    currentPotw.theme
                      ? `Photo of the Week: ${currentPotw.theme}`
                      : "Photo of the Week"
                  }
                  width={1600}
                  height={1200}
                  sizes="(max-width: 768px) 100vw, 1152px"
                  className="h-auto max-h-[min(78dvh,760px)] w-full object-contain transition duration-700 ease-out group-hover:scale-[1.01]"
                  priority
                  unoptimized
                />
                {/* Caption sits on a fade so text stays readable over any ratio */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent pt-24 sm:pt-32">
                  <div className="pointer-events-auto flex max-w-2xl flex-col gap-2 p-5 sm:p-7 md:p-9">
                    {currentPotw.week != null && (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c8c7ff]">
                        Week {currentPotw.week}
                        {currentPotw.month ? ` · ${currentPotw.month}` : ""}
                        {currentPotw.year != null
                          ? ` · ${currentPotw.year}`
                          : ""}
                      </span>
                    )}
                    {currentPotw.theme && (
                      <h3 className="text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
                        {currentPotw.theme}
                      </h3>
                    )}
                    {currentPotw.photographer && (
                      <p className="text-sm text-slate-200 sm:text-base">
                        by {currentPotw.photographer}
                      </p>
                    )}
                    {currentPotw.description && (
                      <p className="mt-1 line-clamp-2 max-w-xl text-sm leading-relaxed text-slate-300/90 md:line-clamp-3">
                        {currentPotw.description}
                      </p>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/90">
                      <Camera className="h-4 w-4 opacity-80" />
                      See all winners
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="mx-5 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center sm:mx-0">
              <Camera className="mb-3 h-7 w-7 text-slate-500" />
              <p className="text-sm text-slate-400">
                No featured photo right now.
              </p>
              <Link
                href="/potw"
                className="mt-3 text-sm font-medium text-sky-300 hover:text-sky-200"
              >
                Browse the archive
              </Link>
            </div>
          )}

          <Link
            href="/potw"
            className="mt-4 flex items-center justify-center gap-1.5 text-sm text-slate-400 sm:hidden"
          >
            Full archive
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          SITE INDEX: divider list, not boxes
          Reads like a table of contents.
      ════════════════════════════════════════ */}
      <section
        ref={indexRef}
        className="relative z-10 w-full px-5 py-14 sm:px-8 sm:py-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={indexInView ? { opacity: 1, y: 0 } : {}}
          transition={spring.default}
          className="mx-auto max-w-3xl"
        >
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-sky-200/70">
            Explore
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Find your way around
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
            Jump into the pages that keep IRIS moving.
          </p>

          <nav className="mt-8 border-t border-white/10" aria-label="Site sections">
            {INDEX.map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -8 }}
                animate={indexInView ? { opacity: 1, x: 0 } : {}}
                transition={{ ...spring.snappy, delay: 0.04 * i }}
              >
                <Link
                  href={item.href}
                  className="group flex min-h-[56px] items-center justify-between gap-4 border-b border-white/10 py-4 transition active:bg-white/[0.03] sm:min-h-[64px] sm:py-5"
                >
                  <div className="flex min-w-0 items-baseline gap-3 sm:gap-5">
                    <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-slate-600 group-hover:text-[#a8a6ff]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <span className="block text-base font-medium tracking-tight text-white transition group-hover:text-[#c8c7ff] sm:text-lg">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500 sm:text-sm">
                        {item.hint}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-white" />
                </Link>
              </motion.div>
            ))}
          </nav>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          RIBBON: pure photography strip
          No logos, no glass tiles, no copy blocks.
      ════════════════════════════════════════ */}
      <section
        ref={ribbonRef}
        className="relative z-10 w-full pb-6 pt-2 sm:pb-10"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={ribbonInView ? { opacity: 1 } : {}}
          transition={spring.soft}
        >
          <div className="mb-4 flex items-center justify-between px-5 sm:px-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-sky-200/70">
              From the field
            </p>
            <Link
              href="/gallery"
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Gallery
            </Link>
          </div>

          {/* Mobile: horizontal snap. Desktop: 3-up flush. */}
          <div className="flex gap-2 overflow-x-auto px-5 pb-2 snap-x snap-mandatory scrollbar-none sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-8 sm:pb-0 md:gap-4">
            {RIBBON.map((shot, i) => (
              <motion.div
                key={shot.src}
                initial={{ opacity: 0, y: 12 }}
                animate={ribbonInView ? { opacity: 1, y: 0 } : {}}
                transition={{ ...spring.default, delay: 0.06 * i }}
                className="relative h-[52vw] w-[72vw] shrink-0 snap-center overflow-hidden rounded-xl sm:h-auto sm:w-auto sm:aspect-[4/5] sm:rounded-2xl"
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(max-width: 640px) 72vw, 33vw"
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Optional video: quiet, single surface */}
      {videoData?.enabled && (
        <section className="relative z-10 w-full px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-sky-200/70">
              Motion
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              {videoData.title || "Watch our story"}
            </h2>
            {videoData.description && (
              <p className="mt-2 max-w-lg text-sm text-slate-400">
                {videoData.description}
              </p>
            )}
            <div className="relative mt-6 aspect-video overflow-hidden rounded-xl bg-black/40 ring-1 ring-white/10">
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                muted={videoMuted}
                loop
                playsInline
                autoPlay
                preload="metadata"
                poster="/placeholder.jpg"
              >
                <source
                  src={videoData.src || "/videos/iris_reel_1.mp4"}
                  type="video/mp4"
                />
              </video>
              <button
                type="button"
                onClick={onToggleMute}
                className="absolute bottom-3 right-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/15 backdrop-blur-sm transition active:scale-95"
                aria-label={videoMuted ? "Unmute" : "Mute"}
              >
                {videoMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>
            {videoData.instagramUrl && (
              <a
                href={videoData.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm text-slate-400 transition hover:text-white"
              >
                View on Instagram
              </a>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          CLOSE: text + actions only
          No logo block, no glass hero clone.
      ════════════════════════════════════════ */}
      <section className="relative z-10 w-full px-5 pb-20 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
        <div className="mx-auto max-w-2xl border-t border-white/10 pt-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start with a frame
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            Join the community, walk with us, or open the gallery when you are
            ready to look around.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={onJoin}
              disabled={isRedirecting}
              className="btn-primary !min-h-[48px] !px-6 !text-sm"
            >
              Be a Member
            </button>
            <Link
              href="/gallery"
              className="btn-secondary !min-h-[48px] !px-6 !text-sm"
            >
              Open gallery
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
