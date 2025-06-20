import { createClient } from "@/utils/supabase/client"

/**
 * Checks if a user's email is authorized by checking against the student table
 * @param email The email to check
 * @returns A boolean indicating if the user is authorized
 */
export async function checkUserAuthorization(email: string): Promise<boolean> {
  if (!email) return false

  const supabase = createClient()
  const { data, error } = await supabase.from("student").select("*").eq("email", email).single()

  return !!data && !error
}

/**
 * Protects a route by checking if the user is authenticated and authorized
 * @param router The Next.js router
 * @param user The current user
 * @param isAuthorized The authorization status
 * @param isLoading Whether authentication is still loading
 */
export function protectRoute(router: any, user: any, isAuthorized: boolean | null, isLoading: boolean): void {
  if (!isLoading) {
    if (!user) {
      router.push("/auth/signin")
    } else if (isAuthorized === false) {
      router.push("/auth/unauthorized")
    }
  }
}
