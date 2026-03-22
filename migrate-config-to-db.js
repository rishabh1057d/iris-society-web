#!/usr/bin/env node

/**
 * Migration script to import existing JSON config data into Supabase database
 * Run with: node migrate-config-to-db.js
 */

import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function migrateEventConfig() {
  try {
    console.log('🚀 Starting event config migration...')
    
    // Read existing JSON file
    const configPath = path.join(process.cwd(), 'public', 'event_registration_config.json')
    const configContent = await fs.readFile(configPath, 'utf-8')
    const config = JSON.parse(configContent)
    
    console.log('📖 Found existing config:', config.event_name)
    
    // Check if config already exists in database
    const { data: existing, error: fetchError } = await supabase
      .from('event_config')
      .select('id')
      .eq('is_active', true)
      .maybeSingle()
    
    if (existing) {
      console.log('⚠️  Active config already exists in database. Updating...')
      
      const { error: updateError } = await supabase
        .from('event_config')
        .update({
          event_name: config.event_name,
          event_description: config.event_description,
          poster_image: config.poster_image,
          registration_open: config.registration_open,
          registration_deadline: config.registration_deadline,
          deadline_text: config.deadline_text,
          closed_message: config.closed_message,
          success_message: config.success_message,
          already_registered_message: config.already_registered_message,
          form_fields: config.form_fields
        })
        .eq('id', existing.id)
      
      if (updateError) throw updateError
      console.log('✅ Config updated successfully!')
      
    } else {
      console.log('📝 Creating new config in database...')
      
      const { error: insertError } = await supabase
        .from('event_config')
        .insert({
          event_name: config.event_name,
          event_description: config.event_description,
          poster_image: config.poster_image,
          registration_open: config.registration_open,
          registration_deadline: config.registration_deadline,
          deadline_text: config.deadline_text,
          closed_message: config.closed_message,
          success_message: config.success_message,
          already_registered_message: config.already_registered_message,
          form_fields: config.form_fields,
          is_active: true
        })
      
      if (insertError) throw insertError
      console.log('✅ Config created successfully!')
    }
    
    // Create backup of original JSON
    const backupPath = path.join(process.cwd(), 'public', `event_registration_config.json.backup-${Date.now()}`)
    await fs.copyFile(configPath, backupPath)
    console.log(`💾 Backup created: ${path.basename(backupPath)}`)
    
    console.log('🎉 Migration completed successfully!')
    console.log('📝 You can now remove the original JSON file if everything works correctly.')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateEventConfig()