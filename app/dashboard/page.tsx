"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { motion } from "framer-motion"
import { Calendar, Camera, LogOut, Users } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center relative">
      <Navbar />
      <div className="pt-24 pb-12 px-6 w-full max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card mb-8 p-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <Image
                src="/logo.png"
                alt="IRIS Society Logo"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Welcome to the IRIS Society Dashboard!
              </h1>
              <p className="text-gray-300 mb-2">Explore events, submissions, and connect with members.</p>
            </div>
          </div>
        </motion.div>

        <h2 className="text-xl font-bold mb-6">Member Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center mb-4">
              <Camera className="h-6 w-6 text-blue-400 mr-3" />
              <h3 className="text-lg font-semibold">My Submissions</h3>
            </div>
            <p className="text-gray-300 mb-4">View and manage your photo submissions for POTW and other contests.</p>
            <Link href="#" className="text-blue-400 hover:text-blue-300 flex items-center text-sm">
              View submissions
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center mb-4">
              <Calendar className="h-6 w-6 text-blue-400 mr-3" />
              <h3 className="text-lg font-semibold">Upcoming Events</h3>
            </div>
            <p className="text-gray-300 mb-4">Check out upcoming events and register to participate.</p>
            <Link href="/events" className="text-blue-400 hover:text-blue-300 flex items-center text-sm">
              View events
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-blue-400 mr-3" />
              <h3 className="text-lg font-semibold">Member Directory</h3>
            </div>
            <p className="text-gray-300 mb-4">Connect with other IRIS Society members.</p>
            <Link href="#" className="text-blue-400 hover:text-blue-300 flex items-center text-sm">
              View members
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Announcements</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium">POTW Theme: Urban Landscapes</h4>
              <p className="text-gray-300 text-sm">
                This week's theme is Urban Landscapes. Submit your entries by Friday!
              </p>
              <p className="text-gray-400 text-xs mt-1">Posted 2 days ago</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium">Workshop: Composition Techniques</h4>
              <p className="text-gray-300 text-sm">
                Join us for a workshop on composition techniques this Saturday at 3 PM.
              </p>
              <p className="text-gray-400 text-xs mt-1">Posted 5 days ago</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
