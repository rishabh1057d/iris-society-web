"use client"

import React, { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import supabaseBrowser from "../lib/supabase-browser"

/* ─────────────────────── types ─────────────────────── */
type EventConfig = {
  event_name: string
  event_description: string
  poster_image: string
  registration_open: boolean
  registration_deadline: string
  deadline_text: string
  closed_message: string
  success_message: string
  already_registered_message: string
  form_fields: {
    full_name: boolean
    gender: boolean
    contact_number: boolean
    current_level: boolean
    house: boolean
  }
}

type FormState = {
  full_name: string
  gender: string
  contact_number: string
  current_level: string
  house: string
}

/* ─────────────────────── constants ─────────────────────── */
const ALLOWED_DOMAINS = ["@ds.study.iitm.ac.in", "@es.study.iitm.ac.in"]

const houses = [
  "Bandipur", "Corbett", "Gir", "Kanha", "Kaziranga",
  "Nallamala", "Namdapha", "Nilgiri", "Pichavaram",
  "Saranda", "Sunderbans", "Wayanad", "NA",
]

const isAllowedEmail = (email: string) =>
  ALLOWED_DOMAINS.some((d) => email.endsWith(d))

/* ─────────────────────── component ─────────────────────── */
export default function EventRegistration() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null)
  const [form, setForm] = useState<FormState>({
    full_name: "",
    gender: "male",
    contact_number: "",
    current_level: "Degree",
    house: "NA",
  })
  const [registered, setRegistered] = useState(false)
  const [config, setConfig] = useState<EventConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [deadlinePassed, setDeadlinePassed] = useState(false)
  const [justRegistered, setJustRegistered] = useState(false)

  /* ── load config ── */
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/event-config", {
          cache: 'no-store' // Always fetch fresh config
        })
        if (res.ok) {
          const response = await res.json()
          if (response.success && response.config) {
            const data: EventConfig = response.config
            setConfig(data)
            if (data.registration_deadline) {
              setDeadlinePassed(new Date() > new Date(data.registration_deadline))
            }
          }
        }
      } catch {
        // fallback handled by null config
      } finally {
        setConfigLoading(false)
      }
    })()
  }, [])

  /* ── check registration for a given session ── */
  const checkRegistration = useCallback(
    async (userSession: any) => {
      if (!userSession?.user?.email || !config) return
      const email = userSession.user.email as string
      try {
        const res = await fetch(
          `/api/events/register?email=${encodeURIComponent(email)}&event_name=${encodeURIComponent(config.event_name)}`
        )
        const j = await res.json()
        if (res.ok && j.registered) {
          setRegistered(true)
          const d = j.data || {}
          setForm({
            full_name: d.full_name || "",
            gender: d.gender || "male",
            contact_number: d.contact_number || "",
            current_level: d.current_level || "Degree",
            house: d.house || "NA",
          })
        }
      } catch (err) {
        console.error("Error checking registration:", err)
      }
    },
    [config]
  )

  /* ── auth init ── */
  useEffect(() => {
    if (configLoading) return

    let mounted = true

    const initAuth = async () => {
      /* Supabase processes the hash fragment (access_token etc.) internally
         when getSession is called. This is how the redirect-back flow works. */
      const { data } = await supabaseBrowser.auth.getSession()
      if (!mounted) return

      const sess = data.session ?? null
      if (sess && sess.user?.email) {
        const email = sess.user.email as string
        if (!isAllowedEmail(email)) {
          setStatus({
            type: "error",
            text: "Only @ds.study.iitm.ac.in and @es.study.iitm.ac.in emails are allowed. Signing out…",
          })
          await supabaseBrowser.auth.signOut()
          setSession(null)
          setLoading(false)
          return
        }

        // Populate name from Google profile if available
        if (sess.user.user_metadata?.full_name) {
          setForm((f) => ({ ...f, full_name: f.full_name || sess.user.user_metadata.full_name }))
        }
      }

      setSession(sess)
      if (sess) await checkRegistration(sess)
      setLoading(false)

      // Clean up hash from the URL after OAuth redirect
      if (typeof window !== "undefined" && window.location.hash && window.location.hash.includes("access_token")) {
        window.history.replaceState(null, "", window.location.pathname)
      }
    }

    initAuth()

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      async (_event, sess) => {
        if (!mounted) return
        setSession(sess ?? null)

        if (sess?.user?.email) {
          if (!isAllowedEmail(sess.user.email)) {
            setStatus({
              type: "error",
              text: "Only @ds.study.iitm.ac.in and @es.study.iitm.ac.in emails are allowed. Signing out…",
            })
            await supabaseBrowser.auth.signOut()
            setSession(null)
            return
          }
          await checkRegistration(sess)
        }
      }
    )

    return () => {
      mounted = false
      try {
        listener.subscription.unsubscribe()
      } catch {}
    }
  }, [configLoading, checkRegistration])

  /* ── sign in ── */
  const signInWithGoogle = async () => {
    setStatus(null)
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin + "/events/register" : undefined,
        queryParams: { prompt: "select_account" },
      },
    })
    if (error) {
      setStatus({ type: "error", text: error.message })
    }
  }

  /* ── sign out ── */
  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
    setSession(null)
    setRegistered(false)
    setJustRegistered(false)
    setStatus(null)
    setForm({ full_name: "", gender: "male", contact_number: "", current_level: "Degree", house: "NA" })
  }

  /* ── submit ── */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)
    if (!session?.user?.email) {
      setStatus({ type: "error", text: "Please sign in first" })
      return
    }
    const email = session.user.email as string
    if (!isAllowedEmail(email)) {
      setStatus({ type: "error", text: "Unauthorized email domain" })
      return
    }
    if (registered) {
      setStatus({ type: "info", text: config?.already_registered_message || "You are already registered." })
      return
    }
    if (!form.full_name.trim()) {
      setStatus({ type: "error", text: "Full name is required" })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_email: email,
          event_name: config?.event_name || "Unknown Event",
          ...form,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.error === "already_registered") {
          setRegistered(true)
          setStatus({ type: "info", text: config?.already_registered_message || "Already registered!" })
        } else {
          setStatus({ type: "error", text: data?.error || "Registration failed" })
        }
      } else {
        setRegistered(true)
        setJustRegistered(true)
        setStatus({ type: "success", text: config?.success_message || "Registered successfully!" })
      }
    } catch {
      setStatus({ type: "error", text: "Network error. Please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  /* ─────────────────────── render helpers ─────────────────────── */
  const isClosed = config && (!config.registration_open || deadlinePassed)

  const StatusBadge = () => {
    if (!status) return null
    const colors = {
      success: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
      error: "bg-red-500/20 border-red-500/40 text-red-300",
      info: "bg-blue-500/20 border-blue-500/40 text-blue-300",
    }
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl border px-4 py-3 text-sm font-medium ${colors[status.type]}`}
      >
        {status.type === "success" && <span className="mr-2">✓</span>}
        {status.type === "error" && <span className="mr-2">✕</span>}
        {status.type === "info" && <span className="mr-2">ℹ</span>}
        {status.text}
      </motion.div>
    )
  }

  /* ─────────────────────── skeleton / loading ─────────────────────── */
  if (configLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  /* ─────────────────────── CLOSED STATE ─────────────────────── */
  if (isClosed && !registered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl text-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Registration Closed</h2>
              <p className="text-white/60 leading-relaxed">
                {config?.closed_message || "Registration for this event is now closed."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ─────────────────────── SIGN-IN STATE ─────────────────────── */
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Gradient accent */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />

            {/* Poster image */}
            {config?.poster_image && (
              <div className="relative w-full h-48 overflow-hidden">
                <Image
                  src={config.poster_image}
                  alt={config.event_name || "Event poster"}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
              </div>
            )}

            <div className="relative z-10 p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {config?.event_name || "Event Registration"}
                </h1>
                <p className="text-white/60 text-sm leading-relaxed">
                  {config?.event_description || "Sign in with your student Google account to register."}
                </p>
                {config?.deadline_text && (
                  <p className="mt-3 text-xs text-amber-400/80 font-medium">
                    ⏰ {config.deadline_text}
                  </p>
                )}
              </div>

              <StatusBadge />

              <button
                onClick={signInWithGoogle}
                className="mt-4 w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-white font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10 active:scale-[0.98]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
              </button>

              <p className="mt-5 text-center text-xs text-white/40">
                Only <span className="text-blue-400/70">@ds.study.iitm.ac.in</span> and{" "}
                <span className="text-blue-400/70">@es.study.iitm.ac.in</span> emails are allowed.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ─────────────────────── ALREADY REGISTERED STATE ─────────────────────── */
  if (registered && !justRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg"
        >
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 pointer-events-none" />
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-3">Already Registered!</h2>
              <p className="text-white/60 mb-6 leading-relaxed">
                {config?.already_registered_message || "You are already registered for this event."}
              </p>

              {/* Show registered details */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-left space-y-2 mb-6">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Your Registration</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-white/50">Name</span>
                  <span className="text-white font-medium">{form.full_name}</span>
                  <span className="text-white/50">Email</span>
                  <span className="text-white font-medium text-xs break-all">{session.user.email}</span>
                  {form.contact_number && (
                    <>
                      <span className="text-white/50">Contact</span>
                      <span className="text-white font-medium">{form.contact_number}</span>
                    </>
                  )}
                  <span className="text-white/50">Level</span>
                  <span className="text-white font-medium">{form.current_level}</span>
                  <span className="text-white/50">House</span>
                  <span className="text-white font-medium">{form.house}</span>
                </div>
              </div>

              <button
                onClick={signOut}
                className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4"
              >
                Sign out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ─────────────────────── SUCCESS STATE ─────────────────────── */
  if (justRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-full max-w-lg"
        >
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10 pointer-events-none" />

            {/* Decorative dots */}
            <div className="absolute top-4 left-6 w-2 h-2 rounded-full bg-blue-400/30 animate-pulse" />
            <div className="absolute top-8 right-10 w-1.5 h-1.5 rounded-full bg-purple-400/30 animate-pulse" style={{ animationDelay: "0.5s" }} />
            <div className="absolute bottom-12 left-10 w-1 h-1 rounded-full bg-emerald-400/30 animate-pulse" style={{ animationDelay: "1s" }} />

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-3">Registration Successful!</h2>
              <p className="text-white/60 leading-relaxed">
                {config?.success_message || "You have been successfully registered!"}
              </p>

              <div className="mt-6">
                <button
                  onClick={signOut}
                  className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ─────────────────────── REGISTRATION FORM ─────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          {/* Gradient accent */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />

          {/* Poster */}
          {config?.poster_image && (
            <div className="relative w-full h-44 overflow-hidden">
              <Image
                src={config.poster_image}
                alt={config.event_name || "Event"}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
            </div>
          )}

          <div className="relative z-10 p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">
                {config?.event_name || "Event Registration"}
              </h1>
              <p className="text-white/50 text-sm">
                Signed in as{" "}
                <span className="text-blue-400/80">{session.user.email}</span>
                <button
                  onClick={signOut}
                  className="ml-2 text-white/30 hover:text-white/60 transition-colors underline underline-offset-2 text-xs"
                >
                  (sign out)
                </button>
              </p>
              {config?.deadline_text && (
                <p className="mt-2 text-xs text-amber-400/80 font-medium">⏰ {config.deadline_text}</p>
              )}
            </div>

            <StatusBadge />

            <form onSubmit={submit} className="space-y-5 mt-4">
              {/* Full Name */}
              {config?.form_fields?.full_name !== false && (
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-300"
                  />
                </div>
              )}

              {/* Gender */}
              {config?.form_fields?.gender !== false && (
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-300 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                  >
                    <option value="male" className="bg-slate-800">Male</option>
                    <option value="female" className="bg-slate-800">Female</option>
                    <option value="other" className="bg-slate-800">Other</option>
                  </select>
                </div>
              )}

              {/* Contact Number */}
              {config?.form_fields?.contact_number !== false && (
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Contact Number (WhatsApp) <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.contact_number}
                    onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                    required
                    placeholder="e.g. 9876543210"
                    type="tel"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-300"
                  />
                </div>
              )}

              {/* Current Level */}
              {config?.form_fields?.current_level !== false && (
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    Current Level <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.current_level}
                    onChange={(e) => setForm({ ...form, current_level: e.target.value })}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-300 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                  >
                    <option value="Foundation" className="bg-slate-800">Foundation</option>
                    <option value="Diploma" className="bg-slate-800">Diploma</option>
                    <option value="Degree" className="bg-slate-800">Degree</option>
                  </select>
                </div>
              )}

              {/* House */}
              {config?.form_fields?.house !== false && (
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">
                    House <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={form.house}
                    onChange={(e) => setForm({ ...form, house: e.target.value })}
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-300 appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
                  >
                    {houses.map((h) => (
                      <option key={h} value={h} className="bg-slate-800">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering…
                  </span>
                ) : (
                  "Register"
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
