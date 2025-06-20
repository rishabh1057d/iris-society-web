import { createClient } from "@/utils/supabase/server"

type AuthorizedUser = {
  email: string
  name: string
}

export async function uploadAuthorizedUsers() {
  try {
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IRIS_%20Photography%20Society%20%28Responses%29-T6bYw5rCgQ0m1fqtqteHo0V4FmZW8A.csv",
    )
    const csvText = await response.text()

    // Parse CSV
    const rows = csvText.split("\n")
    const headers = rows[0].split(",")

    // Find the indices of the email and name columns
    const emailIndex = headers.findIndex((h) => h.trim() === "Email Address")
    const nameIndex = headers.findIndex((h) => h.trim() === "Name")

    if (emailIndex === -1 || nameIndex === -1) {
      throw new Error("CSV format is not as expected. Could not find Email Address or Name columns.")
    }

    // Parse the data rows
    const users: AuthorizedUser[] = []
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue // Skip empty rows

      const columns = rows[i].split(",")
      const email = columns[emailIndex].trim()
      const name = columns[nameIndex].trim()

      if (email && name) {
        users.push({ email, name })
      }
    }

    // Upload to Supabase
    const supabase = await createClient()

    // Insert in batches to avoid potential limitations
    const batchSize = 100
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize)
      const { error } = await supabase.from("authorized_users").upsert(batch, { onConflict: "email" })

      if (error) {
        console.error("Error uploading batch:", error)
        throw error
      }
    }

    return { success: true, count: users.length }
  } catch (error) {
    console.error("Error uploading authorized users:", error)
    return { success: false, error }
  }
}
