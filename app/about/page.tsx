"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { motion, useInView } from "framer-motion"

export default function About() {
  const textRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const activitiesRef = useRef<HTMLUListElement>(null)

  const isTextInView = useInView(textRef, { once: true, margin: "-100px 0px" })
  const isImageInView = useInView(imageRef, { once: true, margin: "-100px 0px" })
  const isActivitiesInView = useInView(activitiesRef, { once: true, margin: "-100px 0px" })

  return (
    <main className="flex min-h-screen flex-col items-center relative">
      <Navbar />
      <div className="pt-24 pb-12 px-6 w-full max-w-6xl mx-auto">
        <motion.h1
          className="text-3xl md:text-4xl font-bold mb-8 text-center text-blue-300"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          About Us
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <motion.div
            ref={textRef}
            initial={{ opacity: 0, x: -50 }}
            animate={isTextInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gray-300 mb-4">
              Welcome to the IRIS Society at IIT Madras, a dynamic community dedicated to celebrating and exploring the
              art of photography. Our society aims to inspire creativity, enhance skills, and foster a shared passion
              for capturing moments through the lens.
            </p>
            <p className="text-gray-300 mb-6">
              Founded under the IIT Madras BS Degree program, IRIS is open to all students under this domain, regardless
              of their photography experience. We believe that photography is a powerful medium for storytelling and
              self-expression, and we strive to create an inclusive environment where every member can grow and thrive.
            </p>

            <h2 className="text-xl font-bold mb-3">Our Activities</h2>
            <motion.ul
              ref={activitiesRef}
              className="list-disc pl-5 text-gray-300 space-y-2"
              initial={{ opacity: 0 }}
              animate={isActivitiesInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {["Workshops and Tutorials", "Photowalks", "Collaborations", "Monthly Competitions"].map(
                (activity, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isActivitiesInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  >
                    {activity}
                  </motion.li>
                ),
              )}
            </motion.ul>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isTextInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/team" className="btn-primary">
                Meet our Team
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            ref={imageRef}
            className="flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isImageInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/images/logo-tilted.png"
              alt="About IRIS Society"
              width={500}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
