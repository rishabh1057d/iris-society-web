import { NextResponse } from "next/server"
import { supabaseServer } from "../../../../lib/supabase-server"
import { requireUser } from "../../../../lib/api-auth"

const ALLOWED_DOMAINS = ["@ds.study.iitm.ac.in", "@es.study.iitm.ac.in"]

const isAllowedEmail = (email: string) =>
  ALLOWED_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain))

export async function GET(request: Request) {
  try {
    const auth = await requireUser(request)
    if (auth.error) return auth.error

    const email = auth.user!.email!.toLowerCase()
    if (!isAllowedEmail(email)) {
      return NextResponse.json({ success: false, error: "Student account required" }, { status: 403 })
    }

    const url = new URL(request.url)
    const requestedEmail = url.searchParams.get("email")
    if (requestedEmail && requestedEmail.toLowerCase() !== email) {
      return NextResponse.json({ success: false, error: "Cannot view another registration" }, { status: 403 })
    }

    let query = supabaseServer
      .from("event_registrations")
      .select("*")
      .eq("student_email", email)

    const eventName = url.searchParams.get("event_name")
    if (eventName) query = query.eq("event_name", eventName)

    const { data, error } = await query.limit(1)
    if (error) throw error

    const registered = Array.isArray(data) && data.length > 0
    return NextResponse.json(
      { success: true, registered, data: registered ? data[0] : null },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    console.error("Error in events register GET:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireUser(request)
    if (auth.error) return auth.error

    const email = auth.user!.email!.toLowerCase()
    if (!isAllowedEmail(email)) {
      return NextResponse.json({ success: false, error: "Student account required" }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Invalid registration" }, { status: 400 })
    }
    if (body.student_email && String(body.student_email).toLowerCase() !== email) {
      return NextResponse.json({ success: false, error: "Cannot register another student" }, { status: 403 })
    }

    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : ""
    const optionalFields = ["gender", "contact_number", "current_level", "house"] as const
    if (!fullName || fullName.length > 120 || optionalFields.some((field) => body[field] != null && (typeof body[field] !== "string" || body[field].length > 120))) {
      return NextResponse.json({ success: false, error: "Invalid registration fields" }, { status: 400 })
    }

    const { data: config, error: configError } = await supabaseServer
      .from("event_config")
      .select("event_name, registration_open, registration_deadline")
      .eq("is_active", true)
      .single()

    if (configError) throw configError
    if (!config?.registration_open || (config.registration_deadline && Date.now() >= new Date(config.registration_deadline).getTime())) {
      return NextResponse.json({ success: false, error: "registration_closed" }, { status: 403 })
    }
    if (body.event_name !== config.event_name) {
      return NextResponse.json({ success: false, error: "Invalid event" }, { status: 400 })
    }

    const { data: exists, error: selectError } = await supabaseServer
      .from("event_registrations")
      .select("id")
      .eq("student_email", email)
      .eq("event_name", config.event_name)
      .limit(1)

    if (selectError) throw selectError
    if (exists?.length) {
      return NextResponse.json({ success: false, error: "already_registered" }, { status: 409 })
    }

    const { data, error } = await supabaseServer
      .from("event_registrations")
      .insert({
        student_email: email,
        full_name: fullName,
        gender: body.gender || null,
        contact_number: body.contact_number || null,
        current_level: body.current_level || null,
        house: body.house || null,
        event_name: config.event_name,
      })
      .select()
      .single()

    if (error?.code === "23505") {
      return NextResponse.json({ success: false, error: "already_registered" }, { status: 409 })
    }
    if (error) throw error

    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Error in events register POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
