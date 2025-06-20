"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react"

// Gallery item type
type GalleryItem = {
  id: number
  alt: string
  width: number
  height: number
  className?: string
  image: string
}

export default function GalleryManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([
    {
      id: 1,
      alt: "Landscape View",
      width: 800,
      height: 500,
      className: "col-span-2",
      image: "/placeholder.svg?height=500&width=800",
    },
    {
      id: 2,
      alt: "Portrait Shot",
      width: 400,
      height: 600,
      className: "row-span-2",
      image: "/placeholder.svg?height=600&width=400",
    },
    { id: 3, alt: "Square Photo", width: 400, height: 400, image: "/placeholder.svg?height=400&width=400" },
    {
      id: 4,
      alt: "Wide Shot",
      width: 800,
      height: 400,
      className: "col-span-2",
      image: "/placeholder.svg?height=400&width=800",
    },
    { id: 5, alt: "Square Memory", width: 400, height: 400, image: "/placeholder.svg?height=400&width=400" },
    {
      id: 6,
      alt: "Landscape View",
      width: 600,
      height: 400,
      className: "col-span-2",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: 7,
      alt: "Portrait Shot",
      width: 400,
      height: 600,
      className: "row-span-2",
      image: "/placeholder.svg?height=600&width=400",
    },
    { id: 8, alt: "Square Photo", width: 400, height: 400, image: "/placeholder.svg?height=400&width=400" },
    {
      id: 9,
      alt: "Wide Shot",
      width: 800,
      height: 400,
      className: "col-span-2",
      image: "/placeholder.svg?height=400&width=800",
    },
    {
      id: 10,
      alt: "Vertical View",
      width: 400,
      height: 600,
      className: "row-span-2",
      image: "/placeholder.svg?height=600&width=400",
    },
    { id: 11, alt: "Square Memory", width: 400, height: 400, image: "/placeholder.svg?height=400&width=400" },
  ])
  const [newItem, setNewItem] = useState<Omit<GalleryItem, "id">>({
    alt: "",
    width: 400,
    height: 400,
    className: "",
    image: "/placeholder.svg?height=400&width=400",
  })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewItem((prev) => ({
      ...prev,
      [name]: name === "width" || name === "height" ? Number.parseInt(value) : value,
    }))
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, you would upload the image to a server here
    // For now, we'll just add it to our state

    const newId = Math.max(...galleryItems.map((item) => item.id), 0) + 1

    setGalleryItems((prev) => [
      ...prev,
      {
        id: newId,
        ...newItem,
      },
    ])

    // Reset form
    setNewItem({
      alt: "",
      width: 400,
      height: 400,
      className: "",
      image: "/placeholder.svg?height=400&width=400",
    })

    setShowAddForm(false)
  }

  const handleDeleteItem = (id: number) => {
    setGalleryItems((prev) => prev.filter((item) => item.id !== id))
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
          <h1 className="text-2xl font-bold">Gallery Management</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Gallery Items</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              {showAddForm ? (
                "Cancel"
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" /> Add New Item
                </>
              )}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Add New Gallery Item</h3>
              <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="alt" className="block text-sm font-medium">
                    Alt Text
                  </label>
                  <input
                    id="alt"
                    name="alt"
                    type="text"
                    value={newItem.alt}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="className" className="block text-sm font-medium">
                    CSS Class (Optional)
                  </label>
                  <select
                    id="className"
                    name="className"
                    value={newItem.className}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    <option value="col-span-2">Wide (col-span-2)</option>
                    <option value="row-span-2">Tall (row-span-2)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="width" className="block text-sm font-medium">
                    Width (px)
                  </label>
                  <input
                    id="width"
                    name="width"
                    type="number"
                    value={newItem.width}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="height" className="block text-sm font-medium">
                    Height (px)
                  </label>
                  <input
                    id="height"
                    name="height"
                    type="number"
                    value={newItem.height}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="image" className="block text-sm font-medium">
                    Image URL
                  </label>
                  <div className="flex">
                    <input
                      id="image"
                      name="image"
                      type="text"
                      value={newItem.image}
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

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Add Gallery Item
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-auto">
            {galleryItems.map((item) => (
              <div key={item.id} className={`gallery-item rounded-lg overflow-hidden relative ${item.className || ""}`}>
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 bg-red-600 rounded-full"
                    title="Delete Item"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-xs">{item.alt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
