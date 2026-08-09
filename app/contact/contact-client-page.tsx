"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Instagram,
  Linkedin,
  Mail,
  ExternalLink,
  Camera,
  Users,
} from "lucide-react"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import Footer from "@/components/footer"
import { spring, staggerContainer, staggerItem } from "@/lib/motion"
import { cn } from "@/lib/utils"

const channels = [
  {
    href: "mailto:photography.society@study.iitm.ac.in",
    external: false,
    icon: Mail,
    title: "Email",
    detail: "photography.society@study.iitm.ac.in",
    cta: "Write to us",
    tone: "text-sky-200 bg-[#3230e0]/20 ring-[#3230e0]/35",
  },
  {
    href: "https://www.instagram.com/iris_iitm",
    external: true,
    icon: Instagram,
    title: "Instagram",
    detail: "@iris_iitm",
    cta: "Open profile",
    tone: "text-pink-200 bg-pink-500/15 ring-pink-400/30",
  },
  {
    href: "https://www.linkedin.com/company/iris-camera-society/",
    external: true,
    icon: Linkedin,
    title: "LinkedIn",
    detail: "IRIS Camera Society",
    cta: "Follow",
    tone: "text-sky-200 bg-sky-500/15 ring-sky-400/30",
  },
  {
    href: "https://linktr.ee/iris_iitm",
    external: true,
    icon: ExternalLink,
    title: "Linktree",
    detail: "All IRIS links in one place",
    cta: "Open",
    tone: "text-emerald-200 bg-emerald-500/15 ring-emerald-400/30",
  },
]

const quickLinks = [
  {
    href: "/join",
    title: "Join IRIS",
    copy: "Become a member of the society",
    icon: Users,
  },
  {
    href: "/events",
    title: "Events",
    copy: "Workshops, competitions, showcases",
    icon: Camera,
  },
  {
    href: "/team",
    title: "Meet the team",
    copy: "Who keeps IRIS in focus",
    icon: Users,
  },
]

export default function ContactClientPage() {
  const heroRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true })
  const bodyInView = useInView(bodyRef, { once: true, margin: "-40px" })

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#3230e0]/16 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 h-64 w-64 rounded-full bg-[#5b59f0]/10 blur-3xl" />
      </div>

      <div className="page-shell relative z-10 max-w-6xl flex-1">
        <motion.header
          ref={heroRef}
          className="page-hero mb-8 md:mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.2em] text-sky-200/75">
            Reach out
          </p>
          <h1 className="page-hero-title">Contact</h1>
          <p className="page-hero-sub">
            Collaborations, questions, or a simple hello. Email and socials are
            open; we usually reply within a day.
          </p>
        </motion.header>

        <motion.div
          ref={bodyRef}
          initial={{ opacity: 0, y: 14 }}
          animate={bodyInView ? { opacity: 1, y: 0 } : {}}
          transition={spring.default}
          className="grid items-start gap-6 md:grid-cols-12 md:gap-8"
        >
          {/* Visual */}
          <div className="order-2 md:order-1 md:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-black/30">
              <div className="relative aspect-[4/5] w-full sm:aspect-[5/6] md:aspect-[4/5]">
                <Image
                  src="/images/collage.png"
                  alt="Collage of photos by IRIS Society members"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0F1013]/80 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="text-sm font-medium text-white">IRIS in frames</p>
                  <p className="mt-0.5 text-xs text-slate-300">
                    Moments from the community
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="order-1 md:order-2 md:col-span-7">
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                Ways to reach us
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Pick a channel. External links open in a new tab.
              </p>
            </div>

            <motion.div
              className="flex flex-col border-t border-white/10"
              variants={staggerContainer}
              initial="hidden"
              animate={bodyInView ? "visible" : "hidden"}
            >
              {channels.map((ch) => {
                const Icon = ch.icon
                const className = cn(
                  "group flex min-h-[64px] items-center gap-3 border-b border-white/10 py-4 transition",
                  "active:bg-white/[0.03] sm:gap-4 sm:py-5",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3230e0]/50"
                )
                const body = (
                  <>
                    <span
                      className={cn(
                        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
                        ch.tone
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white sm:text-base">
                        {ch.title}
                      </p>
                      <p className="mt-0.5 break-all text-xs text-slate-400 sm:text-sm">
                        {ch.detail}
                      </p>
                    </div>
                    <span className="hidden shrink-0 items-center gap-1 text-xs font-medium text-slate-500 transition group-hover:text-sky-200 sm:inline-flex">
                      {ch.cta}
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 sm:hidden" />
                  </>
                )

                if (ch.external) {
                  return (
                    <motion.div key={ch.title} variants={staggerItem}>
                      <Link
                        href={ch.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                      >
                        {body}
                      </Link>
                    </motion.div>
                  )
                }

                return (
                  <motion.div key={ch.title} variants={staggerItem}>
                    <a href={ch.href} className={className}>
                      {body}
                    </a>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Quick paths */}
            <div className="mt-8 md:mt-10">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-sky-200/70">
                Also nearby
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
                {quickLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="event-glass group flex min-h-[72px] items-start gap-3 rounded-xl px-3.5 py-3.5 transition hover:bg-white/[0.06] active:scale-[0.99] sm:flex-col sm:gap-2"
                    >
                      <span className="event-glass-chip inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#c8c7ff]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-[#c8c7ff]">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-snug text-slate-400">
                          {item.copy}
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
