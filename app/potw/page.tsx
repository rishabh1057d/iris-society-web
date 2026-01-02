"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { motion, AnimatePresence, useInView } from "framer-motion"

// Weekly photo type
type WeeklyPhoto = {
  id: number
  week: number
  month: string
  theme: string
  photographer: string
  email: string
  description: string
  image: string
}

export default function POTW() {
  const allMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Months available for each year (2025 starts in February, 2026 starts in January)
  const getAvailableMonths = (year: number) => {
    if (year === 2025) {
      return allMonths.slice(1) // February onwards
    }
    return allMonths // All months for 2026+
  }

  const getCurrentYear = () => {
    return new Date().getFullYear()
  }

  const getCurrentMonth = (year: number) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonthName = now.toLocaleString("default", { month: "long" })
    const availableMonths = getAvailableMonths(year)
    
    // If current year matches and month is available, use it
    if (currentYear === year && availableMonths.includes(currentMonthName)) {
      return currentMonthName
    }
    // Otherwise return first available month for that year
    return availableMonths[0]
  }

  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonth(getCurrentYear()))
  const [selectedPhoto, setSelectedPhoto] = useState<WeeklyPhoto | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set())
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  // Removed click tracking functionality - will be re-added with database later

  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const isTitleInView = useInView(titleRef, { once: true })
  const isDescInView = useInView(descRef, { once: true })
  const isCalendarInView = useInView(calendarRef, { once: true })

  // Fetch weekly photos from JSON - now organized by year
  const [weeklyPhotos, setWeeklyPhotos] = useState<Record<number, Record<string, WeeklyPhoto[]>>>({})

  useEffect(() => {
    setIsLoading(true)
    fetch("/potw.json")
      .then((res) => res.json())
      .then((data) => {
        // Convert year strings to numbers for easier handling
        const convertedData: Record<number, Record<string, WeeklyPhoto[]>> = {}
        Object.keys(data).forEach((yearStr) => {
          convertedData[parseInt(yearStr)] = data[yearStr]
        })
        setWeeklyPhotos(convertedData)
        // Preload images for the current month/year
        if (convertedData[selectedYear] && convertedData[selectedYear][selectedMonth]) {
          preloadImages(convertedData[selectedYear][selectedMonth])
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load POTW data:", err)
        setWeeklyPhotos({})
        setIsLoading(false)
      })
  }, [])

  // Preload images whenever selectedMonth or selectedYear changes
  useEffect(() => {
    if (weeklyPhotos[selectedYear] && weeklyPhotos[selectedYear][selectedMonth] && weeklyPhotos[selectedYear][selectedMonth].length > 0) {
      // Small delay to ensure component is fully rendered
      const timer = setTimeout(() => {
        preloadImages(weeklyPhotos[selectedYear][selectedMonth])
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [selectedMonth, selectedYear, weeklyPhotos])

  // Immediate preloading when data becomes available
  useEffect(() => {
    if (Object.keys(weeklyPhotos).length > 0 && weeklyPhotos[selectedYear] && weeklyPhotos[selectedYear][selectedMonth]) {
      console.log('Data available, immediately preloading images for:', selectedYear, selectedMonth)
      preloadImages(weeklyPhotos[selectedYear][selectedMonth])
    }
  }, [weeklyPhotos, selectedMonth, selectedYear])

  // Preload images for a given month
  const preloadImages = (photos: WeeklyPhoto[]) => {
    console.log(`Preloading images for ${selectedMonth}:`, photos.length, 'photos')
    photos.forEach((photo) => {
      if (photo.image && !photo.image.startsWith('data:')) {
        const img = new window.Image()
        img.src = photo.image
        img.onload = () => {
          // Image loaded successfully
          console.log(`Image loaded: ${photo.image}`)
          setLoadedImages(prev => new Set(prev).add(photo.image))
        }
        img.onerror = () => {
          console.error(`Failed to load image: ${photo.image}`)
          setImageLoadErrors(prev => new Set(prev).add(photo.image))
        }
      }
    })
  }

  // Handle month change with image preloading
  const handleMonthChange = (newMonth: string, year?: number) => {
    const targetYear = year !== undefined ? year : selectedYear
    setSelectedMonth(newMonth)
    if (year !== undefined) {
      setSelectedYear(targetYear)
    }
    // Preload images for the new month/year
    if (weeklyPhotos[targetYear] && weeklyPhotos[targetYear][newMonth]) {
      preloadImages(weeklyPhotos[targetYear][newMonth])
    }
  }

  const handlePhotoClick = async (photo: WeeklyPhoto) => {
    setSelectedPhoto(photo)
    setShowModal(true)
    // Removed database click tracking - will be re-added later
  }

  const handlePrevMonth = () => {
    const availableMonths = getAvailableMonths(selectedYear)
    const currentIndex = availableMonths.indexOf(selectedMonth)
    
    if (currentIndex > 0) {
      // Previous month in same year
      handleMonthChange(availableMonths[currentIndex - 1])
    } else {
      // Go to previous year's last month
      const prevYear = selectedYear - 1
      const prevYearMonths = getAvailableMonths(prevYear)
      if (prevYearMonths.length > 0 && weeklyPhotos[prevYear]) {
        handleMonthChange(prevYearMonths[prevYearMonths.length - 1], prevYear)
      }
    }
  }

  const handleNextMonth = () => {
    const availableMonths = getAvailableMonths(selectedYear)
    const currentIndex = availableMonths.indexOf(selectedMonth)
    
    if (currentIndex < availableMonths.length - 1) {
      // Next month in same year
      handleMonthChange(availableMonths[currentIndex + 1])
    } else {
      // Go to next year's first month
      const nextYear = selectedYear + 1
      const nextYearMonths = getAvailableMonths(nextYear)
      if (nextYearMonths.length > 0 && (weeklyPhotos[nextYear] || nextYear === getCurrentYear())) {
        handleMonthChange(nextYearMonths[0], nextYear)
      }
    }
  }

  const handleYearChange = (newYear: number) => {
    const availableMonths = getAvailableMonths(newYear)
    // If current month exists in new year, keep it; otherwise use first available
    const monthToUse = availableMonths.includes(selectedMonth) 
      ? selectedMonth 
      : availableMonths[0]
    handleMonthChange(monthToUse, newYear)
  }

  const getAvailableYears = () => {
    const years = Object.keys(weeklyPhotos).map(Number).sort((a, b) => b - a)
    const currentYear = getCurrentYear()
    // Include current year even if no data yet
    if (!years.includes(currentYear)) {
      years.unshift(currentYear)
    }
    return years
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.2 },
    },
  }

  // Handle image load error
  const handleImageError = (imageSrc: string) => {
    setImageLoadErrors(prev => new Set(prev).add(imageSrc))
  }

  // Handle image load success
  const handleImageLoad = (imageSrc: string) => {
    setLoadedImages(prev => new Set(prev).add(imageSrc))
    setImageLoadErrors(prev => {
      const newSet = new Set(prev)
      newSet.delete(imageSrc)
      return newSet
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center relative" onContextMenu={e => e.preventDefault()}>
      <Navbar />
      <div className="pt-24 pb-12 px-6 w-full max-w-6xl mx-auto">
        <motion.h1
          ref={titleRef}
          className="text-3xl md:text-4xl font-bold mb-8 text-center text-blue-300"
          initial={{ opacity: 0, y: -20 }}
          animate={isTitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          Photo of the Week
        </motion.h1>

        <motion.p
          ref={descRef}
          className="text-gray-300 text-center max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0 }}
          animate={isDescInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Each week, IRIS Society members submit photos based on a theme. The best submission is featured as our Photo of the Week. 
          Browse through our calendar to see the winning entries. 
          To participate, share your photo along with the required details in the designated WhatsApp group or Gspace.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isDescInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="https://docs.google.com/document/d/1pytF-tK4XXgi8r6lLzEMzyEXjD0vAjT63ff6oejznrY/edit?usp=sharing"  
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary w-full sm:w-auto py-1 px-3 text-xs min-h-[32px]"
          >
            View Guidelines
          </Link>
          <Link
            href="https://docs.google.com/forms/u/1/d/e/1FAIpQLSczSzMGIAd-sE_nxe9wOFSrsYy59lzRBhU9e5uhOjMtmIquLQ/viewform"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full sm:w-auto py-1 px-3 text-xs min-h-[32px]"
          >
            Submit Now
          </Link>
        </motion.div>

        <motion.div
          ref={calendarRef}
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={isCalendarInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Year Selection */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.button
              onClick={() => {
                const years = getAvailableYears()
                const currentIndex = years.indexOf(selectedYear)
                if (currentIndex < years.length - 1) {
                  handleYearChange(years[currentIndex + 1])
                }
              }}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              disabled={getAvailableYears().indexOf(selectedYear) >= getAvailableYears().length - 1}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.h3
              className="text-xl md:text-2xl font-bold text-blue-300 min-w-[80px] text-center"
              key={selectedYear}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {selectedYear}
            </motion.h3>
            <motion.button
              onClick={() => {
                const years = getAvailableYears()
                const currentIndex = years.indexOf(selectedYear)
                if (currentIndex > 0) {
                  handleYearChange(years[currentIndex - 1])
                }
              }}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              disabled={getAvailableYears().indexOf(selectedYear) <= 0}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Month Selection */}
          <div className="flex items-center justify-between">
            <motion.button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-center"
              key={`${selectedYear}-${selectedMonth}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {selectedMonth}
            </motion.h2>
            <motion.button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300"></div>
            <p className="text-gray-400 mt-4">Loading photos...</p>
          </motion.div>
        )}

        {/* Removed click count display - will be re-added with database */}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedYear}-${selectedMonth}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!isLoading && weeklyPhotos[selectedYear] && weeklyPhotos[selectedYear][selectedMonth] && weeklyPhotos[selectedYear][selectedMonth].length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {weeklyPhotos[selectedYear][selectedMonth].map((photo) => (
                  <motion.div
                    key={photo.id}
                    className="potw-card rounded-lg overflow-hidden cursor-pointer"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <div className="relative h-[400px] md:h-[300px] w-full">
                      {!loadedImages.has(photo.image) && !imageLoadErrors.has(photo.image) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300"></div>
                        </div>
                      )}
                      <Image
                        src={photo.image || "/placeholder.svg"}
                        alt={`Week ${photo.week} - ${photo.theme}`}
                        fill
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectFit: 'cover' }}
                        onLoad={() => handleImageLoad(photo.image)}
                        onError={() => handleImageError(photo.image)}
                        priority={true}
                        unoptimized={true}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-xl font-bold text-white">Week {photo.week}</h3>
                        <p className="text-sm text-gray-300">{photo.theme}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : !isLoading ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-400">No photos available for {selectedMonth} {selectedYear}.</p>
              </motion.div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal for photo details */}
      <AnimatePresence>
        {showModal && selectedPhoto && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="relative rounded-2xl overflow-hidden max-w-5xl w-full max-h-[80vh] flex flex-col backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* subtle glass highlight overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
              <div className="flex justify-end p-2">
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex flex-col md:flex-row overflow-hidden">
                {/* Image container with natural aspect ratio */}
                <div className="md:w-3/5 flex items-center justify-center p-2">
                  <div className="flex items-center justify-center w-full h-[40vh] md:h-[60vh]">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center justify-center w-full h-full"
                    >
                      <Image
                        src={selectedPhoto.image || "/placeholder.svg"}
                        alt={selectedPhoto.theme}
                        width={800}
                        height={600}
                        className="object-contain max-h-full max-w-full mx-auto"
                        style={{ display: 'block' }}
                        priority={true}
                        unoptimized={true}
                        onLoad={() => handleImageLoad(selectedPhoto.image)}
                        onError={() => handleImageError(selectedPhoto.image)}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Details section */}
                <div className="md:w-2/5 p-6 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-4"
                  >
                    <h3 className="text-xl font-bold">{selectedPhoto.photographer}</h3>
                  </motion.div>

                  <motion.h4
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-lg font-semibold text-blue-300 mb-2"
                  >
                    Theme of the week: {selectedPhoto.theme}
                  </motion.h4>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-gray-300 mb-6"
                  >
                    {selectedPhoto.description}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
