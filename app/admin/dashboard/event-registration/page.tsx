"use client"

import React, { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import supabaseBrowser from "../../../../lib/supabase-browser"

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

type Registration = {
  id: string
  student_email: string
  full_name: string
  gender: string
  contact_number: string
  current_level: string
  house: string
  event_name: string
  created_at: string
}

/* ─────────────────────── component ─────────────────────── */
export default function AdminEventRegistrationPage() {
  /* ── state ── */
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [adminEmails, setAdminEmails] = useState<string[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [denied, setDenied] = useState(false)

  // config editor
  const [config, setConfig] = useState<EventConfig | null>(null)
  const [configSaving, setConfigSaving] = useState(false)
  const [configStatus, setConfigStatus] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // poster upload
  const [posterUploading, setPosterUploading] = useState(false)

  // registrations
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [regLoading, setRegLoading] = useState(false)
  const [eventNames, setEventNames] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>("__all__")
  const [regCount, setRegCount] = useState(0)

  // tab
  const [tab, setTab] = useState<"config" | "registrations">("config")

  /* ── load admin emails ── */
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/admin_emails.json?" + Date.now())
        if (res.ok) {
          const data = await res.json()
          setAdminEmails((data.admin_emails || []).map((e: string) => e.toLowerCase()))
        }
      } catch {}
    })()
  }, [])

  /* ── auth ── */
  useEffect(() => {
    if (adminEmails.length === 0) return

    let mounted = true

    const init = async () => {
      const { data } = await supabaseBrowser.auth.getSession()
      if (!mounted) return
      const sess = data.session ?? null
      setSession(sess)

      if (sess?.user?.email) {
        const email = sess.user.email.toLowerCase()
        if (adminEmails.includes(email)) {
          setIsAdmin(true)
        } else {
          setDenied(true)
        }
      }

      setLoading(false)

      // Clean up hash
      if (typeof window !== "undefined" && window.location.hash?.includes("access_token")) {
        window.history.replaceState(null, "", window.location.pathname)
      }
    }

    init()

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return
      setSession(sess ?? null)
      if (sess?.user?.email) {
        const email = sess.user.email.toLowerCase()
        if (adminEmails.includes(email)) {
          setIsAdmin(true)
          setDenied(false)
        } else {
          setIsAdmin(false)
          setDenied(true)
        }
      } else {
        setIsAdmin(false)
        setDenied(false)
      }
    })

    return () => {
      mounted = false
      try { listener.subscription.unsubscribe() } catch {}
    }
  }, [adminEmails])

  /* ── load config once admin ── */
  useEffect(() => {
    if (!isAdmin) return
    ;(async () => {
      try {
        const res = await fetch("/api/admin/event-config")
        if (res.ok) {
          const j = await res.json()
          if (j.config) setConfig(j.config)
        }
      } catch {}
    })()
  }, [isAdmin])

  /* ── load event names ── */
  useEffect(() => {
    if (!isAdmin) return
    ;(async () => {
      try {
        const res = await fetch("/api/admin/event-names")
        if (res.ok) {
          const j = await res.json()
          setEventNames(j.event_names || [])
        }
      } catch {}
    })()
  }, [isAdmin])

  /* ── load registrations ── */
  const loadRegistrations = useCallback(async () => {
    setRegLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedEvent && selectedEvent !== "__all__") {
        params.set("event_name", selectedEvent)
      }
      const res = await fetch(`/api/admin/registrations?${params}`)
      if (res.ok) {
        const j = await res.json()
        setRegistrations(j.data || [])
        setRegCount(j.count || 0)
      }
    } catch {} finally {
      setRegLoading(false)
    }
  }, [selectedEvent])

  useEffect(() => {
    if (isAdmin && tab === "registrations") loadRegistrations()
  }, [isAdmin, tab, loadRegistrations])

  /* ── sign in ── */
  const signIn = async () => {
    await supabaseBrowser.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? window.location.origin + "/admin/dashboard/event-registration" : undefined,
        queryParams: { prompt: "select_account" },
      },
    })
  }

  /* ── sign out ── */
  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
    setSession(null)
    setIsAdmin(false)
    setDenied(false)
  }

  /* ── save config ── */
  const saveConfig = async () => {
    if (!config) return
    setConfigSaving(true)
    setConfigStatus(null)
    try {
      const res = await fetch("/api/admin/event-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        setConfigStatus({ type: "success", text: "Config saved!" })
      } else {
        setConfigStatus({ type: "error", text: "Failed to save config" })
      }
    } catch {
      setConfigStatus({ type: "error", text: "Network error" })
    } finally {
      setConfigSaving(false)
    }
  }

  /* ── upload poster ── */
  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !config) return
    setPosterUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/upload-poster", { method: "POST", body: fd })
      const j = await res.json()
      if (res.ok && j.path) {
        setConfig({ ...config, poster_image: j.path })
        setConfigStatus({ type: "success", text: "Poster uploaded! Remember to save config." })
      } else {
        setConfigStatus({ type: "error", text: j.error || "Upload failed" })
      }
    } catch {
      setConfigStatus({ type: "error", text: "Upload failed" })
    } finally {
      setPosterUploading(false)
    }
  }

  /* ── download CSV ── */
  const downloadCSV = async () => {
    const params = new URLSearchParams({ format: "csv" })
    if (selectedEvent && selectedEvent !== "__all__") {
      params.set("event_name", selectedEvent)
    }
    const res = await fetch(`/api/admin/registrations?${params}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `registrations${selectedEvent !== "__all__" ? "_" + selectedEvent : ""}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  /* ─────────────────── shared glass input class ─────────────────── */
  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-blue-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-300"
  const labelCls = "block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5"
  const selectDropdownStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    backgroundSize: "20px",
  } as React.CSSProperties

  /* ─────────────────── LOADING ─────────────────── */
  if (loading || adminEmails.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  /* ─────────────────── SIGN-IN ─────────────────── */
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative z-10 p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Admin — Event Registration</h1>
              <p className="text-white/50 text-sm mb-6">Sign in with an authorized Google account to manage event registrations.</p>
              <button onClick={signIn} className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-white font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:shadow-lg active:scale-[0.98]">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in with Google
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ─────────────────── ACCESS DENIED ─────────────────── */
  if (denied || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl text-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Access Denied</h2>
              <p className="text-white/50 text-sm mb-2">Your email <span className="text-red-400/70">{session.user.email}</span> is not authorized to access the admin panel.</p>
              <p className="text-white/40 text-xs mb-6">Contact the site owner to get access.</p>
              <button onClick={signOut} className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-4">Sign out</button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ─────────────────── ADMIN DASHBOARD ─────────────────── */
  return (
    <div className="min-h-screen px-4 py-20">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Event Registration Admin</h1>
            <p className="text-white/50 text-sm mt-1">
              Signed in as <span className="text-blue-400/80">{session.user.email}</span>
              <button onClick={signOut} className="ml-2 text-white/30 hover:text-white/60 transition-colors underline underline-offset-2 text-xs">(sign out)</button>
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["config", "registrations"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                tab === t
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                  : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t === "config" ? "Event Config" : "Registrations"}
            </button>
          ))}
        </div>

        {/* ════════════ CONFIG TAB ════════════ */}
        {tab === "config" && config && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Card: Event Details */}
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
              <div className="relative z-10 space-y-5">
                <h2 className="text-lg font-semibold text-white mb-4">Event Details</h2>

                <div>
                  <label className={labelCls}>Event Name</label>
                  <input value={config.event_name} onChange={(e) => setConfig({ ...config, event_name: e.target.value })} className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Event Description</label>
                  <textarea value={config.event_description} onChange={(e) => setConfig({ ...config, event_description: e.target.value })} rows={3} className={inputCls + " resize-none"} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Registration Deadline</label>
                    <input
                      type="datetime-local"
                      value={config.registration_deadline ? config.registration_deadline.slice(0, 16) : ""}
                      onChange={(e) => setConfig({ ...config, registration_deadline: e.target.value ? new Date(e.target.value).toISOString() : "" })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Deadline Display Text</label>
                    <input value={config.deadline_text} onChange={(e) => setConfig({ ...config, deadline_text: e.target.value })} className={inputCls} placeholder="Registration closes on..." />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className={labelCls + " mb-0"}>Registration Open</label>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, registration_open: !config.registration_open })}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${config.registration_open ? "bg-emerald-500" : "bg-white/10"}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${config.registration_open ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className={`text-xs font-medium ${config.registration_open ? "text-emerald-400" : "text-red-400"}`}>
                    {config.registration_open ? "Open" : "Closed"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card: Poster */}
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 via-transparent to-blue-500/5 pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <h2 className="text-lg font-semibold text-white mb-2">Event Poster</h2>

                {config.poster_image && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10">
                    <Image src={config.poster_image} alt="Current poster" fill className="object-cover" />
                  </div>
                )}

                <p className="text-white/40 text-xs">Current: <span className="text-white/60">{config.poster_image || "none"}</span></p>

                <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06] transition-all">
                  <svg className="h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span className="text-white/60 text-sm">{posterUploading ? "Uploading…" : "Upload new poster"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} disabled={posterUploading} />
                </label>
              </div>
            </div>

            {/* Card: Messages */}
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
              <div className="relative z-10 space-y-5">
                <h2 className="text-lg font-semibold text-white mb-2">Messages</h2>

                <div>
                  <label className={labelCls}>Success Message</label>
                  <textarea value={config.success_message} onChange={(e) => setConfig({ ...config, success_message: e.target.value })} rows={2} className={inputCls + " resize-none"} />
                </div>
                <div>
                  <label className={labelCls}>Already Registered Message</label>
                  <textarea value={config.already_registered_message} onChange={(e) => setConfig({ ...config, already_registered_message: e.target.value })} rows={2} className={inputCls + " resize-none"} />
                </div>
                <div>
                  <label className={labelCls}>Registration Closed Message</label>
                  <textarea value={config.closed_message} onChange={(e) => setConfig({ ...config, closed_message: e.target.value })} rows={2} className={inputCls + " resize-none"} />
                </div>
              </div>
            </div>

            {/* Save */}
            {configStatus && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border px-4 py-3 text-sm font-medium ${configStatus.type === "success" ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" : "bg-red-500/20 border-red-500/40 text-red-300"}`}>
                {configStatus.text}
              </motion.div>
            )}

            <motion.button
              onClick={saveConfig}
              disabled={configSaving}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {configSaving ? "Saving…" : "Save Config"}
            </motion.button>
          </motion.div>
        )}

        {/* ════════════ REGISTRATIONS TAB ════════════ */}
        {tab === "registrations" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Controls */}
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-xl">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                  <div className="flex-1">
                    <label className={labelCls}>Filter by Event</label>
                    <select
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className={inputCls + " appearance-none cursor-pointer"}
                      style={selectDropdownStyle}
                    >
                      <option value="__all__" className="bg-slate-800">All Events</option>
                      {eventNames.map((n) => (
                        <option key={n} value={n} className="bg-slate-800">{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={loadRegistrations} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all">
                      Refresh
                    </button>
                    <button onClick={downloadCSV} className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all">
                      Download CSV
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-xs text-white/40">
                  {regLoading ? "Loading…" : `${regCount} registration(s) found`}
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl overflow-hidden">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
              <div className="relative z-10 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      {["#", "Name", "Email", "Gender", "Contact", "Level", "House", "Event", "Date"].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-white/50 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-8 text-center text-white/40">No registrations found.</td></tr>
                    )}
                    {registrations.map((r, i) => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 text-white/40">{i + 1}</td>
                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{r.full_name}</td>
                        <td className="px-4 py-3 text-white/70 text-xs">{r.student_email}</td>
                        <td className="px-4 py-3 text-white/60 capitalize">{r.gender}</td>
                        <td className="px-4 py-3 text-white/60">{r.contact_number || "—"}</td>
                        <td className="px-4 py-3 text-white/60">{r.current_level}</td>
                        <td className="px-4 py-3 text-white/60">{r.house}</td>
                        <td className="px-4 py-3 text-white/60 text-xs whitespace-nowrap">{r.event_name || "—"}</td>
                        <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
