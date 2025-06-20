"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Calendar, Grid, Home, ImageIcon, Info, LogOut, Mail, Menu, X } from "lucide-react"

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/admin/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-gray-800"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-800 transition-transform duration-300 ease-in-out md:transition-none`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center p-6 border-b border-gray-700">
            <Image src="/images/logo.png" alt="IRIS Society Logo" width={50} height={50} />
            <h1 className="ml-3 text-xl font-bold">Admin Panel</h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <Link
              href="/admin/dashboard"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </Link>
            <Link
              href="/admin/dashboard/potw"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <Calendar className="h-5 w-5 mr-3" />
              POTW Management
            </Link>
            <Link
              href="/admin/dashboard/events"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <Grid className="h-5 w-5 mr-3" />
              Event Management
            </Link>
            <Link
              href="/admin/dashboard/gallery"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <ImageIcon className="h-5 w-5 mr-3" />
              Gallery Management
            </Link>
            <Link
              href="/admin/dashboard/about"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <Info className="h-5 w-5 mr-3" />
              About Section
            </Link>
            <Link
              href="/admin/dashboard/contact"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <Mail className="h-5 w-5 mr-3" />
              Contact Details
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-8">Welcome to IRIS Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* POTW Management Card */}
          <Link href="/admin/dashboard/potw" className="block">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
                <Calendar className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold mb-2">POTW Management</h2>
              <p className="text-gray-400">Upload and manage Photo of the Week entries.</p>
            </div>
          </Link>

          {/* Event Management Card */}
          <Link href="/admin/dashboard/events" className="block">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4">
                <Grid className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Event Management</h2>
              <p className="text-gray-400">Create and manage society events.</p>
            </div>
          </Link>

          {/* Gallery Management Card */}
          <Link href="/admin/dashboard/gallery" className="block">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg mb-4">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Gallery Management</h2>
              <p className="text-gray-400">Upload, edit, and delete gallery photos.</p>
            </div>
          </Link>

          {/* About Section Card */}
          <Link href="/admin/dashboard/about" className="block">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-600 rounded-lg mb-4">
                <Info className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold mb-2">About Section</h2>
              <p className="text-gray-400">Edit the about section content.</p>
            </div>
          </Link>

          {/* Contact Details Card */}
          <Link href="/admin/dashboard/contact" className="block">
            <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-lg mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Contact Details</h2>
              <p className="text-gray-400">Update society contact information.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
