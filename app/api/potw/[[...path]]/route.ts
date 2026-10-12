import { memberHandler } from "@/lib/potw/api"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60
type Context = { params: Promise<{ path?: string[] }> }
async function handle(request: Request, context: Context) { return memberHandler(request, (await context.params).path ?? []) }
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE }
