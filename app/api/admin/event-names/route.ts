import { NextResponse } from "next/server"
import { supabaseServer } from "../../../../lib/supabase-server"

/**
 * GET /api/admin/event-names
 * Returns a list of distinct event_name values from registrations.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("event_registrations")
      .select("event_name")

    if (error) throw error

    const names = (data || []).map((r: any) => r.event_name).filter(Boolean) as string[]
    const unique = names.filter((v, i, a) => a.indexOf(v) === i)
    return NextResponse.json({ success: true, event_names: unique })
  } catch (error) {
    console.error("Admin event-names GET error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
