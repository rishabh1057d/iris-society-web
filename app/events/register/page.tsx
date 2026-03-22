"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import EventRegistration from "../../../components/event-registration"

type UserType = "participant" | "admin" | null

export default function Page() {
  const [userType, setUserType] = useState<UserType>(null)
  const [config, setConfig] = useState<any>(null)
  const router = useRouter()

  // Load event config for display
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/event-config", { cache: 'no-store' })
        if (res.ok) {
          const response = await res.json()
          if (response.success && response.config) {
            setConfig(response.config)
          }
        }
      } catch (err) {
        console.error("Error loading config:", err)
      }
    })()
  }, [])

  // Handle navigation for admin selection
  useEffect(() => {
    if (userType === "admin") {
      router.push("/admin/dashboard/event-registration")
    }
  }, [userType, router])

  // If participant is selected, show the current registration form
  if (userType === "participant") {
    return <EventRegistration />
  }

  // If admin is selected, show loading state while redirecting
  if (userType === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
          <span>Redirecting to admin dashboard...</span>
        </div>
      </div>
    )
  }

  // Default: Show selection screen
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            {config?.event_name || "Event Registration"}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            {config?.event_description || "Choose your access type to continue"}
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Participant Card */}
          <motion.button
            onClick={() => setUserType("participant")}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden p-8 text-left transition-all duration-300 hover:border-blue-500/30 hover:bg-white/[0.08]"
          >
            {/* Gradient accent */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:bg-blue-500/30 transition-colors duration-300">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                Participant Registration
              </h3>
              <p className="text-white/60 mb-4 leading-relaxed">
                Register for the event as a participant. Sign in with your institutional email and fill out the registration form.
              </p>
              
              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-white/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mr-3"></div>
                  Institutional email required
                </div>
                <div className="flex items-center text-sm text-white/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mr-3"></div>
                  Quick and easy registration
                </div>
                <div className="flex items-center text-sm text-white/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mr-3"></div>
                  Join the event community
                </div>
              </div>
              
              {/* Arrow */}
              <div className="mt-6 flex items-center text-blue-400 font-medium">
                <span className="mr-2">Continue as Participant</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </motion.button>

          {/* Admin Card */}
          <motion.button
            onClick={() => setUserType("admin")}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden p-8 text-left transition-all duration-300 hover:border-purple-500/30 hover:bg-white/[0.08]"
          >
            {/* Gradient accent */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="relative z-10">
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:bg-purple-500/30 transition-colors duration-300">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors duration-300">
                Admin Access
              </h3>
              <p className="text-white/60 mb-4 leading-relaxed">
                Access the admin dashboard to manage event registrations, update configurations, and view participant data.
              </p>
              
              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center text-sm text-white/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 mr-3"></div>
                  Manage registrations
                </div>
                <div className="flex items-center text-sm text-white/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 mr-3"></div>
                  Update event config
                </div>
                <div className="flex items-center text-sm text-white/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400/60 mr-3"></div>
                  Export data & analytics
                </div>
              </div>
              
              {/* Arrow */}
              <div className="mt-6 flex items-center text-purple-400 font-medium">
                <span className="mr-2">Access Admin Dashboard</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </motion.button>
        </div>

        {/* Footer note */}
        <div className="text-center mt-8">
          <p className="text-white/40 text-sm">
            Admin access is restricted to authorized personnel only
          </p>
        </div>
      </motion.div>
    </div>
  )
}
