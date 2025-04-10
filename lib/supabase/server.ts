import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// Create a single supabase client for the server
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  // Try to use SUPABASE_ANON_KEY first, then fall back to NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables:", {
      url: !!supabaseUrl,
      key: !!supabaseKey,
      availableEnvVars: Object.keys(process.env).filter((key) => key.includes("SUPABASE") || key.includes("POSTGRES")),
    })
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}
