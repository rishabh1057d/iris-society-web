"use client"

import { useRef } from "react"
import Link from "next/link"
import { Instagram, Linkedin, ExternalLink } from "lucide-react"
import { motion, useInView } from "framer-motion"
import ResponsiveContainer from "./responsive-container"

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null)
  const isFooterInView = useInView(footerRef, { once: true, margin: "-100px 0px" })

  return (
    <motion.footer
      ref={footerRef}
      className="w-full py-8 px-6 mt-auto border-t border-gray-800 relative z-20 bg-gradient-to-b from-transparent to-black/50 safe-area-inset-bottom"
      initial={{ opacity: 0, y: 20 }}
      animate={isFooterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      <ResponsiveContainer size="lg" padding="md">
        <div className="text-center">
          <p className="text-gray-300 mb-1 text-responsive">Made with Love by Rishabh</p>
          <p className="text-gray-400 text-sm text-responsive">© 2025 IRIS Society. All rights reserved.</p>
          <motion.div
            className="flex justify-center space-x-6 mt-4"
            initial={{ opacity: 0 }}
            animate={isFooterInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.2, rotate: 5 }} transition={{ duration: 0.2 }} className="p-2">
              <Link
                href="https://linktr.ee/iris_iitm"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Linktree - All IRIS Society Links"
                className="block"
              >
                <ExternalLink className="w-6 h-6 text-gray-400 hover:text-green-400 transition-colors" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.2, rotate: 5 }} transition={{ duration: 0.2 }} className="p-2">
              <Link
                href="https://www.instagram.com/iris_iitm"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram - IRIS Society Photos"
                className="block"
              >
                <Instagram className="w-6 h-6 text-gray-400 hover:text-pink-400 transition-colors" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.2, rotate: 5 }} transition={{ duration: 0.2 }} className="p-2">
              <Link
                href="https://www.linkedin.com/company/iris-camera-society/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn - IRIS Camera Society"
                className="block"
              >
                <Linkedin className="w-6 h-6 text-gray-400 hover:text-blue-400 transition-colors" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </ResponsiveContainer>
    </motion.footer>
  )
}

export { Footer }
