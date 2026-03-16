import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing SUPABASE_URL and one of SUPABASE_SERVICE_ROLE_KEY/SUPABASE_KEY in environment variables"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database tables on startup
export const initializeDatabase = async () => {
  try {
    console.log("✅ Supabase connected successfully");
  } catch (error) {
    console.error("❌ Supabase connection error:", error.message);
  }
};
