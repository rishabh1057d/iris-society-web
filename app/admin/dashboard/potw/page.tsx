"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Plus, Trash2, Upload } from "lucide-react"

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

export default function POTWManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState("January")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPhoto, setNewPhoto] = useState({
    week: 1,
    theme: "",
    photographer: "",
    email: "",
    description: "",
    image: "/placeholder.svg?height=600&width=400",
  })
  const router = useRouter()

  // Sample data for weekly photos (in a real app, this would come from a database)
  const [weeklyPhotos, setWeeklyPhotos] = useState<Record<string, WeeklyPhoto[]>>({
    January: [
      {
        id: 1,
        week: 1,
        month: "January",
        theme: "Nature's Patterns",
        photographer: "Priya Sharma",
        email: "24f1002346@ds.study.iitm.ac.in",
        description:
          "This beautiful butterfly was captured during early morning at the campus garden. The intricate patterns on its wings showcase nature's artistic precision and beauty.",
        image: "/images/week1.jpeg",
      },
      {
        id: 2,
        week: 2,
        month: "January",
        theme: "Birds of Prey",
        photographer: "Rahul Verma",
        email: "24f1003421@ds.study.iitm.ac.in",
        description: "This hawk was photographed in its natural habitat, perched on a branch scanning for prey.",
        image: "/images/week2.jpeg",
      },
      {
        id: 3,
        week: 3,
        month: "January",
        theme: "Wild Encounters",
        photographer: "Ananya Patel",
        email: "24f1001234@ds.study.iitm.ac.in",
        description: "This leopard was captured during a wildlife photography expedition.",
        image: "/images/week3.jpeg",
      },
      {
        id: 4,
        week: 4,
        month: "January",
        theme: "Tools of the Trade",
        photographer: "Vikram Singh",
        email: "24f1004567@ds.study.iitm.ac.in",
        description: "This Canon telephoto lens represents the essential equipment of a wildlife photographer.",
        image: "/images/week4.jpeg",
      },
    ],
    February: [
      {
        id: 5,
        week: 1,
        month: "February",
        theme: "Urban Landscapes",
        photographer: "Neha Gupta",
        email: "24f1005678@ds.study.iitm.ac.in",
        description: "This cityscape captures the contrast between modern architecture and natural elements.",
        image: "/placeholder.svg?height=600&width=400",
      },
    ],
  })

  const months = [
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewPhoto((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, you would upload the image to a server here
    // For now, we'll just add it to our state

    const newId =
      Math.max(
        ...Object.values(weeklyPhotos)
          .flat()
          .map((photo) => photo.id),
        0,
      ) + 1

    const photoToAdd: WeeklyPhoto = {
      id: newId,
      week: Number.parseInt(newPhoto.week.toString()),
      month: selectedMonth,
      theme: newPhoto.theme,
      photographer: newPhoto.photographer,
      email: newPhoto.email,
      description: newPhoto.description,
      image: newPhoto.image,
    }

    setWeeklyPhotos((prev) => {
      const updatedPhotos = { ...prev }
      if (!updatedPhotos[selectedMonth]) {
        updatedPhotos[selectedMonth] = []
      }
      updatedPhotos[selectedMonth] = [...updatedPhotos[selectedMonth], photoToAdd]
      return updatedPhotos
    })

    // Reset form
    setNewPhoto({
      week: 1,
      theme: "",
      photographer: "",
      email: "",
      description: "",
      image: "/placeholder.svg?height=600&width=400",
    })

    setShowAddForm(false)
  }

  const handleDeletePhoto = (id: number) => {
    setWeeklyPhotos((prev) => {
      const updatedPhotos = { ...prev }

      // Find and remove the photo with the given id
      Object.keys(updatedPhotos).forEach((month) => {
        updatedPhotos[month] = updatedPhotos[month].filter((photo) => photo.id !== id)
      })

      return updatedPhotos
    })
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/admin/dashboard" className="mr-4">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">POTW Management</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Photo of the Week Entries</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              {showAddForm ? (
                "Cancel"
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" /> Add New Photo
                </>
              )}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Add New Photo</h3>
              <form onSubmit={handleAddPhoto} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="month" className="block text-sm font-medium">
                    Month
                  </label>
                  <select
                    id="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="week" className="block text-sm font-medium">
                    Week
                  </label>
                  <select
                    id="week"
                    name="week"
                    value={newPhoto.week}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Week 1</option>
                    <option value={2}>Week 2</option>
                    <option value={3}>Week 3</option>
                    <option value={4}>Week 4</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="theme" className="block text-sm font-medium">
                    Theme
                  </label>
                  <input
                    id="theme"
                    name="theme"
                    type="text"
                    value={newPhoto.theme}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="photographer" className="block text-sm font-medium">
                    Photographer Name
                  </label>
                  <input
                    id="photographer"
                    name="photographer"
                    type="text"
                    value={newPhoto.photographer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={newPhoto.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="image" className="block text-sm font-medium">
                    Image URL
                  </label>
                  <div className="flex">
                    <input
                      id="image"
                      name="image"
                      type="text"
                      value={newPhoto.image}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      className="bg-gray-700 px-3 py-2 border border-gray-700 rounded-r-md"
                      title="Upload Image (not functional in demo)"
                    >
                      <Upload className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">In a real app, this would be an image upload field.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={newPhoto.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Add Photo
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="monthFilter" className="block text-sm font-medium mb-2">
              Filter by Month
            </label>
            <select
              id="monthFilter"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {weeklyPhotos[selectedMonth] && weeklyPhotos[selectedMonth].length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weeklyPhotos[selectedMonth].map((photo) => (
                <div key={photo.id} className="bg-gray-700 rounded-lg overflow-hidden">
                  <div className="relative h-48">
                    <Image src={photo.image || "/placeholder.svg"} alt={photo.theme} fill className="object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">Week {photo.week}</h3>
                        <p className="text-sm text-gray-400">{photo.theme}</p>
                      </div>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Delete Photo"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 mb-1">{photo.photographer}</p>
                    <p className="text-xs text-gray-400 truncate">{photo.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-700 rounded-lg p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-medium mb-2">No Photos for {selectedMonth}</h3>
              <p className="text-gray-400 mb-4">There are no photos added for this month yet.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Add Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
