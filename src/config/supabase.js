// src/config/supabase.js
import { createClient } from "@supabase/supabase-js";

// Load URL and Anon Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL or Anon Key is missing. Make sure .env has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);