import { NextResponse } from "next/server"
import { supabaseServer } from "../../../../lib/supabase-server"

/**
 * POST /api/admin/upload-poster
 * Accepts a multipart form upload with field "file".
 * Uploads to Supabase Storage and returns the public URL.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Sanitise filename
    const ext = file.name.split('.').pop() || "jpg"
    const safeName = `event_poster_${Date.now()}.${ext}`.replace(/[^a-zA-Z0-9._-]/g, "")

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage
    const { data, error } = await supabaseServer.storage
      .from('event-posters')
      .upload(safeName, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error("Supabase storage upload error:", error)
      return NextResponse.json({ success: false, error: "Upload to storage failed" }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseServer.storage
      .from('event-posters')
      .getPublicUrl(safeName)

    return NextResponse.json({ success: true, path: publicUrl })
  } catch (error) {
    console.error("Upload poster error:", error)
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 })
  }
}
