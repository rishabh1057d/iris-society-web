"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"

export default function AboutManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [aboutContent, setAboutContent] = useState({
    mainText: `Welcome to the IRIS Society at IIT Madras, a dynamic community dedicated to celebrating and
  exploring the art of photography. Our society aims to inspire creativity, enhance skills, and foster a
  shared passion for capturing moments through the lens.
  
  Founded under the IIT Madras BS Degree program, IRIS is open to all students under this domain, regardless
  of their photography experience. We believe that photography is a powerful medium for storytelling and
  self-expression, and we strive to create an inclusive environment where every member can grow and thrive.`,
    activities: ["Workshops and Tutorials", "Photowalks", "Collaborations", "Monthly Competitions"],
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

  const handleMainTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAboutContent((prev) => ({
      ...prev,
      mainText: e.target.value,
    }))
    setIsSaved(false)
  }

  const handleActivityChange = (index: number, value: string) => {
    setAboutContent((prev) => {
      const newActivities = [...prev.activities]
      newActivities[index] = value
      return {
        ...prev,
        activities: newActivities,
      }
    })
    setIsSaved(false)
  }

  const handleAddActivity = () => {
    setAboutContent((prev) => ({
      ...prev,
      activities: [...prev.activities, ""],
    }))
    setIsSaved(false)
  }

  const handleRemoveActivity = (index: number) => {
    setAboutContent((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
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
          <h1 className="text-2xl font-bold">About Section Management</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Edit About Content</h2>
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
              <label htmlFor="mainText" className="block text-sm font-medium">
                Main Text
              </label>
              <textarea
                id="mainText"
                rows={8}
                value={aboutContent.mainText}
                onChange={handleMainTextChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium">Activities</label>
                <button
                  onClick={handleAddActivity}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md transition-colors"
                >
                  Add Activity
                </button>
              </div>
              <div className="space-y-3">
                {aboutContent.activities.map((activity, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="text"
                      value={activity}
                      onChange={(e) => handleActivityChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleRemoveActivity(index)}
                      className="ml-2 text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-line">{aboutContent.mainText}</p>

              <h3 className="text-lg font-semibold mt-4 mb-2">Our Activities</h3>
              <ul className="list-disc pl-5 space-y-1">
                {aboutContent.activities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
