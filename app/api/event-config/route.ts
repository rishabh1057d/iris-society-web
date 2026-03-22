import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Public Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * GET /api/event-config
 * Returns the current active event configuration (public access).
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('event_config')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) {
      console.error("GET event-config error:", error)
      return NextResponse.json({ success: false, error: "Could not read config" }, { status: 500 })
    }

    // Transform database format to expected JSON format
    const config = {
      event_name: data.event_name,
      event_description: data.event_description,
      poster_image: data.poster_image,
      registration_open: data.registration_open,
      registration_deadline: data.registration_deadline,
      deadline_text: data.deadline_text,
      closed_message: data.closed_message,
      success_message: data.success_message,
      already_registered_message: data.already_registered_message,
      form_fields: data.form_fields
    }

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error("GET event-config error:", error)
    return NextResponse.json({ success: false, error: "Could not read config" }, { status: 500 })
  }
}