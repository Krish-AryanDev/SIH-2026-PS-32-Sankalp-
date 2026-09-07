// db/supabase_connect.js
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simple connection test
(async () => {
  try {
    const { error } = await supabase
      .from("procurement_centres")
      .select("centrecode")
      .limit(1);
    if (error) throw error;
    console.log("⚡ [Supabase]: Connection established successfully!");
  } catch (err) {
    console.error("❌ [Supabase]: Connection failed", err.message);
  }
})();

module.exports = supabase; // export client directly
