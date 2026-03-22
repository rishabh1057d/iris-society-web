import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client (using service key for admin operations)
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/admin/event-config
 * Returns the current active event configuration from database.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('event_config')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) {
      console.error("GET event-config error:", error)
      return NextResponse.json({ success: false, error: "Could not read config" }, { status: 500 })
    }

    // Transform database format back to the expected JSON format
    const config = {
      event_name: data.event_name,
      event_description: data.event_description,
      poster_image: data.poster_image,
      registration_open: data.registration_open,
      registration_deadline: data.registration_deadline,
      deadline_text: data.deadline_text,
      closed_message: data.closed_message,
      success_message: data.success_message,
      already_registered_message: data.already_registered_message,
      form_fields: data.form_fields
    }

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error("GET event-config error:", error)
    return NextResponse.json({ success: false, error: "Could not read config" }, { status: 500 })
  }
}

/**
 * PUT /api/admin/event-config
 * Updates the active event configuration in database.
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    // Get the current active config ID
    const { data: currentConfig, error: fetchError } = await supabaseServer
      .from('event_config')
      .select('id')
      .eq('is_active', true)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error fetching current config:", fetchError)
      return NextResponse.json({ success: false, error: "Could not fetch current config" }, { status: 500 })
    }

    let updatedData
    if (currentConfig) {
      // Update existing config
      const { data, error } = await supabaseServer
        .from('event_config')
        .update({
          event_name: body.event_name,
          event_description: body.event_description,
          poster_image: body.poster_image,
          registration_open: body.registration_open,
          registration_deadline: body.registration_deadline,
          deadline_text: body.deadline_text,
          closed_message: body.closed_message,
          success_message: body.success_message,
          already_registered_message: body.already_registered_message,
          form_fields: body.form_fields,
        })
        .eq('id', currentConfig.id)
        .select()
        .single()

      if (error) {
        console.error("PUT event-config update error:", error)
        return NextResponse.json({ success: false, error: "Could not update config" }, { status: 500 })
      }
      updatedData = data
    } else {
      // Create new config if none exists
      const { data, error } = await supabaseServer
        .from('event_config')
        .insert({
          event_name: body.event_name,
          event_description: body.event_description,
          poster_image: body.poster_image,
          registration_open: body.registration_open,
          registration_deadline: body.registration_deadline,
          deadline_text: body.deadline_text,
          closed_message: body.closed_message,
          success_message: body.success_message,
          already_registered_message: body.already_registered_message,
          form_fields: body.form_fields,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        console.error("PUT event-config insert error:", error)
        return NextResponse.json({ success: false, error: "Could not create config" }, { status: 500 })
      }
      updatedData = data
    }

    // Transform back to expected format
    const config = {
      event_name: updatedData.event_name,
      event_description: updatedData.event_description,
      poster_image: updatedData.poster_image,
      registration_open: updatedData.registration_open,
      registration_deadline: updatedData.registration_deadline,
      deadline_text: updatedData.deadline_text,
      closed_message: updatedData.closed_message,
      success_message: updatedData.success_message,
      already_registered_message: updatedData.already_registered_message,
      form_fields: updatedData.form_fields
    }

    return NextResponse.json({ success: true, config })
  } catch (error) {
    console.error("PUT event-config error:", error)
    return NextResponse.json({ success: false, error: "Could not write config" }, { status: 500 })
  }
}
