"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Footer from "@/components/footer"
import Image from "next/image"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { X } from "lucide-react"
import { spring } from "@/lib/motion"

type GalleryItem = {
  id: number
  src: string
  photographer: string
}

type ImageMeta = {
  width: number
  height: number
  aspectRatio: number
}

export default function Gallery() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const isTitleInView = useInView(titleRef, { once: true })

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loadedImages, setLoadedImages] = useState<Record<number, ImageMeta>>({})
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [selected, setSelected] = useState<GalleryItem | null>(null)
  const [lightboxReady, setLightboxReady] = useState(false)

  useEffect(() => {
    fetch("/gallery_photos.json")
      .then((res) => res.json())
      .then((data: GalleryItem[]) => {
        // Newest first
        setGalleryItems([...data].sort((a, b) => b.id - a.id))
      })
      .catch(() => setGalleryItems([]))
  }, [])

  useEffect(() => {
    const loadedCount = Object.keys(loadedImages).length
    const total = galleryItems.length
    if (!imagesLoaded && total > 0 && loadedCount >= Math.min(10, total)) {
      setImagesLoaded(true)
    }
  }, [loadedImages, imagesLoaded, galleryItems.length])

  useEffect(() => {
    const t = setTimeout(() => setImagesLoaded(true), 2500)
    return () => clearTimeout(t)
  }, [])

  // Escape closes lightbox; lock body scroll while open
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
      const img = e.currentTarget
      const { naturalWidth, naturalHeight } = img
      if (!naturalWidth || !naturalHeight) return
      setLoadedImages((prev) => ({
        ...prev,
        [id]: {
          width: naturalWidth,
          height: naturalHeight,
          aspectRatio: naturalWidth / naturalHeight,
        },
      }))
    },
    []
  )

  const openLightbox = (item: GalleryItem) => {
    setLightboxReady(false)
    setSelected(item)
  }

  return (
    <div className="flex min-h-full flex-1 flex-col relative">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-transparent to-violet-950/30" />
        <div className="absolute top-1/4 left-1/3 w-[28rem] h-[28rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[24rem] h-[24rem] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="page-shell max-w-[88rem] flex-1 relative z-10">
        <motion.header
          ref={titleRef}
          className="page-hero mb-10 md:mb-14"
          initial={{ opacity: 0, y: 12 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={spring.default}
        >
          <h1 className="page-hero-title">Gallery</h1>
          <p className="page-hero-sub">
            A living collection of work from IRIS members — every frame keeps its natural
            shape.
          </p>
        </motion.header>

        {/*
          Unified masonry for all viewports (no desktop circular gallery).
          CSS columns + break-inside: avoid → any aspect ratio sits correctly.
          Glass frame wraps each photo.
        */}
        <motion.div
          className="columns-1 xs:columns-2 md:columns-3 xl:columns-4 gap-3 sm:gap-4 md:gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={spring.soft}
        >
          {galleryItems.map((item, index) => {
            const meta = loadedImages[item.id]
            const isPriority = index < 8

            return (
              <motion.button
                type="button"
                key={item.id}
                onClick={() => openLightbox(item)}
                className="gallery-item group mb-3 sm:mb-4 md:mb-5 w-full break-inside-avoid text-left rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "80px" }}
                transition={{ ...spring.default, delay: Math.min(index * 0.02, 0.24) }}
                whileHover={{ y: -2, transition: spring.snappy }}
                whileTap={{ scale: 0.995 }}
              >
                {/* Natural aspect box — image never forced into a fixed crop ratio */}
                <div
                  className="relative w-full overflow-hidden bg-slate-900/50"
                  style={{
                    aspectRatio: meta ? String(meta.aspectRatio) : "4 / 5",
                  }}
                >
                  {!meta && (
                    <div className="absolute inset-0 loading-skeleton" aria-hidden />
                  )}
                  <Image
                    src={item.src || "/placeholder.svg"}
                    alt={`Photo by ${item.photographer}`}
                    fill
                    className={`object-cover transition-[transform,opacity,filter] duration-500 ease-out ${
                      meta ? "opacity-100 group-hover:scale-[1.03]" : "opacity-0"
                    }`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    quality={88}
                    priority={isPriority}
                    loading={isPriority ? "eager" : "lazy"}
                    onLoad={(e) => handleImageLoad(item.id, e)}
                  />

                  {/* Glass caption bar — materializes on hover / always readable on touch */}
                  <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-300">
                    <div className="rounded-xl border border-white/12 bg-black/45 backdrop-blur-xl px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <p className="text-white text-sm font-medium tracking-wide truncate">
                        {item.photographer}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {galleryItems.length === 0 && imagesLoaded && (
          <p className="text-center text-slate-400 py-16">No photos in the gallery yet.</p>
        )}
      </div>

      {/* Lightbox — dim scrim + glass panel, image object-contain for any size */}
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
              className="absolute inset-0 bg-black/65 backdrop-blur-md"
              aria-label="Close photo"
              onClick={() => setSelected(null)}
            />

            <motion.div
              className="relative z-10 w-full max-w-5xl max-h-[min(92dvh,900px)] flex flex-col rounded-2xl border border-white/15 bg-slate-950/80 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] overflow-hidden"
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

              <div className="relative flex-1 min-h-0 flex items-center justify-center p-3 sm:p-5 bg-black/30">
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
                    className={`object-contain transition-opacity duration-300 ${
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

      {/* Soft load hint (does not block interaction after timeout) */}
      <AnimatePresence>
        {!imagesLoaded && galleryItems.length > 0 && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={spring.snappy}
          >
            <div className="rounded-full border border-white/12 bg-slate-950/80 backdrop-blur-xl px-4 py-2 shadow-lg">
              <p className="text-xs text-slate-300">
                Loading photos… {Object.keys(loadedImages).length}/{galleryItems.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
