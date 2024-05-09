const { createClient } = require("@supabase/supabase-js");
const cron = require("node-cron");

const supabaseUrl = "https://anczzwscgxogzohrdbnv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuY3p6d3NjZ3hvZ3pvaHJkYm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTMzNDczNjcsImV4cCI6MjAyODkyMzM2N30.3vqjUN4DvJiA7su0Sg1Gi__lnYQlIzK8o5Tv-cQckzs";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

cron.schedule("0 0 * * *", async () => {
  console.log("Running a daily job at 12:00 AM (server time)");

  try {
    // Trigger RPC and handle response
    const { data, error } = await supabase.rpc("your_rpc_function_name");

    if (error) throw error;

    // Use the JSON returned from your RPC to make an insert to another table
    const insertResult = await supabase
      .from("your_target_table")
      .insert([{ column_name: data.someField }]);

    if (insertResult.error) throw insertResult.error;

    console.log("Insert successful:", insertResult.data);
  } catch (err) {
    console.error("Error executing CRON job:", err.message);
  }
});
