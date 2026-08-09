"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Instagram,
  Linkedin,
  Mail,
  ExternalLink,
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
  },
  {
    href: "https://www.instagram.com/iris_iitm",
    external: true,
    icon: Instagram,
    title: "Instagram",
    detail: "@iris_iitm",
  },
  {
    href: "https://www.linkedin.com/company/iris-camera-society/",
    external: true,
    icon: Linkedin,
    title: "LinkedIn",
    detail: "IRIS Camera Society",
  },
  {
    href: "https://linktr.ee/iris_iitm",
    external: true,
    icon: ExternalLink,
    title: "Linktree",
    detail: "All society links",
  },
]

export default function ContactClientPage() {
  const heroRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef, { once: true })
  const contentInView = useInView(contentRef, { once: true, margin: "-40px" })

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-[#3230e0]/14 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 h-56 w-56 rounded-full bg-[#5b59f0]/10 blur-3xl" />
      </div>

      <div className="page-shell relative z-10 max-w-5xl flex-1">
        <motion.header
          ref={heroRef}
          className="page-hero mb-8 md:mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <h1 className="page-hero-title">Contact</h1>
          <p className="page-hero-sub">
            Collaborations, questions, or a simple hello. We usually reply
            within a day.
          </p>
        </motion.header>

        <motion.div
          ref={contentRef}
          initial={{ opacity: 0, y: 14 }}
          animate={contentInView ? { opacity: 1, y: 0 } : {}}
          transition={spring.default}
          className="mx-auto grid max-w-4xl gap-10 md:grid-cols-2 md:items-center md:gap-12 lg:gap-16"
        >
          {/*
            Full collage, never cropped.
            Square asset (1080x1080) sits in a square stage with object-contain.
          */}
          <div className="mx-auto w-full max-w-sm md:max-w-none">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c] p-2 sm:p-3">
              <div className="relative aspect-square w-full">
                <Image
                  src="/images/collage.png"
                  alt="Collage of photos by IRIS Society members"
                  fill
                  sizes="(max-width: 768px) 90vw, 400px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-slate-500 md:text-left">
              Moments from the IRIS community
            </p>
          </div>

          {/* Channels: simple list, not heavy glass cards */}
          <div className="w-full min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">
              Get in touch
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Email or socials. External links open in a new tab.
            </p>

            <motion.nav
              className="mt-6 border-t border-white/10"
              aria-label="Contact channels"
              variants={staggerContainer}
              initial="hidden"
              animate={contentInView ? "visible" : "hidden"}
            >
              {channels.map((ch) => {
                const Icon = ch.icon
                const className = cn(
                  "group flex min-h-[60px] items-center gap-3.5 border-b border-white/10 py-4 transition",
                  "hover:bg-white/[0.03] active:bg-white/[0.05]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3230e0]/50"
                )
                const inner = (
                  <>
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[#c8c7ff] ring-1 ring-white/10 transition group-hover:bg-[#3230e0]/25 group-hover:ring-[#3230e0]/40">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white sm:text-[15px]">
                        {ch.title}
                      </p>
                      <p className="mt-0.5 break-all text-xs text-slate-400 sm:text-sm">
                        {ch.detail}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-sky-200" />
                  </>
                )

                return (
                  <motion.div key={ch.title} variants={staggerItem}>
                    {ch.external ? (
                      <Link
                        href={ch.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                      >
                        {inner}
                      </Link>
                    ) : (
                      <a href={ch.href} className={className}>
                        {inner}
                      </a>
                    )}
                  </motion.div>
                )
              })}
            </motion.nav>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link
                href="/join"
                className="text-slate-400 transition hover:text-white"
              >
                Join IRIS
              </Link>
              <span className="text-slate-700" aria-hidden>
                ·
              </span>
              <Link
                href="/team"
                className="text-slate-400 transition hover:text-white"
              >
                Team
              </Link>
              <span className="text-slate-700" aria-hidden>
                ·
              </span>
              <Link
                href="/about"
                className="text-slate-400 transition hover:text-white"
              >
                About
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
