"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface RedirectHandlerProps {
  isRedirecting: boolean
  targetUrl: string
  onComplete?: () => void
}

export default function RedirectHandler({ isRedirecting, targetUrl, onComplete }: RedirectHandlerProps) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<"preparing" | "loading" | "redirecting">("preparing")

  useEffect(() => {
    if (!isRedirecting) return

    let progressInterval: NodeJS.Timeout
    let redirectTimeout: NodeJS.Timeout

    // Stage 1: Preparing (0-30%)
    setStage("preparing")
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 30) {
          clearInterval(progressInterval)
          setStage("loading")

          // Stage 2: Loading (30-80%)
          progressInterval = setInterval(() => {
            setProgress((prev) => {
              if (prev >= 80) {
                clearInterval(progressInterval)
                setStage("redirecting")

                // Stage 3: Redirecting (80-100%)
                progressInterval = setInterval(() => {
                  setProgress((prev) => {
                    if (prev >= 100) {
                      clearInterval(progressInterval)

                      // Perform the actual redirect
                      redirectTimeout = setTimeout(() => {
                        window.location.href = targetUrl
                        onComplete?.()
                      }, 300)

                      return 100
                    }
                    return prev + 2
                  })
                }, 50)

                return prev
              }
              return prev + 1.5
            })
          }, 60)

          return prev
        }
        return prev + 2
      })
    }, 80)

    return () => {
      if (progressInterval) clearInterval(progressInterval)
      if (redirectTimeout) clearTimeout(redirectTimeout)
    }
  }, [isRedirecting, targetUrl, onComplete])

  if (!isRedirecting) return null

  const getStageMessage = () => {
    switch (stage) {
      case "preparing":
        return "Preparing your registration..."
      case "loading":
        return "Loading IRIS Society form..."
      case "redirecting":
        return "Taking you to the form..."
      default:
        return "Please wait..."
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.2),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.2),transparent_50%)]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-12 h-12 border-3 border-white border-t-transparent rounded-full"
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-white mb-4"
          >
            Joining IRIS Society
          </motion.h2>

          {/* Stage Message */}
          <motion.p
            key={stage}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-300 mb-8 text-lg"
          >
            {getStageMessage()}
          </motion.p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700/50 rounded-full h-3 mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>

          {/* Progress Percentage */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-blue-300 font-semibold text-sm"
          >
            {Math.round(progress)}%
          </motion.div>

          {/* Floating Particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
                initial={{
                  x: Math.random() * 400,
                  y: Math.random() * 400,
                  opacity: 0,
                }}
                animate={{
                  x: Math.random() * 400,
                  y: Math.random() * 400,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <p className="text-gray-400 text-sm">You'll be redirected to Google Forms to complete your registration</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
