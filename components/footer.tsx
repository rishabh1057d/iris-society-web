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
      className="w-full mt-auto relative z-20 safe-area-inset-bottom"
      initial={{ opacity: 0, y: 12 }}
      animate={isFooterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={spring.default}
    >
      {/*
        Single continuous material — no 1px hairline or hard cut against the mesh.
        Soft top fade only (mask), solid enough body so no “blank stripe” shows through.
      */}
      <div
        className="relative border-t border-white/[0.06]"
        style={{
          background:
            "linear-gradient(180deg, rgba(2,6,16,0.35) 0%, rgba(2,6,16,0.72) 40%, rgba(2,6,16,0.88) 100%)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
        }}
      >
        <ResponsiveContainer size="lg" padding="md">
          <div className="py-8 md:py-10 text-center">
            <p className="text-sm text-slate-400 tracking-wide">
              © {new Date().getFullYear()} IRIS Society. All rights reserved.
            </p>
            <p className="mt-1 text-xs text-slate-500">
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
