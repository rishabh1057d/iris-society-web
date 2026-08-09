"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import Footer from "@/components/footer"
import {
  Camera,
  GraduationCap,
  Trophy,
  Footprints,
  Handshake,
  ArrowUpRight,
  Sparkles,
  Users,
  ImageIcon,
  CalendarDays,
  Aperture,
  Film,
  Heart,
} from "lucide-react"
import { motion, useInView } from "framer-motion"
import { spring, staggerContainer, staggerItem } from "@/lib/motion"
import { cn } from "@/lib/utils"

const pillars = [
  {
    title: "Workshops",
    copy: "Hands-on sessions on light, composition, editing, and storytelling, for beginners and regulars alike.",
    icon: GraduationCap,
    tone: "from-[#3230e0]/30 to-transparent",
  },
  {
    title: "Competitions",
    copy: "Flagship contests like Shutter Safari and Photo of the Week that push craft and creativity.",
    icon: Trophy,
    tone: "from-amber-500/25 to-transparent",
  },
  {
    title: "Photowalks",
    copy: "Campus and city walks where we shoot together, share frames, and learn by doing.",
    icon: Footprints,
    tone: "from-emerald-500/25 to-transparent",
  },
  {
    title: "Collaborations",
    copy: "Partnerships with clubs, brands, and festivals that put IRIS work in front of new audiences.",
    icon: Handshake,
    tone: "from-pink-500/20 to-transparent",
  },
]

const stats = [
  { value: "1200+", label: "Active members", icon: Users },
  { value: "40+", label: "Workshops & events", icon: CalendarDays },
  { value: "2k+", label: "Photos shared", icon: ImageIcon },
  { value: "30+", label: "Collaborations", icon: Heart },
]

const moments = [
  {
    src: "/images/PIC00916.JPG",
    alt: "IRIS community at an event",
    className: "col-span-2 row-span-2 sm:col-span-2 sm:row-span-2",
  },
  {
    src: "/images/PIC08926.jpg",
    alt: "Behind the scenes with IRIS",
    className: "col-span-1 row-span-1",
  },
  {
    src: "/images/PIC06755.jpg",
    alt: "IRIS photography moment",
    className: "col-span-1 row-span-1",
  },
]

const timeline = [
  {
    when: "Nov 2023",
    title: "Founded",
    copy: "IRIS begins as the photography society of the IIT Madras BS Degree program.",
  },
  {
    when: "2024",
    title: "Growing the frame",
    copy: "Workshops, photowalks, and competitions expand the community beyond a club into a creative home.",
  },
  {
    when: "Now",
    title: "Still & motion",
    copy: "Photography, videography, design, and web: one society telling stories in light and motion.",
  },
]

function LogoMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto flex items-center justify-center",
        className
      )}
    >
      {/* Soft brand bloom behind the mark */}
      <div
        className="pointer-events-none absolute inset-[-12%] rounded-full bg-[radial-gradient(circle_at_center,rgba(50,48,224,0.45)_0%,rgba(50,48,224,0.12)_42%,transparent_70%)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[8%] rounded-full border border-white/10 shadow-[0_0_60px_rgba(50,48,224,0.25)]"
        aria-hidden
      />
      {/* Full logo, never cropped */}
      <div className="relative aspect-square w-full max-w-[240px] sm:max-w-[280px] md:max-w-[320px]">
        <Image
          src="/images/logo.png"
          alt="IRIS Society logo"
          fill
          priority
          sizes="(max-width: 640px) 240px, (max-width: 768px) 280px, 320px"
          className="object-contain drop-shadow-[0_12px_40px_rgba(0,0,0,0.45)] p-3 sm:p-4"
        />
      </div>
    </div>
  )
}

