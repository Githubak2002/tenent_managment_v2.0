const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'data', 'actualData.js');
const rawText = fs.readFileSync(dataPath, 'utf-8');

// The file contains multiple JSON blocks separated by comments.
// Each block starts with { and ends with } at the root level.
// We can extract them using regex carefully.

const blocks = [];
let depth = 0;
let startIndex = -1;

for (let i = 0; i < rawText.length; i++) {
  if (rawText[i] === '{') {
    if (depth === 0) startIndex = i;
    depth++;
  } else if (rawText[i] === '}') {
    depth--;
    if (depth === 0 && startIndex !== -1) {
      blocks.push(rawText.substring(startIndex, i + 1));
      startIndex = -1;
    }
  }
}

let allRenters = [];
let allPayments = [];

blocks.forEach(blockText => {
  try {
    const obj = JSON.parse(blockText);
    if (obj.renters) {
      allRenters = allRenters.concat(obj.renters);
    }
    if (obj.payments) {
      allPayments = allPayments.concat(obj.payments);
    }
  } catch (err) {
    console.error("Failed to parse block:", err.message);
  }
});

// Map to our Supabase schema formats
const seedData = {
  renters: allRenters.map(r => ({
    original_id: r._id,
    name: r.name,
    phone: r.phoneNumber,
    flat: 'N/A', // the actualData doesn't seem to have flat
    status: r.active ? 'active' : 'inactive',
    monthly_rent: 0, // Not provided directly on renter
    initial_light_reading: Math.round(Number(r.initialLightMeterReading)) || 0,
    advance_paid: false,
    advance_amount: 0,
    moved_in_date: r.moveInDate,
    moved_out_date: r.movedOutDate || null,
    notes: r.comments || ''
  })),
  payments: allPayments.map(p => {
    // Attempt to extract the month/year from date (e.g. 13/February/2026)
    let month = 'Unknown';
    let year = 2025;
    if (p.date && p.date.includes('/')) {
      const parts = p.date.split('/');
      if (parts.length >= 3) {
        month = parts[1];
        year = parseInt(parts[2]);
      }
    }

    return {
      original_renter_id: p.renterId._id,
      month: month,
      year: year,
      rent_amount: Math.round(Number(p.rentPaid)) || 0,
      light_reading_prev: 0,
      light_reading_curr: Math.round(Number(p.lightMeterReading)) || 0,
      light_units: 0,
      light_bill: Math.round(Number(p.lightBillPaid)) || 0,
      water_bill: Math.round(Number(p.waterBillPaid)) || 0,
      total_amount: Math.round(Number(p.rentPaid) + Number(p.lightBillPaid) + Number(p.waterBillPaid)) || 0,
      amount_paid: Math.round(Number(p.rentPaid) + Number(p.lightBillPaid) + Number(p.waterBillPaid)) || 0,
      rent_paid: true, // Assuming paid if it's in payments
      payment_mode: p.paymentMode || 'Cash',
      paid_date: p.date,
      whatsapp_sent: false,
      notes: p.comments || ''
    };
  })
};

fs.writeFileSync(path.join(__dirname, 'seed.json'), JSON.stringify(seedData, null, 2));
console.log(`Successfully extracted ${seedData.renters.length} renters and ${seedData.payments.length} payments.`);
