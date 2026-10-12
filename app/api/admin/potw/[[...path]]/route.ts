import { adminHandler } from "@/lib/potw/api"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
type Context = { params: Promise<{ path?: string[] }> }
async function handle(request: Request, context: Context) { return adminHandler(request, (await context.params).path ?? []) }
export { handle as GET, handle as POST, handle as PATCH }
