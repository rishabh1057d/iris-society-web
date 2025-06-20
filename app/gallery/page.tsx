"use client"

import { useRef, useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import { motion, useInView } from "framer-motion"

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

  // Updated gallery items with real photos
  const galleryItems = [
    { id: 1, alt: "LumenAstrum_naman", src: "/images/lumen_astrum_NamanDeepSingh.jpg", photographer: "Naman Deep Singh" },
    { id: 2, alt: "LumenAstrum_winner", src: "/images/Lumen_astrum_RAKSHITHASRI SHRINIVASAN.jpg", photographer: "RAKSHITHASRI SHRINIVASAN" },
    { id: 3, alt: "LumenAstrum_yashas", src: "/images/Lumen_astrum_yashas_rao.png", photographer: "Yashas Rao" },
    { id: 4, alt: "ShutterSafari_piyush", src: "/images/shutter_safari_piyush.jpg", photographer: "Piyush Tiwari" },
    { id: 5, alt: "ShutterSafari_Devi", src: "/images/shutter_safari_second.jpg", photographer: "Devi Vrinda" },
    { id: 6, alt: "ShutterSafari_susheel", src: "/images/shutter_safari_third.jpg", photographer: "Susheel Soni" },
    { id: 7, alt: "ShutterSafari_Winner", src: "/images/shutter_safari_winner.jpg", photographer: "Shreyaskar Srivastava" },
    { id: 8, alt: "ShutterSafari_Sriram", src: "/images/Shutter_safari_sriram.jpeg", photographer: "Sriram" },
    { id: 9, alt: "ShutterSafari_round1_kaustubh", src: "/images/kaustubh_round1_ss.png", photographer: "Kaustubh" },
    { id: 10, alt: "FrameQuest_1", src: "/images/week3.jpeg", photographer: "Arnab Sarkar" },
    { id: 11, alt: "FrameQuest_5", src: "/images/week1.jpeg", photographer: "Piyush Dipak Wani" },
    { id: 12, alt: "FrameQuest_3", src: "/images/week2.jpeg", photographer: "Kaustubh" },
    { id: 14, alt: "FrameQuest_2", src: "/images/framequest_2.png", photographer: "Ashutosh Diwan" },
    { id: 15, alt: "FrameQuest_4", src: "/images/framequest_4.png", photographer: "Siddhanta Roy" },
    { id: 17, alt: "Shutter_safari_ve_3", src: "/images/shutter_safari_ve_deepesh.png", photographer: "Deepesh Kumar Dawar" },
    { id: 18, alt: "Shutter_safari_ve_2", src: "/images/shutter_safari_ve_shreya.png", photographer: "Shreya Saxena" },
    { id: 19, alt: "Shutter_Safari_ve_1", src: "/images/shutter_safari_ve_susheel.png", photographer: "Susheel Soni" },
    { id: 20, alt: "ff_holi_1", src: "/images/ff_holi_1.png", photographer: "Diptesh Ghosh" },
    { id: 21, alt: "ff_holi_2", src: "/images/ff_holi_2.png", photographer: "Susheel Soni" },
    { id: 22, alt: "ff_holi_3", src: "/images/ff_holi_3.png", photographer: "Shreemad R. Gandhi" },
    { id: 23, alt: "ff_holi_4", src: "/images/ff_holi_4.png", photographer: "Suprovo Mallick" },
    { id: 24, alt: "ff_holi_5", src: "/images/ff_holi_5.png", photographer: "Farah Shaikh" },
    { id: 25, alt: "ss_round1_poorani", src: "/images/ss_round1_1_ POORANI KANDASAMY.jpg", photographer: "POORANI KANDASAMY" },
    { id: 26, alt: "ss_round1_2", src: "/images/ss_round1_2_Shreyaskar Srrivastava.png", photographer: "Shreyaskar Srivastava" },
    { id: 27, alt: "ss_rouund1_3", src: "/images/ss_round1_3_Ritushree Mondal (1).jpg", photographer: "Ritushree Mondal" },
    { id: 28, alt: "ss_rouund1_4", src: "/images/ss_round1_4_saurojeet bhattacharya.jpg", photographer: "Saurojeet Bhattacharaya" },
  ]

  // Fix: Ensure imagesLoaded is set if all images are loaded, even if no user interaction
  useEffect(() => {
    if (!imagesLoaded && Object.keys(loadedImages).length === galleryItems.length) {
      setImagesLoaded(true)
    }
  }, [loadedImages, imagesLoaded, galleryItems.length])

  const handleImageLoad = (id: number, e: any) => {
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

      // Check if all images are loaded
      if (Object.keys(updated).length === galleryItems.length) {
        setImagesLoaded(true)
      }

      return updated
    })
  }

  // Get responsive grid configuration
  const getGridConfig = () => {
    switch (screenSize) {
      case "mobile":
        return {
          columns: 2,
          baseWidth: 160,
          gap: 8,
          maxSpan: 2,
        }
      case "tablet":
        return {
          columns: 3,
          baseWidth: 200,
          gap: 12,
          maxSpan: 2,
        }
      default:
        return {
          columns: 4,
          baseWidth: 240,
          gap: 16,
          maxSpan: 3,
        }
    }
  }

  // Calculate dynamic grid item properties based on actual aspect ratios
  const getGridItemProperties = (item: any, index: number) => {
    const imageData = loadedImages[item.id]
    const config = getGridConfig()

    if (!imageData) {
      // Default while loading
      return {
        colSpan: 1,
        aspectRatio: 1,
        priority: 0,
      }
    }

    const { aspectRatio } = imageData
    let colSpan = 1
    let priority = 0

    // Determine column span based on aspect ratio and screen size
    if (screenSize === "mobile") {
      // Mobile: Conservative spanning
      if (aspectRatio > 1.6) {
        colSpan = 2
        priority = 1
      } else if (aspectRatio < 0.6) {
        colSpan = 1
        priority = 2
      }
    } else if (screenSize === "tablet") {
      // Tablet: Moderate spanning
      if (aspectRatio > 1.8) {
        colSpan = 2
        priority = 1
      } else if (aspectRatio > 1.3 && index % 5 === 0) {
        colSpan = 2
        priority = 1
      } else if (aspectRatio < 0.6) {
        colSpan = 1
        priority = 2
      }
    } else {
      // Desktop: Full spanning capabilities
      if (aspectRatio > 2.0) {
        colSpan = 3
        priority = 3
      } else if (aspectRatio > 1.5) {
        colSpan = 2
        priority = 2
      } else if (aspectRatio > 1.2 && index % 6 === 0) {
        colSpan = 2
        priority = 1
      } else if (aspectRatio < 0.6) {
        colSpan = 1
        priority = 2
      }
    }

    // Ensure we don't exceed max span
    colSpan = Math.min(colSpan, config.maxSpan)

    return {
      colSpan,
      aspectRatio,
      priority,
    }
  }

  // Sort images for better layout distribution
  const getSortedItems = () => {
    if (!imagesLoaded) return galleryItems

    return [...galleryItems].sort((a, b) => {
      const propsA = getGridItemProperties(a, galleryItems.indexOf(a))
      const propsB = getGridItemProperties(b, galleryItems.indexOf(b))

      // Sort by priority (higher priority first), then by aspect ratio
      if (propsA.priority !== propsB.priority) {
        return propsB.priority - propsA.priority
      }

      return propsB.aspectRatio - propsA.aspectRatio
    })
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  const config = getGridConfig()
  const sortedItems = getSortedItems()

  return (
    <main className="flex min-h-screen flex-col items-center relative">
      <Navbar />
      <div className="pt-24 pb-12 px-4 sm:px-6 w-full max-w-7xl mx-auto">
        <motion.h1
          ref={titleRef}
          className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          Gallery
        </motion.h1>

        {/* Dynamic Masonry Grid */}
        <motion.div
          ref={galleryRef}
          className={`
            columns-2 sm:columns-3 lg:columns-4 xl:columns-5
            gap-3 sm:gap-4 lg:gap-6
            transition-opacity duration-500
            opacity-100
          `}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedItems.map((item, index) => {
            const imageData = loadedImages[item.id]
            const originalIndex = galleryItems.findIndex((gi) => gi.id === item.id)
            return (
              <motion.div
                key={item.id}
                className="gallery-item glass-card bg-gray-900/60 group relative overflow-hidden rounded-lg cursor-pointer break-inside-avoid mb-3 sm:mb-4 lg:mb-6"
                variants={itemVariants}
                whileHover={{
                  scale: 1.02,
                  zIndex: 10,
                  transition: { duration: 0.2 },
                }}
                custom={index}
              >
                <div
                  className="relative w-full"
                  style={{
                    aspectRatio: imageData ? `${imageData.aspectRatio}` : "1",
                  }}
                >
                  <Image
                    src={item.src || "/placeholder.svg"}
                    alt={item.alt}
                    fill
                    style={{ objectFit: "cover", filter: imageData ? undefined : 'blur(8px)', transition: 'filter 0.3s' }}
                    className={`absolute inset-0 transition-all duration-300 group-hover:scale-105 ${imageData ? '' : 'bg-gray-300 animate-pulse'}`}
                    onLoad={(e) => handleImageLoad(item.id, e)}
                    sizes={`
                      (max-width: 640px) 50vw,
                      (max-width: 1024px) 33vw,
                      (max-width: 1280px) 25vw,
                      20vw
                    `}
                    priority={index < 8}
                    quality={90}
                  />
                  {/* Photographer overlay with improved positioning */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end bg-gradient-to-t from-black/30 via-black/10 to-transparent">
                    <div className="w-full p-3 sm:p-4">
                      <span className="inline-block bg-black/80 rounded px-3 py-1 text-white text-xs font-medium drop-shadow-lg leading-tight">
                        {item.photographer}
                      </span>
                    </div>
                  </div>
                  {/* Enhanced light sweep effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transform skew-x-[-25deg] group-hover:animate-[shine_0.8s_ease-out] pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Loading indicator with progress */}
        {/* No longer blocking grid rendering; indicator can be added elsewhere if desired */}
      </div>
      <Footer />

      <style jsx>{`
        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 150%;
          }
        }
        
        /* Ensure proper column breaks */
        .gallery-item {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Smooth column transitions */
        @media (min-width: 640px) {
          .gallery-item {
            transition: transform 0.3s ease, box-shadow 1.3s ease;
          }
        }
      `}</style>
    </main>
  )
}
