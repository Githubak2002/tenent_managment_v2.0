const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env
const envPath = path.join(__dirname, '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const envObj = {};
envFile.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest) envObj[key.trim()] = rest.join('=').trim();
});

const SUPABASE_URL = envObj['VITE_SUPABASE_URL'];
const SUPABASE_KEY = envObj['VITE_SUPABASE_ANON_KEY'];

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('No Supabase URL/Key found in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const seedPath = path.join(__dirname, 'src', 'data', 'seed.json');
const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

async function main() {
  console.log("Signing in...");
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'appylohar@gmail.com',
    password: '123456'
  });

  if (authErr) {
    console.error("Auth error:", authErr.message);
    return;
  }

  const landlordId = authData.user.id;
  console.log("Logged in. Landlord ID:", landlordId);

  const idMap = {};
  
  // Insert Renters
  let rentersInserted = 0;
  for (const r of seedData.renters) {
    const payload = { ...r, landlord_id: landlordId };
    const oldId = payload.original_id;
    delete payload.original_id;
    
    const { data: inserted, error: insertErr } = await supabase.from('renters').insert([payload]).select().single();
    if (insertErr) {
      console.error("Failed to insert renter:", payload.name, insertErr.message);
    } else {
      idMap[oldId] = inserted.id;
      rentersInserted++;
    }
  }

  console.log(`Inserted ${rentersInserted} renters.`);

  let paymentsInserted = 0;
  // Insert Payments
  for (const p of seedData.payments) {
    const newRenterId = idMap[p.original_renter_id];
    if (!newRenterId) continue;
    
    const payload = { ...p, renter_id: newRenterId };
    delete payload.original_renter_id;
    
    const { error: pErr } = await supabase.from('rent_records').insert([payload]);
    if (pErr) {
      console.error("Failed to insert payment for renter", payload.month, pErr.message);
    } else {
      paymentsInserted++;
    }
  }

  console.log(`Inserted ${paymentsInserted} payments.`);
  console.log("Migration finished successfully!");
}

main();
