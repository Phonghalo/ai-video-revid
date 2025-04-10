"use client"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// Create a single supabase client for client-side usage
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export const createClientSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables for client:", {
      url: !!supabaseUrl,
      key: !!supabaseKey,
    })
    throw new Error("Missing Supabase environment variables")
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseKey)
  return supabaseClient
}
