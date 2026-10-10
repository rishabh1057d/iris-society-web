import { NextResponse } from "next/server"
import { requireAdmin } from "../../../../lib/api-auth"

export async function GET(request: Request) {
  const auth = await requireAdmin(request)
  if (auth.error) return auth.error
  return NextResponse.json({ success: true })
}
