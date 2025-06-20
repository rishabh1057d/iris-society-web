"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Facebook, Instagram, Linkedin, Mail, Save } from "lucide-react"

export default function ContactManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [contactInfo, setContactInfo] = useState({
    email: "photography.society@study.iitm.ac.in",
    socialLinks: {
      instagram: "https://instagram.com/iris_society",
      linkedin: "https://linkedin.com/company/iris-society",
      facebook: "https://facebook.com/iris.society",
    },
  })
  const [isSaved, setIsSaved] = useState(false)
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo((prev) => ({
      ...prev,
      email: e.target.value,
    }))
    setIsSaved(false)
  }

  const handleSocialLinkChange = (platform: keyof typeof contactInfo.socialLinks, value: string) => {
    setContactInfo((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }))
    setIsSaved(false)
  }

  const handleSave = () => {
    // In a real app, you would save to a database here
    setIsSaved(true)
    setTimeout(() => {
      setIsSaved(false)
    }, 3000)
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
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/admin/dashboard" className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Contact Details Management</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Edit Contact Information</h2>
            <button
              onClick={handleSave}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <Save className="h-5 w-5 mr-2" /> Save Changes
            </button>
          </div>

          {isSaved && (
            <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-2 rounded mb-4">
              Changes saved successfully!
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address
              </label>
              <div className="flex">
                <div className="bg-gray-700 flex items-center px-3 rounded-l-md border border-gray-600">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={handleEmailChange}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Social Media Links</h3>

              <div className="space-y-2">
                <label htmlFor="instagram" className="block text-sm font-medium">
                  Instagram
                </label>
                <div className="flex">
                  <div className="bg-gray-700 flex items-center px-3 rounded-l-md border border-gray-600">
                    <Instagram className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="instagram"
                    type="url"
                    value={contactInfo.socialLinks.instagram}
                    onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="linkedin" className="block text-sm font-medium">
                  LinkedIn
                </label>
                <div className="flex">
                  <div className="bg-gray-700 flex items-center px-3 rounded-l-md border border-gray-600">
                    <Linkedin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="linkedin"
                    type="url"
                    value={contactInfo.socialLinks.linkedin}
                    onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="facebook" className="block text-sm font-medium">
                  Facebook
                </label>
                <div className="flex">
                  <div className="bg-gray-700 flex items-center px-3 rounded-l-md border border-gray-600">
                    <Facebook className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="facebook"
                    type="url"
                    value={contactInfo.socialLinks.facebook}
                    onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                  Email:
                </h3>
                <p className="text-gray-300 ml-5">{contactInfo.email}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Social Media:</h3>
                <div className="flex space-x-4 ml-5">
                  <Link
                    href={contactInfo.socialLinks.linkedin}
                    target="_blank"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <Linkedin className="w-6 h-6" />
                  </Link>
                  <Link
                    href={contactInfo.socialLinks.instagram}
                    target="_blank"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <Instagram className="w-6 h-6" />
                  </Link>
                  <Link
                    href={contactInfo.socialLinks.facebook}
                    target="_blank"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <Facebook className="w-6 h-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
