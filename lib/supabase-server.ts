import { createClient } from "@supabase/supabase-js"
import { potwPreviewAllowed } from "./potw-preview.mjs"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export const trustedPotwPreview = potwPreviewAllowed(process.env)
export const databaseConfigured = Boolean(url && serviceRole && (process.env.VERCEL_ENV !== "preview" || trustedPotwPreview))

// Inert defaults let forks and previews build without production credentials.
export const supabaseServer = createClient(databaseConfigured ? url : "https://unconfigured.invalid", databaseConfigured ? serviceRole : "unconfigured", {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})

export default supabaseServer
