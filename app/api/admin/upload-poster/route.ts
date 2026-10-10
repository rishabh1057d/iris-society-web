import { NextResponse } from "next/server"
import { supabaseServer } from "../../../../lib/supabase-server"
import { requireAdmin } from "../../../../lib/api-auth"

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}
const MAX_POSTER_BYTES = 5 * 1024 * 1024

/**
 * POST /api/admin/upload-poster
 * Accepts a multipart form upload with field "file".
 * Uploads to Supabase Storage and returns the public URL.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) return auth.error

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    const extension = IMAGE_TYPES[file.type]
    if (!extension || !file.size || file.size > MAX_POSTER_BYTES) {
      return NextResponse.json({ success: false, error: "Upload a JPG, PNG, or WebP image under 5 MB" }, { status: 400 })
    }

    const safeName = `event_poster_${crypto.randomUUID()}.${extension}`

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    const isImage = extension === "jpg"
      ? buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
      : extension === "png"
        ? buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP"
    if (!isImage) {
      return NextResponse.json({ success: false, error: "File is not a valid image" }, { status: 400 })
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseServer.storage
      .from('event-posters')
      .upload(safeName, buffer, {
        contentType: file.type,
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
