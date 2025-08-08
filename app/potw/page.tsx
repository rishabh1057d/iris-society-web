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
  const months = [
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

  const getCurrentMonth = () => {
    const now = new Date()
    const currentMonthName = now.toLocaleString("default", { month: "long" })
    // If the current month is not in the list, default to the first month
    return months.includes(currentMonthName) ? currentMonthName : months[0]
  }

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedPhoto, setSelectedPhoto] = useState<WeeklyPhoto | null>(null)
  const [showModal, setShowModal] = useState(false)
  // Removed click tracking functionality - will be re-added with database later

  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const calendarRef = useRef<HTMLDivElement>(null)

  const isTitleInView = useInView(titleRef, { once: true })
  const isDescInView = useInView(descRef, { once: true })
  const isCalendarInView = useInView(calendarRef, { once: true })

  // Fetch weekly photos from JSON
  const [weeklyPhotos, setWeeklyPhotos] = useState<Record<string, WeeklyPhoto[]>>({})

  useEffect(() => {
    fetch("/potw.json")
      .then((res) => res.json())
      .then((data) => setWeeklyPhotos(data))
      .catch((err) => {
        console.error("Failed to load POTW data:", err)
        setWeeklyPhotos({})
      })
  }, [])

  const handlePhotoClick = async (photo: WeeklyPhoto) => {
    setSelectedPhoto(photo)
    setShowModal(true)
    // Removed database click tracking - will be re-added later
  }

  const handlePrevMonth = () => {
    const currentIndex = months.indexOf(selectedMonth)
    const prevIndex = (currentIndex - 1 + months.length) % months.length
    setSelectedMonth(months[prevIndex])
  }

  const handleNextMonth = () => {
    const currentIndex = months.indexOf(selectedMonth)
    const nextIndex = (currentIndex + 1) % months.length
    setSelectedMonth(months[nextIndex])
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
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0 }}
          animate={isCalendarInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
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
            key={selectedMonth}
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
        </motion.div>

        {/* Removed click count display - will be re-added with database */}

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMonth}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {weeklyPhotos[selectedMonth] && weeklyPhotos[selectedMonth].length > 0 ? (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {weeklyPhotos[selectedMonth].map((photo) => (
                  <motion.div
                    key={photo.id}
                    className="potw-card rounded-lg overflow-hidden cursor-pointer"
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <div className="relative h-[400px] md:h-[300px] w-full">
                      <Image
                        src={photo.image || "/placeholder.svg"}
                        alt={`Week ${photo.week} - ${photo.theme}`}
                        fill
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-xl font-bold text-white">Week {photo.week}</h3>
                        <p className="text-sm text-gray-300">{photo.theme}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-gray-400">No photos available for {selectedMonth}.</p>
              </motion.div>
            )}
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
