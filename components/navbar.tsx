"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { spring } from "@/lib/motion"

interface NavbarProps {
  onJoinClick?: () => void
}

const JOIN_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSczSzMGIAd-sE_nxe9wOFSrsYy59lzRBhU9e5uhOjMtmIquLQ/viewform"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/events/register", label: "Register" },
  { href: "/meetups", label: "Photowalks" },
  { href: "/potw", label: "POTW" },
  { href: "/gallery", label: "Gallery" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Contact" },
]

export default function Navbar({ onJoinClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change (interruptible navigation)
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Lock body scroll when sheet open
  useEffect(() => {
    if (!isMenuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isMenuOpen])

  // Escape closes menu
  useEffect(() => {
    if (!isMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isMenuOpen])

  const closeMenu = useCallback(() => setIsMenuOpen(false), [])
  const toggleMenu = () => setIsMenuOpen((v) => !v)

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const joinButton = (className: string, onClick?: () => void) =>
    onJoinClick ? (
      <button
        type="button"
        onClick={() => {
          onJoinClick()
          onClick?.()
        }}
        className={className}
      >
        Be a member
      </button>
    ) : (
      <Link
        href={JOIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        Be a member
      </Link>
    )

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-[100] w-full max-w-[100vw] transition-[padding,background] duration-300 ease-out ${
          scrolled || isMenuOpen ? "glass-nav scrolled py-2" : "bg-transparent py-3 md:py-4"
        }`}
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={spring.soft}
        role="navigation"
        aria-label="Main"
      >
        <div className="container mx-auto px-4 sm:px-5 flex items-center justify-between gap-3">
          {/* Logo — always top-left wayfinding */}
          <Link
            href="/"
            className="flex items-center gap-2.5 min-h-[44px] rounded-full pr-2 -ml-1 hover:bg-white/5 active:scale-[0.98] transition-transform"
            onClick={closeMenu}
          >
            <Image
              src="/images/logo.png"
              alt="IRIS Society"
              width={scrolled ? 32 : 40}
              height={scrolled ? 32 : 40}
              className="transition-all duration-300 shrink-0"
              priority
            />
            <span
              className={`font-semibold text-white tracking-tight transition-all duration-300 ${
                scrolled ? "text-base" : "text-lg"
              }`}
            >
              IRIS Society
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive(item.href) ? "active" : ""}`}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            {joinButton(`btn-nav-cta ${scrolled ? "btn-nav-cta-scrolled" : ""}`)}
          </div>

          {/* Mobile menu control — feedback on press */}
          <button
            ref={menuButtonRef}
            type="button"
            onClick={toggleMenu}
            className="lg:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-gray-200 hover:text-white hover:bg-white/10 active:scale-95 transition-transform"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-panel"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile sheet — slides from top (same path enter/exit), spring, interruptible */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={spring.snappy}
              onClick={closeMenu}
              aria-hidden
            />
            <motion.div
              id="mobile-nav-panel"
              ref={panelRef}
              className="fixed top-[3.75rem] left-3 right-3 z-[110] max-w-[100vw] lg:hidden rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={spring.snappy}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain p-2 space-y-0.5 safe-area-inset-bottom">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring.snappy, delay: index * 0.03 }}
                  >
                    <Link
                      href={item.href}
                      className={`mobile-nav-link ${isActive(item.href) ? "active" : ""}`}
                      onClick={closeMenu}
                      aria-current={isActive(item.href) ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-2 pb-1 px-1 border-t border-white/10 mt-1">
                  {joinButton("btn-mobile-cta", closeMenu)}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export { Navbar }
