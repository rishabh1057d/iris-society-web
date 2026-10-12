import { timingSafeEqual } from "node:crypto"
import { maintenance } from "@/lib/potw/api"
import { failure, respond } from "@/lib/potw/server"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET, actual = request.headers.get("authorization")
  if (process.env.VERCEL_ENV === "preview" || !expected || !actual || Buffer.byteLength(actual) !== Buffer.byteLength(`Bearer ${expected}`) || !timingSafeEqual(Buffer.from(actual), Buffer.from(`Bearer ${expected}`))) return respond({ error: "Unauthorized" }, 401)
  try { return respond(await maintenance()) } catch (e) { return failure(e) }
}
