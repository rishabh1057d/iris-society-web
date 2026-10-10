"use client"

import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const databaseConfigured = Boolean(url && anonKey && process.env.NEXT_PUBLIC_DATABASE_DISABLED !== "1")
export const supabaseBrowser = createClient(databaseConfigured ? url : "https://unconfigured.invalid", databaseConfigured ? anonKey : "unconfigured")

export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const { data: { session } } = await supabaseBrowser.auth.getSession()
  const headers = new Headers(init?.headers)
  if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`)
  return fetch(input, { ...init, headers })
}

export default supabaseBrowser
