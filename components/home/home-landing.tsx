"use client"

import { useRef, type ReactNode, type RefObject } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUpRight,
  Camera,
  CalendarDays,
  Footprints,
  GraduationCap,
  Handshake,
  ImageIcon,
  Trophy,
  Users,
  Aperture,
  Film,
  Sparkles,
  Lock,
  Volume2,
  VolumeX,
} from "lucide-react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { spring, staggerContainer, staggerItem } from "@/lib/motion"
import { cn } from "@/lib/utils"
import VelvetSweep from "@/app/components/backgrounds/effects/velvet-sweep"

type PotwPhoto = {
  image?: string
  theme?: string
  photographer?: string
  description?: string
  week?: number
  month?: string
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

const STATS = [
  { value: "1200+", label: "Members", icon: Users },
  { value: "40+", label: "Events", icon: CalendarDays },
  { value: "2k+", label: "Frames shared", icon: ImageIcon },
  { value: "30+", label: "Collabs", icon: Handshake },
]

const DESTINATIONS = [
  {
    href: "/events",
    title: "Events",
    copy: "Workshops, competitions, and showcases on the calendar.",
    icon: Trophy,
    tone: "from-[#3230e0]/35 to-transparent",
  },
  {
    href: "/potw",
    title: "Photo of the Week",
    copy: "Weekly themes. Browse winners and the stories behind them.",
    icon: Camera,
    tone: "from-sky-500/25 to-transparent",
  },
  {
    href: "/gallery",
    title: "Gallery",
    copy: "A living archive of IRIS moments and member work.",
    icon: ImageIcon,
    tone: "from-violet-500/25 to-transparent",
  },
  {
    href: "/meetups",
    title: "Photowalks",
    copy: "Shoot together on campus and around the city.",
    icon: Footprints,
    tone: "from-emerald-500/25 to-transparent",
  },
  {
    href: "/team",
    title: "Team",
    copy: "Meet the people who keep the society in focus.",
    icon: Users,
    tone: "from-pink-500/20 to-transparent",
  },
  {
    href: "/about",
    title: "About IRIS",
    copy: "Our story — from a club to a full creative society.",
    icon: Aperture,
    tone: "from-amber-500/20 to-transparent",
  },
]

const PILLARS = [
  {
    title: "Workshops",
    copy: "Light, composition, editing — hands-on sessions for every level.",
    icon: GraduationCap,
  },
  {
    title: "Competitions",
    copy: "Shutter Safari, POTW, and challenges that raise the craft.",
    icon: Trophy,
  },
  {
    title: "Photowalks",
    copy: "Walks where we shoot side by side and learn in the field.",
    icon: Footprints,
  },
  {
    title: "Collabs",
    copy: "Festivals, clubs, and brands that put IRIS work in new frames.",
    icon: Handshake,
  },
]

const MOSAIC = [
  { src: "/images/PIC00916.JPG", alt: "IRIS community event", span: "col-span-2 row-span-2" },
  { src: "/images/PIC08926.jpg", alt: "Behind the scenes", span: "col-span-1" },
  { src: "/images/PIC06755.jpg", alt: "Photography moment", span: "col-span-1" },
]

function SectionShell({
  children,
  className,
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative z-10 w-full px-4 sm:px-6 md:px-8",
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </section>
  )
}

function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow?: string
  title: string
  sub?: string
  align?: "center" | "left"
}) {
  return (
    <div
      className={cn(
        "mb-8 md:mb-10",
        align === "center" ? "text-center" : "text-left"
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            "mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/80",
            align === "center" && "justify-center"
          )}
        >
          <Sparkles className="h-3.5 w-3.5 text-[#a8a6ff]" />
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-bold tracking-tight text-white",
          "text-[clamp(1.65rem,4vw,2.5rem)] leading-[1.1]"
        )}
      >
        <span className="bg-gradient-to-r from-white via-[#c8c7ff] to-[#3230e0] bg-clip-text text-transparent">
          {title}
        </span>
      </h2>
      {sub && (
        <p
          className={cn(
            "mt-3 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base",
            align === "center" && "mx-auto"
          )}
        >
          {sub}
        </p>
      )}
    </div>
  )
}

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
  const exploreRef = useRef<HTMLDivElement>(null)
  const potwRef = useRef<HTMLDivElement>(null)
  const pillarsRef = useRef<HTMLDivElement>(null)
  const mosaicRef = useRef<HTMLDivElement>(null)

  const isExploreInView = useInView(exploreRef, { once: true, margin: "-80px" })
  const isPotwInView = useInView(potwRef, { once: true, margin: "-80px" })
  const isPillarsInView = useInView(pillarsRef, { once: true, margin: "-80px" })
  const isMosaicInView = useInView(mosaicRef, { once: true, margin: "-80px" })

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.35])

  return (
    <>
      {/* ─── HERO ─── */}
      <div
        ref={heroRef}
        className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden text-center safe-area-inset-top"
      >
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, #000 0%, #000 48%, rgba(0,0,0,0.88) 66%, rgba(0,0,0,0.4) 84%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, #000 0%, #000 48%, rgba(0,0,0,0.88) 66%, rgba(0,0,0,0.4) 84%, transparent 100%)",
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
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0F1013]/60 to-transparent md:h-32"
          aria-hidden
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-5 pb-16 pt-24 sm:px-8 sm:pb-20 md:pt-28"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring.default}
            className="mb-5"
          >
            <span className="event-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-sky-100">
              <Aperture className="h-3.5 w-3.5 text-[#a8a6ff]" />
              IIT Madras BS · Photography &amp; Videography
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...spring.soft, delay: 0.05 }}
            className="relative mb-7 sm:mb-8"
          >
            <div
              className="pointer-events-none absolute inset-[-18%] rounded-full bg-[radial-gradient(circle_at_center,rgba(50,48,224,0.5)_0%,rgba(50,48,224,0.12)_45%,transparent_70%)] blur-2xl"
              aria-hidden
            />
            <div className="relative mx-auto aspect-square w-[min(42vw,200px)] sm:w-[220px] md:w-[260px]">
              <Image
                src="/images/logo.png"
                alt="IRIS Society logo"
                fill
                priority
                sizes="(max-width: 640px) 42vw, 260px"
                className="object-contain drop-shadow-[0_16px_48px_rgba(0,0,0,0.5)] p-2"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.default, delay: 0.1 }}
            className="mb-3 font-extrabold tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(2.35rem, 7vw, 4rem)", lineHeight: 1.05 }}
          >
            <span className="bg-gradient-to-r from-white via-[#d4d3ff] to-[#3230e0] bg-clip-text text-transparent">
              IRIS Society
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.default, delay: 0.16 }}
            className="mb-2 max-w-lg text-[clamp(1rem,2.8vw,1.25rem)] font-medium leading-snug text-slate-200"
          >
            Photography &amp; Videography Society of IITM BS Degree
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.default, delay: 0.22 }}
            className="mb-9 max-w-md text-sm italic leading-relaxed text-slate-400 sm:text-base"
          >
            Through our lenses, beyond the ordinary.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.default, delay: 0.28 }}
            className="flex w-full max-w-md flex-col items-stretch gap-2.5 sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:gap-3"
          >
            <button
              type="button"
              onClick={onJoin}
              disabled={isRedirecting}
              className="btn-primary !min-h-[48px] !px-6 !text-sm sm:!text-base"
            >
              {isRedirecting ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Redirecting…
                </>
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
              className="btn-secondary !min-h-[48px] !px-6 !text-sm sm:!text-base"
            >
              {recruiting ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Join Core Team
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4 opacity-80" />
                  Join Core Team
                </>
              )}
            </button>
          </motion.div>

          <motion.a
            href="#explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...spring.default, delay: 0.5 }}
            className="mt-12 inline-flex flex-col items-center gap-1.5 text-xs text-slate-400 transition hover:text-sky-200"
          >
            <span>Scroll to explore</span>
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="h-4 w-4" />
            </motion.span>
          </motion.a>
        </motion.div>
      </div>

      {/* ─── STATS ─── */}
      <SectionShell className="pb-4 pt-2 md:pb-6 md:pt-4">
        <motion.div
          className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4 md:gap-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
          {STATS.map((s) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.label}
                variants={staggerItem}
                className="glass-card-event rounded-2xl px-3 py-4 text-center sm:px-4 sm:py-5"
              >
                <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#3230e0]/20 text-[#c8c7ff] ring-1 ring-[#3230e0]/30">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">{s.label}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </SectionShell>

      {/* ─── EXPLORE ─── */}
      <SectionShell id="explore" className="py-12 md:py-16">
        <motion.div
          ref={exploreRef}
          initial={{ opacity: 0, y: 16 }}
          animate={isExploreInView ? { opacity: 1, y: 0 } : {}}
          transition={spring.default}
        >
          <SectionHeading
            eyebrow="Navigate"
            title="Where will you look next?"
            sub="Everything IRIS offers — one tap from the frame."
          />
          <motion.div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate={isExploreInView ? "visible" : "hidden"}
          >
            {DESTINATIONS.map((d) => {
              const Icon = d.icon
              return (
                <motion.div key={d.href} variants={staggerItem}>
                  <Link
                    href={d.href}
                    className="glass-card-event group relative flex h-full flex-col overflow-hidden rounded-2xl p-5 transition active:scale-[0.99] sm:p-6"
                  >
                    <div
                      className={cn(
                        "pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br opacity-90 blur-2xl transition group-hover:opacity-100",
                        d.tone
                      )}
                      aria-hidden
                    />
                    <div className="relative mb-4 flex items-start justify-between gap-3">
                      <span className="event-glass-chip flex h-11 w-11 items-center justify-center rounded-xl text-[#c8c7ff]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:text-sky-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <h3 className="relative text-lg font-semibold tracking-tight text-white">
                      {d.title}
                    </h3>
                    <p className="relative mt-1.5 flex-1 text-sm leading-relaxed text-slate-300">
                      {d.copy}
                    </p>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.div>
      </SectionShell>

      {/* ─── FEATURED POTW ─── */}
      <SectionShell className="py-12 md:py-16">
        <motion.div
          ref={potwRef}
          initial={{ opacity: 0, y: 16 }}
          animate={isPotwInView ? { opacity: 1, y: 0 } : {}}
          transition={spring.default}
        >
          <SectionHeading
            eyebrow="Spotlight"
            title="Photo of the Week"
            sub="Celebrating exceptional photography from our community."
          />

          {currentPotw ? (
            <div className="glass-card-event overflow-hidden rounded-3xl">
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-[4/5] w-full bg-slate-900/80 sm:aspect-[16/11] md:aspect-auto md:min-h-[380px]">
                  <Image
                    src={currentPotw.image || "/placeholder.svg"}
                    alt={
                      currentPotw.theme
                        ? `Photo of the Week — ${currentPotw.theme}`
                        : "Photo of the Week"
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority={false}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />
                  {currentPotw.week != null && (
                    <span className="event-glass-chip absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold text-sky-100">
                      Week {currentPotw.week}
                    </span>
                  )}
                </div>

                <div className="flex flex-col justify-center p-5 sm:p-7 md:p-8">
                  {currentPotw.photographer && (
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Photographer
                    </p>
                  )}
                  <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
                    {currentPotw.photographer || "Featured winner"}
                  </h3>
                  {currentPotw.theme && (
                    <p className="mt-3 text-sm font-medium text-sky-200/90 md:text-base">
                      Theme: {currentPotw.theme}
                    </p>
                  )}
                  {currentPotw.description && (
                    <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-300 md:line-clamp-5">
                      {currentPotw.description}
                    </p>
                  )}
                  <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                    <Link
                      href="/potw"
                      className="btn-primary !min-h-[44px] !px-5 !py-2.5 !text-sm"
                    >
                      Browse all winners
                      <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href="/gallery"
                      className="btn-secondary !min-h-[44px] !px-5 !py-2.5 !text-sm"
                    >
                      Open gallery
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="event-glass rounded-2xl border border-dashed border-white/15 px-4 py-12 text-center">
              <Camera className="mx-auto mb-3 h-8 w-8 text-slate-500" />
              <p className="text-sm text-slate-300">
                No Photo of the Week is featured right now.
              </p>
              <Link
                href="/potw"
                className="mt-4 inline-flex text-sm font-medium text-sky-300 hover:text-sky-200"
              >
                Visit the archive →
              </Link>
            </div>
          )}
        </motion.div>
      </SectionShell>

      {/* ─── VIDEO (optional) ─── */}
      {videoData?.enabled && (
        <SectionShell className="py-12 md:py-16">
          <SectionHeading
            eyebrow="Motion"
            title={videoData.title || "Watch our story"}
            sub={
              videoData.description ||
              "Passion and craft from the IRIS community."
            }
          />
          <div className="glass-card-event mx-auto max-w-4xl overflow-hidden rounded-2xl p-2 sm:p-3">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/50">
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
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md ring-1 ring-white/20 transition hover:bg-black/70 active:scale-95"
                aria-label={videoMuted ? "Unmute video" : "Mute video"}
              >
                {videoMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>
            {videoData.instagramUrl && (
              <div className="flex justify-center py-3">
                <a
                  href={videoData.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-glass-chip inline-flex min-h-[40px] items-center gap-2 rounded-full px-4 text-sm font-medium text-pink-100 transition hover:bg-white/10"
                >
                  <Film className="h-4 w-4" />
                  View on Instagram
                </a>
              </div>
            )}
          </div>
        </SectionShell>
      )}

      {/* ─── WHAT WE DO ─── */}
      <SectionShell className="py-12 md:py-16">
        <motion.div
          ref={pillarsRef}
          initial={{ opacity: 0, y: 16 }}
          animate={isPillarsInView ? { opacity: 1, y: 0 } : {}}
          transition={spring.default}
        >
          <SectionHeading
            eyebrow="Craft"
            title="What we do"
            sub="Four ways IRIS keeps the shutter clicking."
          />
          <motion.div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate={isPillarsInView ? "visible" : "hidden"}
          >
            {PILLARS.map((p) => {
              const Icon = p.icon
              return (
                <motion.article
                  key={p.title}
                  variants={staggerItem}
                  whileHover={{ y: -3, transition: spring.snappy }}
                  className="glass-card-event rounded-2xl p-5 sm:p-6"
                >
                  <div className="flex items-start gap-3.5">
                    <span className="event-glass-chip flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#c8c7ff]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-white">
                        {p.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                        {p.copy}
                      </p>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        </motion.div>
      </SectionShell>

      {/* ─── MOSAIC ─── */}
      <SectionShell className="py-12 md:py-16">
        <motion.div
          ref={mosaicRef}
          initial={{ opacity: 0, y: 16 }}
          animate={isMosaicInView ? { opacity: 1, y: 0 } : {}}
          transition={spring.default}
        >
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-200/80">
                Community
              </p>
              <h2 className="text-[clamp(1.65rem,4vw,2.5rem)] font-bold tracking-tight leading-[1.1]">
                <span className="bg-gradient-to-r from-white via-[#c8c7ff] to-[#3230e0] bg-clip-text text-transparent">
                  In the frame
                </span>
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-300">
                A glimpse of the people and moments that make IRIS.
              </p>
            </div>
            <Link
              href="/gallery"
              className="event-glass-chip inline-flex min-h-[40px] w-fit items-center gap-1.5 rounded-full px-3.5 text-xs font-medium text-sky-100 transition hover:bg-white/10 active:scale-95"
            >
              Full gallery
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:gap-4">
            <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-2xl border border-white/12 sm:row-span-2 sm:aspect-auto sm:min-h-[280px] md:min-h-[320px]">
              <Image
                src={MOSAIC[0].src}
                alt={MOSAIC[0].alt}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4">
                <p className="text-sm font-semibold text-white sm:text-base">
                  Community in focus
                </p>
                <p className="text-xs text-slate-300">Events · walks · workshops</p>
              </div>
            </div>
            {MOSAIC.slice(1).map((m) => (
              <div
                key={m.src}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/12 sm:aspect-auto sm:min-h-[132px] md:min-h-[152px]"
              >
                <Image
                  src={m.src}
                  alt={m.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition duration-500 hover:scale-[1.03]"
                />
              </div>
            ))}
            <div className="glass-card-event relative col-span-2 flex min-h-[120px] items-center justify-center overflow-hidden rounded-2xl sm:col-span-1 sm:min-h-[132px] md:min-h-[152px]">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,48,224,0.35),transparent_70%)]"
                aria-hidden
              />
              <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                <Image
                  src="/images/logo.png"
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </motion.div>
      </SectionShell>

      {/* ─── CLOSING CTA ─── */}
      <SectionShell className="pb-16 pt-4 md:pb-20 md:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={spring.default}
          className="glass-card-event relative overflow-hidden rounded-3xl px-5 py-9 text-center sm:px-10 sm:py-12"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(50,48,224,0.4),transparent_55%)]"
            aria-hidden
          />
          <div className="relative mx-auto mb-4 h-14 w-14 sm:h-16 sm:w-16">
            <Image
              src="/images/logo.png"
              alt=""
              fill
              sizes="64px"
              className="object-contain"
              aria-hidden
            />
          </div>
          <h2 className="relative text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
            Ready to shoot with us?
          </h2>
          <p className="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-300">
            Join the community, walk with us on campus, or apply when core
            recruitment opens.
          </p>
          <div className="relative mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={onJoin}
              disabled={isRedirecting}
              className="btn-primary !min-h-[48px] !px-6 !text-sm"
            >
              Be a Member
            </button>
            <Link
              href="/contact"
              className="btn-secondary !min-h-[48px] !px-6 !text-sm"
            >
              Contact us
            </Link>
          </div>
        </motion.div>
      </SectionShell>
    </>
  )
}
