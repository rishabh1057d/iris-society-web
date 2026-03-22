import { NextResponse } from "next/server"
import { supabaseServer } from "../../../../lib/supabase-server"

/**
 * GET /api/admin/registrations?event_name=xxx
 * Returns all registration rows, optionally filtered by event_name.
 * Also supports ?format=csv to stream a CSV download.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const eventName = url.searchParams.get("event_name")
    const format = url.searchParams.get("format") // "csv" | null

    let query = supabaseServer
      .from("event_registrations")
      .select("*")
      .order("created_at", { ascending: false })

    if (eventName) {
      query = query.eq("event_name", eventName)
    }

    const { data, error } = await query

    if (error) throw error

    // ── CSV export ──
    if (format === "csv") {
      if (!data || data.length === 0) {
        return new Response("No data to export", { status: 200, headers: { "Content-Type": "text/plain" } })
      }

      const columns = Object.keys(data[0])
      const header = columns.join(",")
      const rows = data.map((row: any) =>
        columns
          .map((col) => {
            const val = row[col]
            if (val === null || val === undefined) return ""
            const str = String(val).replace(/"/g, '""')
            return `"${str}"`
          })
          .join(",")
      )
      const csv = [header, ...rows].join("\n")

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="registrations${eventName ? "_" + eventName.replace(/[^a-zA-Z0-9]/g, "_") : ""}.csv"`,
        },
      })
    }

    // ── JSON response ──
    return NextResponse.json({ success: true, data, count: data?.length || 0 })
  } catch (error) {
    console.error("Admin registrations GET error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
