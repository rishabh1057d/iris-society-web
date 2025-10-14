"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import CircularGallery from "@/components/circular-gallery"

export default function Gallery() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const isTitleInView = useInView(titleRef, { once: true })

  // Store loaded images and their dimensions
  const [loadedImages, setLoadedImages] = useState<{
    [id: number]: { width: number; height: number; aspectRatio: number }
  }>({})
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">("desktop")
  const [hoveredImage, setHoveredImage] = useState<number | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Gallery items state (fetched from JSON)
  const [galleryItems, setGalleryItems] = useState<any[]>([])

  // Track screen size for responsive grid
  useEffect(() => {
    const updateScreenSize = () => {
      if (window.innerWidth < 640) {
        setScreenSize("mobile")
      } else if (window.innerWidth < 1024) {
        setScreenSize("tablet")
      } else {
        setScreenSize("desktop")
      }
    }

    updateScreenSize()
    window.addEventListener("resize", updateScreenSize)
    return () => window.removeEventListener("resize", updateScreenSize)
  }, [])

  // Track scroll progress for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollTop / docHeight
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch gallery items from JSON
  useEffect(() => {
    fetch("/gallery_photos.json")
      .then((res) => res.json())
      .then((data) => setGalleryItems(data))
      .catch((err) => {
        console.error("Failed to load gallery photos:", err)
        setGalleryItems([])
      })
  }, [])

  // Optimized loading - hide loading indicator after first batch loads or timeout
  useEffect(() => {
    const loadedCount = Object.keys(loadedImages).length
    const totalCount = galleryItems.length
    
    // Hide loading after first 8 images load or 2 seconds, whichever comes first
    if (!imagesLoaded && (loadedCount >= Math.min(8, totalCount) || loadedCount >= totalCount)) {
      setImagesLoaded(true)
    }
  }, [loadedImages, imagesLoaded, galleryItems.length])

  // Fallback timeout to hide loading indicator
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!imagesLoaded) {
        setImagesLoaded(true)
      }
    }, 2000) // Hide after 2 seconds regardless

    return () => clearTimeout(timeout)
  }, [imagesLoaded])

  const handleImageLoad = useCallback((id: number, e: any) => {
    const { naturalWidth, naturalHeight } = e.target
    const aspectRatio = naturalWidth / naturalHeight

    setLoadedImages((prev) => {
      const updated = {
        ...prev,
        [id]: {
          width: naturalWidth,
          height: naturalHeight,
          aspectRatio,
        },
      }

      if (Object.keys(updated).length === galleryItems.length) {
        setImagesLoaded(true)
      }

      return updated
    })
  }, [galleryItems.length])


  // Enhanced grid configuration with more dynamic sizing
  const getGridConfig = () => {
    switch (screenSize) {
      case "mobile":
        return {
          columns: 2,
          baseWidth: 160,
          gap: 6,
          maxSpan: 2,
        }
      case "tablet":
        return {
          columns: 3,
          baseWidth: 200,
          gap: 10,
          maxSpan: 2,
        }
      default:
        return {
          columns: 4,
          baseWidth: 240,
          gap: 14,
          maxSpan: 3,
        }
    }
  }

  // Calculate dynamic grid item properties with enhanced logic
  const getGridItemProperties = (item: any, index: number) => {
    const imageData = loadedImages[item.id]
    const config = getGridConfig()

    if (!imageData) {
      return {
        colSpan: 1,
        aspectRatio: 1,
        priority: 0,
        size: "normal"
      }
    }

    const { aspectRatio } = imageData
    let colSpan = 1
    let priority = 0
    let size = "normal"

    // Enhanced spanning logic with more creative layouts
    if (screenSize === "mobile") {
      if (aspectRatio > 1.8) {
        colSpan = 2
        priority = 2
        size = "wide"
      } else if (aspectRatio < 0.7) {
        colSpan = 1
        priority = 1
        size = "tall"
      }
    } else if (screenSize === "tablet") {
      if (aspectRatio > 2.2) {
        colSpan = 2
        priority = 3
        size = "wide"
      } else if (aspectRatio > 1.4 && index % 4 === 0) {
        colSpan = 2
        priority = 2
        size = "featured"
      } else if (aspectRatio < 0.6) {
        colSpan = 1
        priority = 1
        size = "tall"
      }
    } else {
      if (aspectRatio > 2.5) {
        colSpan = 3
        priority = 4
        size = "hero"
      } else if (aspectRatio > 1.8) {
        colSpan = 2
        priority = 3
        size = "wide"
      } else if (aspectRatio > 1.3 && index % 7 === 0) {
        colSpan = 2
        priority = 2
        size = "featured"
      } else if (aspectRatio < 0.6) {
        colSpan = 1
        priority = 1
        size = "tall"
      }
    }

    colSpan = Math.min(colSpan, config.maxSpan)

    return {
      colSpan,
      aspectRatio,
      priority,
      size
    }
  }

  // Enhanced sorting with more sophisticated layout distribution
  const getSortedItems = () => {
    if (!imagesLoaded) return galleryItems

    return [...galleryItems]
      .sort((a, b) => b.id - a.id)
      .sort((a, b) => {
        const propsA = getGridItemProperties(a, galleryItems.indexOf(a))
        const propsB = getGridItemProperties(b, galleryItems.indexOf(b))
        
        if (propsA.priority !== propsB.priority) {
          return propsB.priority - propsA.priority
        }
        
        // Create more interesting layouts by mixing aspect ratios
        if (propsA.size === "hero" || propsB.size === "hero") {
          return propsA.size === "hero" ? -1 : 1
        }
        
        return propsB.aspectRatio - propsA.aspectRatio
      })
  }

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 50,
      rotateX: -15
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
    },
  }

  const heroVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 100,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
    },
  }

  const config = getGridConfig()
  const sortedItems = getSortedItems()
  const isDesktop = screenSize === "desktop"

  return (
    <main className="flex min-h-screen flex-col items-center relative overflow-hidden">
      {/* Immersive Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20"
          style={{
            transform: `translateY(${scrollProgress * 50}px)`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(168,85,247,0.1)_60deg,transparent_120deg)]" />
      </div>

      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 w-full max-w-8xl mx-auto relative z-10">
        {/* Enhanced Title Section */}
        <motion.div
          ref={titleRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Visual Stories
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Capturing moments that inspire, stories that resonate, and memories that last forever
          </p>
          <div className="mt-6 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
          </div>
        </motion.div>

        {isDesktop ? (
          <div className="relative">
            <div className="w-full">
              <CircularGallery
                items={galleryItems.map((g: any) => ({ image: g.src, text: g.photographer }))}
                bend={3}
                textColor="#ffffff"
                borderRadius={0.05}
                scrollEase={0.02}
              />
            </div>
          </div>
        ) : (
          <motion.div
            ref={galleryRef}
            className="relative"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 sm:gap-6 lg:gap-8">
              {sortedItems.map((item, index) => {
                const imageData = loadedImages[item.id]
                const props = getGridItemProperties(item, index)
                const isHero = props.size === "hero"
                const isWide = props.size === "wide"
                const isFeatured = props.size === "featured"
                
                return (
                  <motion.div
                    key={item.id}
                    className={`
                      gallery-item group relative overflow-hidden rounded-2xl cursor-pointer break-inside-avoid mb-4 sm:mb-6 lg:mb-8
                      ${isHero ? 'shadow-2xl shadow-purple-500/20' : ''}
                      ${isWide ? 'shadow-xl shadow-blue-500/15' : ''}
                      ${isFeatured ? 'shadow-lg shadow-pink-500/10' : 'shadow-md shadow-gray-500/10'}
                      backdrop-blur-sm bg-white/5 border border-white/10
                      hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/25
                      transition-all duration-500 ease-out
                    `}
                    variants={isHero ? heroVariants : itemVariants}
                    transition={{ duration: isHero ? 0.8 : 0.6, ease: "easeOut" }}
                    whileHover={{
                      scale: 1.03,
                      y: -8,
                      rotateY: 2,
                      transition: { duration: 0.3, ease: "easeOut" }
                    }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => setHoveredImage(item.id)}
                    onMouseLeave={() => setHoveredImage(null)}
                    custom={index}
                  >
                    <div
                      className="relative w-full overflow-hidden"
                      style={{
                        aspectRatio: imageData ? `${imageData.aspectRatio}` : "1",
                      }}
                    >
                      <Image
                        src={item.src || "/placeholder.svg"}
                        alt={`Photo by ${item.photographer}`}
                        fill
                        style={{ 
                          objectFit: "cover", 
                          filter: imageData ? undefined : 'blur(12px)',
                          transition: 'all 0.5s ease-out'
                        }}
                        className={`
                          absolute inset-0 transition-all duration-500 ease-out
                          ${imageData ? 'group-hover:scale-110' : 'bg-gray-300 animate-pulse'}
                          ${hoveredImage === item.id ? 'brightness-110' : ''}
                        `}
                        onLoad={(e) => handleImageLoad(item.id, e)}
                        sizes={`
                          (max-width: 640px) 50vw,
                          (max-width: 1024px) 33vw,
                          (max-width: 1280px) 25vw,
                          20vw
                        `}
                        priority={index < 16}
                        quality={85}
                      />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end">
                        <div className="w-full p-3 sm:p-4">
                          <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
                            <span className="text-white text-sm font-medium">
                              {item.photographer}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Loading Progress Indicator (mobile/tablet only) */}
        {!isDesktop && !imagesLoaded && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="text-white text-center mb-4">
                <div className="text-lg font-medium">Loading Visual Stories</div>
                <div className="text-sm text-gray-300 mt-2">
                  {Object.keys(loadedImages).length >= 8 ? "Almost ready..." : `${Object.keys(loadedImages).length} / ${galleryItems.length} images loaded`}
                </div>
              </div>
              <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${Math.min(100, (Object.keys(loadedImages).length / Math.max(8, galleryItems.length)) * 100)}%` 
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />

      <style jsx>{`
        .gallery-item {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        @media (min-width: 640px) {
          .gallery-item {
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #8b5cf6, #3b82f6);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #2563eb);
        }
      `}</style>
    </main>
  )
}
