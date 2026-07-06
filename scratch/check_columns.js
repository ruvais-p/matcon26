const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim();
    env[key] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  console.log("Checking columns for bookings table...");
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error reading table:", error);
  } else {
    console.log("Successfully fetched row:", data);
    if (data.length > 0) {
      console.log("Columns present in fetched row:", Object.keys(data[0]));
    } else {
      console.log("Table is empty, trying to insert a dummy booking with type and theme...");
      const { data: insertData, error: insertError } = await supabase
        .from('bookings')
        .insert([{
          payment_id: "test-payment",
          name: "Test Name",
          email: "test@example.com",
          phone: "1234567890",
          abstract_url: "https://test.com",
          food_preference: "veg",
          accommodation_needed: "no",
          type: "Oral",
          theme: "Green and Sustainable Chemistry"
        }])
        .select();
      if (insertError) {
        console.error("Insert error (might mean columns are missing):", insertError);
      } else {
        console.log("Insert succeeded! Columns exist.", insertData);
        // clean up
        await supabase.from('bookings').delete().eq('id', insertData[0].id);
      }
    }
  }
}

check();
