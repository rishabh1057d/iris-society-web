"use client"

import { useRef } from "react"
import Link from "next/link"
import { Instagram, Linkedin, ExternalLink } from "lucide-react"
import { motion, useInView } from "framer-motion"
import ResponsiveContainer from "./responsive-container"
import { spring } from "@/lib/motion"

const socials = [
  {
    href: "https://linktr.ee/iris_iitm",
    label: "Linktree — all IRIS Society links",
    icon: ExternalLink,
    hover: "hover:text-emerald-400 hover:bg-emerald-400/10",
  },
  {
    href: "https://www.instagram.com/iris_iitm",
    label: "Instagram — IRIS Society",
    icon: Instagram,
    hover: "hover:text-pink-400 hover:bg-pink-400/10",
  },
  {
    href: "https://www.linkedin.com/company/iris-camera-society/",
    label: "LinkedIn — IRIS Camera Society",
    icon: Linkedin,
    hover: "hover:text-sky-400 hover:bg-sky-400/10",
  },
]

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null)
  const isFooterInView = useInView(footerRef, { once: true, margin: "-80px 0px" })

  return (
    <motion.footer
      ref={footerRef}
      className="w-full mt-auto relative z-20"
      initial={{ opacity: 0, y: 12 }}
      animate={isFooterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={spring.default}
    >
      {/*
        Opaque solid footer — no translucent gradient that leaves a purple mesh
        “stripe” under the copyright block. Safe-area padding uses the same fill.
      */}
      <div
        className="relative w-full border-t border-white/[0.08]"
        style={{
          backgroundColor: "#020617",
          // Extend past the viewport bottom so no mesh peeks through subpixels / safe area
          boxShadow: "0 1px 0 0 #020617",
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <ResponsiveContainer size="lg" padding="md">
          <div className="pt-8 md:pt-10 pb-2 text-center">
            <p className="text-sm text-slate-400 tracking-wide m-0">
              © {new Date().getFullYear()} IRIS Society. All rights reserved.
            </p>
            <p className="mt-1 mb-0 text-xs text-slate-500">
              Photography &amp; Videography · IIT Madras BS
            </p>

            <nav
              className="flex justify-center items-center gap-2 mt-5"
              aria-label="Social links"
            >
              {socials.map(({ href, label, icon: Icon, hover }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-slate-400 transition-colors active:scale-95 ${hover}`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </Link>
              ))}
            </nav>
          </div>
        </ResponsiveContainer>
      </div>
    </motion.footer>
  )
}

export { Footer }
