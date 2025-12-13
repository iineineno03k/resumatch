import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Type assertion after validation
const SUPABASE_URL = supabaseUrl;
const SUPABASE_ANON_KEY = supabaseAnonKey;

/**
 * Supabase client for client-side usage (anon key)
 * Use this for operations that respect RLS policies
 */
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Supabase client with service role key
 * Use this for server-side operations that bypass RLS
 * IMPORTANT: Never expose this client to the browser
 */
export function createServiceClient() {
  if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(SUPABASE_URL, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