export default function AboutClientPage() {
  const heroRef = useRef<HTMLElement>(null)
  const storyRef = useRef<HTMLElement>(null)
  const pillarsRef = useRef<HTMLElement>(null)
  const isHeroInView = useInView(heroRef, { once: true })
  const isStoryInView = useInView(storyRef, { once: true, margin: "-60px" })
  const isPillarsInView = useInView(pillarsRef, { once: true, margin: "-60px" })

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      {/* Ambient field */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#3230e0]/18 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-[#5b59f0]/12 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 h-64 w-64 rounded-full bg-[#3230e0]/10 blur-3xl" />
      </div>

      <div className="page-shell relative z-10 max-w-6xl flex-1">
        {/* ── Hero ── */}
        <motion.section
          ref={heroRef}
          className="mb-12 text-center md:mb-16"
          initial={{ opacity: 0, y: 16 }}
          animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={spring.default}
        >
          <div className="mb-5 flex justify-center sm:mb-6">
            <span className="event-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-sky-100">
              <Aperture className="h-3.5 w-3.5 text-[#a8a6ff]" />
              IIT Madras BS · Photography & Videography
            </span>
          </div>

          <LogoMark className="mb-6 sm:mb-8" />

          <h1 className="page-hero-title !mb-3">IRIS Society</h1>
          <p className="page-hero-sub !max-w-xl">
            Official photography &amp; videography society of the IIT Madras BS
            Degree program. We craft stories in light and motion.
          </p>

          <div className="mt-7 flex flex-col items-stretch justify-center gap-2.5 sm:mt-8 sm:flex-row sm:items-center sm:gap-3">
            <Link
              href="/team"
              className="btn-primary !min-h-[44px] !px-5 !py-2.5 !text-sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Meet the team
            </Link>
            <Link
              href="/gallery"
              className="btn-secondary !min-h-[44px] !px-5 !py-2.5 !text-sm"
            >
              <ImageIcon className="mr-2 h-4 w-4 opacity-80" />
              Explore gallery
            </Link>
          </div>
        </motion.section>

        {/* ── Stats ── */}
        <motion.section
          className="mb-12 md:mb-16"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={spring.default}
        >
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4 md:gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="glass-card-event group rounded-2xl px-3 py-4 text-center sm:px-4 sm:py-5"
                >
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#3230e0]/20 text-[#c8c7ff] ring-1 ring-[#3230e0]/30">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-slate-400 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* ── Story + visual ── */}
        <motion.section
          ref={storyRef}
          className="mb-12 md:mb-16"
          initial={{ opacity: 0, y: 14 }}
          animate={isStoryInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
          transition={spring.default}
        >
          <div className="grid items-stretch gap-4 md:grid-cols-12 md:gap-5">
            {/* Story card */}
            <div className="glass-card-event flex flex-col rounded-2xl p-5 sm:p-6 md:col-span-7 md:p-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="event-glass-chip inline-flex h-8 w-8 items-center justify-center rounded-full text-sky-200">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                  Who we are
                </h2>
              </div>

              <p className="mb-4 text-sm leading-relaxed text-slate-300 md:text-[15px]">
                Founded in November 2023, IRIS is a community of visual
                storytellers dedicated to capturing moments, crafting narratives,
                and expressing creativity through photography and videography.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 md:text-[15px]">
                What began as a photography club has grown into a vibrant creative
                society that celebrates still and moving images. Whether you&apos;re
                just starting out or already experienced, IRIS is a welcoming space
                to learn, explore, and grow your craft.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { icon: Camera, label: "Photography" },
                  { icon: Film, label: "Videography" },
                  { icon: Aperture, label: "Visual craft" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="event-glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-slate-200"
                  >
                    <Icon className="h-3.5 w-3.5 text-[#a8a6ff]" />
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-2.5 pt-7 sm:flex-row sm:flex-wrap">
                <Link
                  href="/events"
                  className="btn-primary !min-h-[42px] !px-4 !py-2 !text-sm"
                >
                  See events
                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/meetups"
                  className="btn-secondary !min-h-[42px] !px-4 !py-2 !text-sm"
                >
                  Photowalks
                </Link>
              </div>
            </div>

            {/* Bento moments: logo fully visible in glass stage */}
            <div className="flex flex-col gap-3 md:col-span-5 md:gap-4">
              <div className="glass-card-event relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl p-5 sm:p-6">
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(50,48,224,0.28),transparent_65%)]"
                  aria-hidden
                />
                <p className="relative mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/70">
                  Our mark
                </p>
                <div className="relative aspect-square w-full max-w-[200px] sm:max-w-[220px]">
                  <Image
                    src="/images/logo.png"
                    alt="IRIS Society logo"
                    fill
                    sizes="220px"
                    className="object-contain p-2"
                  />
                </div>
                <p className="relative mt-3 text-center text-xs text-slate-400">
                  Light · story · community
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {moments.slice(1).map((m) => (
                  <div
                    key={m.src}
                    className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/12 bg-slate-900/60"
                  >
                    <Image
                      src={m.src}
                      alt={m.alt}
                      fill
                      sizes="(max-width: 768px) 45vw, 200px"
                      className="object-cover transition duration-500 hover:scale-[1.04]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── What we do ── */}
        <motion.section
          ref={pillarsRef}
          className="mb-12 md:mb-16"
          initial={{ opacity: 0, y: 12 }}
          animate={
            isPillarsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
          }
          transition={spring.default}
        >
          <div className="mb-5 text-center sm:mb-7">
            <h2 className="section-title mx-auto !mb-2 inline-block border-0 pb-0">
              What we do
            </h2>
            <p className="mx-auto max-w-md text-sm text-slate-400">
              Four ways IRIS keeps the shutter clicking and the community growing.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
            variants={staggerContainer}
            initial="hidden"
            animate={isPillarsInView ? "visible" : "hidden"}
          >
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <motion.article
                  key={pillar.title}
                  variants={staggerItem}
                  whileHover={{ y: -3, transition: spring.snappy }}
                  className="glass-card-event group relative overflow-hidden rounded-2xl p-5 sm:p-6"
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-80 blur-2xl transition group-hover:opacity-100",
                      pillar.tone
                    )}
                    aria-hidden
                  />
                  <div className="relative flex items-start gap-3.5">
                    <span className="event-glass-chip flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#c8c7ff]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold tracking-tight text-white">
                        {pillar.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                        {pillar.copy}
                      </p>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        </motion.section>

        {/* ── Community mosaic ── */}
        <motion.section
          className="mb-12 md:mb-16"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={spring.default}
        >
          <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="section-title !mb-1 border-0 pb-0">In the frame</h2>
              <p className="text-sm text-slate-400">
                A glimpse of the people and moments that make IRIS.
              </p>
            </div>
            <Link
              href="/gallery"
              className="event-glass-chip inline-flex min-h-[36px] w-fit items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-medium text-sky-100 transition hover:bg-white/10 active:scale-95 sm:self-auto"
            >
              Full gallery
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:gap-4">
            <div className="relative col-span-2 aspect-[16/10] overflow-hidden rounded-2xl border border-white/12 bg-slate-900/50 sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[280px] md:min-h-[320px]">
              <Image
                src={moments[0].src}
                alt={moments[0].alt}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4">
                <p className="text-sm font-semibold text-white sm:text-base">
                  Community in focus
                </p>
                <p className="text-xs text-slate-300">Events, walks &amp; workshops</p>
              </div>
            </div>

            {moments.slice(1).map((m) => (
              <div
                key={m.src}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/12 bg-slate-900/50 sm:aspect-auto sm:min-h-[136px] md:min-h-[152px]"
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

            {/* Logo tile: fully visible, never cropped */}
            <div className="glass-card-event relative col-span-2 flex min-h-[140px] items-center justify-center overflow-hidden rounded-2xl sm:col-span-1 sm:min-h-[136px] md:min-h-[152px]">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,48,224,0.35),transparent_70%)]"
                aria-hidden
              />
              <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                <Image
                  src="/images/logo.png"
                  alt="IRIS logo"
                  fill
                  sizes="96px"
                  className="object-contain p-1"
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Timeline ── */}
        <motion.section
          className="mb-12 md:mb-16"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={spring.default}
        >
          <div className="mb-5 text-center sm:mb-7">
            <h2 className="section-title mx-auto !mb-2 inline-block border-0 pb-0">
              How we got here
            </h2>
            <p className="mx-auto max-w-md text-sm text-slate-400">
              From a new club to a full creative society.
            </p>
          </div>

          <div className="relative mx-auto max-w-3xl">
            {/* Vertical rail on desktop */}
            <div
              className="pointer-events-none absolute left-[1.05rem] top-3 bottom-3 w-px bg-gradient-to-b from-[#3230e0]/50 via-white/15 to-transparent sm:left-1/2 sm:-translate-x-px"
              aria-hidden
            />

            <ol className="space-y-3 sm:space-y-0">
              {timeline.map((item, i) => (
                <li
                  key={item.when}
                  className={cn(
                    "relative sm:flex sm:items-start sm:gap-8 sm:pb-8",
                    i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                  )}
                >
                  <div className="hidden sm:block sm:w-1/2" />
                  <span
                    className="absolute left-3 top-5 z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#3230e0] ring-4 ring-[#0F1013] sm:left-1/2 sm:top-6"
                    aria-hidden
                  />
                  <div className="glass-card-event ml-8 rounded-2xl p-4 sm:ml-0 sm:w-1/2 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-300/90">
                      {item.when}
                    </p>
                    <h3 className="mt-1 text-base font-semibold tracking-tight text-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                      {item.copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </motion.section>

        {/* ── Closing CTA ── */}
        <motion.section
          className="mb-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={spring.default}
        >
          <div className="glass-card-event relative overflow-hidden rounded-3xl px-5 py-8 text-center sm:px-8 sm:py-10 md:px-12">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(50,48,224,0.35),transparent_55%)]"
              aria-hidden
            />
            <div className="relative mx-auto mb-4 h-16 w-16 sm:h-20 sm:w-20">
              <Image
                src="/images/logo.png"
                alt=""
                fill
                sizes="80px"
                className="object-contain"
                aria-hidden
              />
            </div>
            <h2 className="relative text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Ready to shoot with us?
            </h2>
            <p className="relative mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-300">
              Join the WhatsApp community, walk with us on campus, or apply when
              core recruitment opens.
            </p>
            <div className="relative mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center sm:gap-3">
              <Link
                href="/join"
                className="btn-primary !min-h-[44px] !px-5 !py-2.5 !text-sm"
              >
                Join IRIS
              </Link>
              <Link
                href="/contact"
                className="btn-secondary !min-h-[44px] !px-5 !py-2.5 !text-sm"
              >
                Contact us
              </Link>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  )
}
