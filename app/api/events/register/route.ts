 import { NextResponse } from "next/server"
import { supabaseServer } from "../../../../lib/supabase-server"

const ALLOWED_DOMAINS = ["@ds.study.iitm.ac.in", "@es.study.iitm.ac.in"]

const isAllowedEmail = (email: string) =>
  ALLOWED_DOMAINS.some((d) => email.endsWith(d))

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get("email")
    const eventName = url.searchParams.get("event_name")

    if (!email) return NextResponse.json({ success: false, error: "email required" }, { status: 400 })

    let query = supabaseServer
      .from("event_registrations")
      .select("*")
      .eq("student_email", email)

    if (eventName) {
      query = query.eq("event_name", eventName)
    }

    const { data, error } = await query.limit(1)

    if (error) throw error

    const registered = Array.isArray(data) && data.length > 0
    return NextResponse.json({ success: true, registered, data: registered ? data[0] : null })
  } catch (error) {
    console.error("Error in events register GET:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { student_email, full_name, gender, contact_number, current_level, house, event_name } = body

    if (!student_email || !full_name) {
      return NextResponse.json({ success: false, error: "missing fields" }, { status: 400 })
    }

    if (!isAllowedEmail(student_email)) {
      return NextResponse.json({ success: false, error: "unauthorized domain" }, { status: 403 })
    }

    // check existing registration for this event
    let existsQuery = supabaseServer
      .from("event_registrations")
      .select("id")
      .eq("student_email", student_email)

    if (event_name) {
      existsQuery = existsQuery.eq("event_name", event_name)
    }

    const { data: exists, error: selErr } = await existsQuery.limit(1)

    if (selErr) throw selErr
    if (exists && exists.length > 0) {
      return NextResponse.json({ success: false, error: "already_registered" }, { status: 409 })
    }

    const { data, error } = await supabaseServer
      .from("event_registrations")
      .insert([
        { student_email, full_name, gender, contact_number, current_level, house, event_name: event_name || null },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in events register POST:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
