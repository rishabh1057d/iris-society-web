"use client"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import Footer from "@/components/footer"
import Image from "next/image"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { X } from "lucide-react"
import { spring } from "@/lib/motion"

type GalleryItem = {
  id: number
  src: string
  photographer: string
  alt?: string
}

type ImageMeta = {
  width: number
  height: number
  aspectRatio: number
}

/** Creative span pattern — builds a photography “spread”, not a flat grid */
function getTileSpan(index: number, aspectRatio: number | undefined): string {
  // Wide panoramas claim more columns
  if (aspectRatio && aspectRatio >= 1.7) return "md:col-span-2 md:row-span-1"
  // Tall portraits claim more height
  if (aspectRatio && aspectRatio <= 0.75) return "md:row-span-2"
  // Rhythmic hero tiles
  if (index % 11 === 0) return "md:col-span-2 md:row-span-2"
  if (index % 7 === 3) return "md:col-span-2"
  if (index % 5 === 2) return "md:row-span-2"
  return ""
}

export default function Gallery() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const isTitleInView = useInView(titleRef, { once: true })

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loadedImages, setLoadedImages] = useState<Record<number, ImageMeta>>({})
  const [selected, setSelected] = useState<GalleryItem | null>(null)
  const [lightboxReady, setLightboxReady] = useState(false)

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

  const handleImageLoad = useCallback(
    (id: number, e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = e.currentTarget
      if (!naturalWidth || !naturalHeight) return
      setLoadedImages((prev) => {
        if (prev[id]) return prev
        return {
          ...prev,
          [id]: {
            width: naturalWidth,
            height: naturalHeight,
            aspectRatio: naturalWidth / naturalHeight,
          },
        }
      })
    },
    []
  )

  const tiles = useMemo(
    () =>
      galleryItems.map((item, index) => ({
        item,
        index,
        meta: loadedImages[item.id],
        span: getTileSpan(index, loadedImages[item.id]?.aspectRatio),
      })),
    [galleryItems, loadedImages]
  )

  return (
    <div className="flex min-h-full flex-1 flex-col relative">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-transparent to-violet-950/40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(90vw,48rem)] h-64 bg-gradient-to-b from-sky-500/15 to-transparent blur-3xl" />
      </div>

      <div className="page-shell max-w-[90rem] flex-1 relative z-10 pb-4">
        <motion.header
          ref={titleRef}
          className="page-hero mb-10 md:mb-12"
          initial={{ opacity: 0, y: 12 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-sky-300/80 mb-3 font-medium">
            Member work
          </p>
          <h1 className="page-hero-title">Gallery</h1>
          <p className="page-hero-sub">
            Frames from competitions, walks, and late-night edits — a living archive of how
            IRIS sees the world.
          </p>
        </motion.header>

        {/*
          Creative bento-style CSS grid:
          - auto-rows create a modular “film wall”
          - selected tiles span 2× / 2×2 for visual rhythm
          - natural object-cover inside the cell; tall/wide get more room
        */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4 auto-rows-[140px] sm:auto-rows-[160px] md:auto-rows-[180px] lg:auto-rows-[200px]"
        >
          {tiles.map(({ item, index, meta, span }) => {
            const isPriority = index < 10
            const isHero = index % 11 === 0

            return (
              <motion.button
                type="button"
                key={item.id}
                onClick={() => {
                  setLightboxReady(false)
                  setSelected(item)
                }}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 ${span} ${
                  isHero ? "col-span-2 row-span-2" : ""
                }`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "60px" }}
                transition={{ ...spring.default, delay: Math.min(index * 0.015, 0.2) }}
                whileHover={{ y: -2, transition: spring.snappy }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Soft vignette always present — GPU-cheap, no blur lag */}
                <div
                  className="absolute inset-0 z-[1] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 45%, transparent 70%)",
                  }}
                />

                {!meta && (
                  <div className="absolute inset-0 loading-skeleton z-0" aria-hidden />
                )}

                <Image
                  src={item.src || "/placeholder.svg"}
                  alt={item.alt || `Photo by ${item.photographer}`}
                  fill
                  className={`object-cover transition-transform duration-500 ease-out will-change-transform ${
                    meta ? "opacity-100 group-hover:scale-[1.04]" : "opacity-0"
                  }`}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  quality={86}
                  priority={isPriority}
                  loading={isPriority ? "eager" : "lazy"}
                  onLoad={(e) => handleImageLoad(item.id, e)}
                />

                {/* Caption: solid gradient strip — never backdrop-filter (kills hover lag) */}
                <div className="absolute inset-x-0 bottom-0 z-[2] p-2.5 sm:p-3 translate-y-1 opacity-100 sm:translate-y-2 sm:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-[opacity,transform] duration-150 ease-out">
                  <div className="rounded-lg bg-black/70 px-2.5 py-1.5 border border-white/10">
                    <p className="text-white text-xs sm:text-sm font-medium tracking-wide truncate">
                      {item.photographer}
                    </p>
                  </div>
                </div>

                {/* Corner accent for hero tiles */}
                {isHero && (
                  <div className="absolute top-2.5 left-2.5 z-[2] rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/80">
                    Feature
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>

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
                    alt={`Photo by ${selected.photographer}`}
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
