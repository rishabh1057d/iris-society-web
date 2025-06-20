"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Calendar, Edit, Plus, Trash2, Upload } from "lucide-react"

// Event type
type Event = {
  id: number
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  organizer: string
  image: string
  isUpcoming: boolean
}

export default function EventManagement() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: "Shutter Safari: Virtual Edition",
      description: "48-hour coding challenge to build innovative solutions for real-world problems.",
      startDate: "2024-04-20",
      endDate: "2024-04-22",
      location: "Margashri",
      organizer: "IRIS Society X Kanha House",
      image: "/placeholder.svg?height=200&width=400",
      isUpcoming: true,
    },
    {
      id: 2,
      title: "Capture Craft",
      description: "48-hour coding challenge to build innovative solutions for real-world problems.",
      startDate: "2024-04-20",
      endDate: "2024-04-22",
      location: "Margashri",
      organizer: "IRIS Society",
      image: "/placeholder.svg?height=200&width=400",
      isUpcoming: true,
    },
    {
      id: 3,
      title: "Visual Voices",
      description: "48-hour coding challenge to build innovative solutions for real-world problems.",
      startDate: "2024-04-20",
      endDate: "2024-04-22",
      location: "Margashri",
      organizer: "IRIS Society X Aayam Society",
      image: "/placeholder.svg?height=200&width=400",
      isUpcoming: true,
    },
    {
      id: 4,
      title: "Festive Frames: Diwali Unfiltered",
      description: "Hands-on design workshop for creative enthusiasts.",
      startDate: "2023-10-29",
      endDate: "2023-11-02",
      location: "Online",
      organizer: "IRIS Society X Nandadap House",
      image: "/placeholder.svg?height=200&width=300",
      isUpcoming: false,
    },
  ])
  const [newEvent, setNewEvent] = useState<Omit<Event, "id" | "isUpcoming">>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    organizer: "",
    image: "/placeholder.svg?height=200&width=400",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (editingEvent) {
      setEditingEvent({
        ...editingEvent,
        [name]: value,
      })
    } else {
      setNewEvent({
        ...newEvent,
        [name]: value,
      })
    }
  }

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingEvent) {
      // Update existing event
      setEvents((prev) => prev.map((event) => (event.id === editingEvent.id ? editingEvent : event)))
      setEditingEvent(null)
    } else {
      // Add new event
      const newId = Math.max(...events.map((event) => event.id), 0) + 1

      // Determine if the event is upcoming based on end date
      const isUpcoming = new Date(newEvent.endDate) >= new Date()

      setEvents((prev) => [
        ...prev,
        {
          id: newId,
          ...newEvent,
          isUpcoming,
        },
      ])
    }

    // Reset form
    setNewEvent({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
      organizer: "",
      image: "/placeholder.svg?height=200&width=400",
    })

    setShowAddForm(false)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowAddForm(true)
  }

  const handleDeleteEvent = (id: number) => {
    setEvents((prev) => prev.filter((event) => event.id !== id))
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
          <h1 className="text-2xl font-bold">Event Management</h1>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Events</h2>
            <button
              onClick={() => {
                setEditingEvent(null)
                setShowAddForm(!showAddForm)
              }}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              {showAddForm && !editingEvent ? (
                "Cancel"
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" /> Add New Event
                </>
              )}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">{editingEvent ? "Edit Event" : "Add New Event"}</h3>
              <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium">
                    Event Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={editingEvent ? editingEvent.title : newEvent.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="organizer" className="block text-sm font-medium">
                    Organizer
                  </label>
                  <input
                    id="organizer"
                    name="organizer"
                    type="text"
                    value={editingEvent ? editingEvent.organizer : newEvent.organizer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="startDate" className="block text-sm font-medium">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={editingEvent ? editingEvent.startDate : newEvent.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="endDate" className="block text-sm font-medium">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={editingEvent ? editingEvent.endDate : newEvent.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-medium">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={editingEvent ? editingEvent.location : newEvent.location}
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
                      value={editingEvent ? editingEvent.image : newEvent.image}
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
                    value={editingEvent ? editingEvent.description : newEvent.description}
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
                    {editingEvent ? "Update Event" : "Add Event"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
            {events.filter((event) => event.isUpcoming).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events
                  .filter((event) => event.isUpcoming)
                  .map((event) => (
                    <div key={event.id} className="bg-gray-700 rounded-lg overflow-hidden">
                      <div className="relative h-48">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-1 text-blue-400 hover:text-blue-300"
                              title="Edit Event"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1 text-red-400 hover:text-red-300"
                              title="Delete Event"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {new Date(event.startDate).toLocaleDateString()} -{" "}
                          {new Date(event.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-300 mb-1">{event.location}</p>
                        <p className="text-xs text-gray-400">{event.organizer}</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-400">No upcoming events.</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Past Events</h3>
            {events.filter((event) => !event.isUpcoming).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {events
                  .filter((event) => !event.isUpcoming)
                  .map((event) => (
                    <div key={event.id} className="bg-gray-700 rounded-lg overflow-hidden">
                      <div className="relative h-36">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-sm">{event.title}</h3>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-1 text-blue-400 hover:text-blue-300"
                              title="Edit Event"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="p-1 text-red-400 hover:text-red-300"
                              title="Delete Event"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(event.startDate).toLocaleDateString()} -{" "}
                          {new Date(event.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-400">No past events.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
