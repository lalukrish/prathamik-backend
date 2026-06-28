import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function testConnection() {
  const { data, error } = await supabase
    .from("your_table_name")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Supabase connection failed:", error);
  } else {
    console.log("Supabase connected successfully!");
    console.log(data);
  }
}

testConnection();
