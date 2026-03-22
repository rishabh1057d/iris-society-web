import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!serviceRole) {
  // it's ok for local dev; server API routes should have this set in production
}

export const supabaseServer = createClient(url, serviceRole)

export default supabaseServer
