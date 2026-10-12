import { NextResponse } from "next/server"
import { supabaseServer, databaseConfigured, trustedPotwPreview } from "./supabase-server"

export async function requireUser(request: Request) {
  const authorization = request.headers.get("authorization")
  const token = authorization?.match(/^Bearer (\S+)$/i)?.[1]
  if (!token) {
    return { user: null, error: NextResponse.json({ success: false, error: "Sign in required" }, { status: 401 }) }
  }
  const previewPathAllowed = /^\/api\/(?:potw(?:\/|$)|admin\/(?:potw(?:\/|$)|me$))/.test(new URL(request.url).pathname)
  if (!databaseConfigured || (trustedPotwPreview && !previewPathAllowed)) {
    return { user: null, error: NextResponse.json({ success: false, error: "Database features are unavailable in this environment" }, { status: 503 }) }
  }

  const { data, error } = await supabaseServer.auth.getUser(token)
  if (error || !data.user?.email || !data.user.email_confirmed_at) {
    return { user: null, error: NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 }) }
  }

  return { user: data.user, error: null }
}

export async function requireAdmin(request: Request) {
  const auth = await requireUser(request)
  if (auth.error) return auth

  const admins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!admins.includes(auth.user!.email!.toLowerCase())) {
    return { user: null, error: NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 }) }
  }

  return auth
}
