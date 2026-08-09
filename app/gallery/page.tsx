"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import Footer from "@/components/footer"
import Image from "next/image"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { X } from "lucide-react"
import { spring } from "@/lib/motion"
import SocialCards, { type CardItem } from "@/components/ui/card-fan-carousel"

type GalleryItem = {
  id: number
  src: string
  photographer: string
  alt?: string
}

/**
 * Gallery photos always come from /gallery_photos.json (IRIS member work).
 * No Unsplash / demo cards are used.
 */
export default function Gallery() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const isTitleInView = useInView(titleRef, { once: true })

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [selected, setSelected] = useState<GalleryItem | null>(null)
  const [lightboxReady, setLightboxReady] = useState(false)
  /** lg and up → desktop fan; below → mobile fan */
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const apply = () => setIsDesktop(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    fetch("/gallery_photos.json")
      .then((res) => res.json())
      .then((data: GalleryItem[]) => {
        setGalleryItems([...data].sort((a, b) => b.id - a.id))
      })
      .catch(() => setGalleryItems([]))
  }, [])

  useEffect(() => {
    if (!selected) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [selected])

  const openLightbox = useCallback((item: GalleryItem) => {
    setLightboxReady(false)
    setSelected(item)
  }, [])

  /** Real gallery assets only — paths from public/gallery_photos.json */
  const fanCards: CardItem[] = useMemo(
    () =>
      galleryItems.map((item) => ({
        imgUrl: item.src,
        alt: item.alt || `Photo by ${item.photographer}`,
        onClick: () => openLightbox(item),
      })),
    [galleryItems, openLightbox]
  )

  return (
    <div className="flex min-h-full flex-1 flex-col relative overflow-x-clip max-w-[100vw]">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-[#3230e0]/20 via-transparent to-[#0F1013]/40" />
        <div className="absolute top-1/4 left-1/3 w-[28rem] h-[28rem] rounded-full bg-[#3230e0]/12 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[24rem] h-[24rem] rounded-full bg-[#5b59f0]/10 blur-3xl" />
      </div>

      <div className="page-shell max-w-[90rem] flex-1 relative z-10 w-full overflow-x-clip">
        <motion.header
          ref={titleRef}
          className="page-hero mb-3 sm:mb-6 md:mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <h1 className="page-hero-title">Visual Stories</h1>
          <p className="page-hero-sub">
            Moments that inspire, stories that resonate, and memories that last.
          </p>
        </motion.header>

        {galleryItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring.soft}
            className="mb-6 sm:mb-8 w-full max-w-full overflow-x-clip"
          >
            <SocialCards
              key={isDesktop ? "desktop" : "mobile"}
              cards={fanCards}
              layout={isDesktop ? "desktop" : "mobile"}
            />
          </motion.div>
        )}

        {galleryItems.length === 0 && (
          <p className="text-center text-slate-400 py-16">No photos in the gallery yet.</p>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={spring.snappy}
            role="dialog"
            aria-modal="true"
            aria-label={`Photo by ${selected.photographer}`}
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/70"
              aria-label="Close photo"
              onClick={() => setSelected(null)}
            />

            <motion.div
              className="relative z-10 w-full max-w-5xl max-h-[min(92dvh,900px)] flex flex-col rounded-2xl border border-white/12 bg-[#020617]/95 shadow-2xl overflow-hidden"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={spring.snappy}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10">
                <p className="text-white font-medium tracking-tight truncate">
                  {selected.photographer}
                </p>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-white/80 hover:bg-white/10 active:scale-95 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative flex-1 min-h-0 flex items-center justify-center p-3 sm:p-5 bg-black/40">
                {!lightboxReady && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-9 h-9 rounded-full border-2 border-white/15 border-t-sky-400 animate-spin" />
                  </div>
                )}
                <div className="relative w-full h-[min(70dvh,720px)]">
                  <Image
                    src={selected.src || "/placeholder.svg"}
                    alt={selected.alt || `Photo by ${selected.photographer}`}
                    fill
                    className={`object-contain transition-opacity duration-200 ${
                      lightboxReady ? "opacity-100" : "opacity-0"
                    }`}
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    quality={92}
                    priority
                    onLoad={() => setLightboxReady(true)}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
