import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({ success: true, count: 0 })
  } catch (error) {
    console.error("Error in upload API route:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
