"use client"
import { useEffect, useState } from "react"
import { authenticatedFetch, databaseConfigured, supabaseBrowser } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import type { Student } from "@/lib/potw/types"

export async function potwFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await authenticatedFetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers }, cache: "no-store" })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "Request failed. Please try again.")
  return data as T
}
export function usePotwSession(admin = false) {
  const [ready, setReady] = useState(false), [error, setError] = useState(""), [student, setStudent] = useState<Pick<Student,"display_name"|"student_id"> | null>(null)
  useEffect(() => {
    let alive = true, generation = 0
    let timer: ReturnType<typeof setTimeout>
    async function check() {
      if (!alive) return
      const current = ++generation
      setReady(false); setStudent(null); setError("")
      if (!databaseConfigured) { setError("Database-backed features are disabled in this environment."); return }
      try {
        const data = await potwFetch<{ student?: Pick<Student,"display_name"|"student_id"> }>(admin ? "/api/admin/me" : "/api/potw/me")
        if (alive && current === generation) { setStudent(data.student ?? null); setReady(true) }
      } catch (e) { if (alive && current === generation) setError(e instanceof Error ? e.message : "Unable to check membership") }
    }
    function scheduleCheck() {
      if (!alive) return
      ++generation; setReady(false); setStudent(null)
      clearTimeout(timer)
      // Session lookups inside auth callbacks can deadlock the Supabase client.
      timer = setTimeout(() => { void check() }, 0)
    }
    scheduleCheck()
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(scheduleCheck)
    return () => { alive = false; clearTimeout(timer); subscription.unsubscribe() }
  }, [admin])
  async function signIn() {
    const { error } = await supabaseBrowser.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + window.location.pathname, queryParams: { prompt: "select_account" } } })
    if (error) setError(error.message)
  }
  return { ready, error, student, signIn, signOut: () => supabaseBrowser.auth.signOut() }
}
export function SessionGate({ error, signIn, admin = false }: { error: string; signIn: () => Promise<void>; admin?: boolean }) {
  return <section className="event-glass space-y-4 rounded-2xl p-6"><h2 className="text-xl font-semibold">Sign in to continue</h2><p className="text-white/80">{admin ? "Use the Google account on the society’s server-side admin allowlist." : "Use the IITM BS Google account listed in the society’s approved roster. Signing in alone does not verify membership."}</p>{error && <p role="alert" className="text-red-200">{error}</p>}<Button className="min-h-11" onClick={() => void signIn()}>Continue with Google</Button>{!admin && <p className="text-sm text-white/75">Not on the roster? Contact the society through its email or WhatsApp/Gspace groups.</p>}</section>
}
