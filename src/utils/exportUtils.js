import * as XLSX from 'xlsx';

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString('en-IN') ?? '—';
const dateStr = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Build flat rows for a single renter ───────────────────────────────────
function buildRenterRows(renter, rentRecords) {
  const records = rentRecords.filter(r => r.renterId === renter.id);
  if (records.length === 0) {
    return [{
      Name: renter.name,
      Phone: renter.phone,
      'Room / Flat': renter.flat,
      Status: renter.status === 'active' ? 'Active' : 'Inactive',
      'Moved In': dateStr(renter.movedInDate),
      'Moved Out': dateStr(renter.movedOutDate),
      'Monthly Rent (₹)': renter.monthlyRent,
      'Advance Paid': renter.advancePaid ? 'Yes' : 'No',
      'Advance Amount (₹)': renter.advanceAmount || 0,
      Month: '—', Year: '—',
      'Rent Amount (₹)': '—', 'Light Units': '—',
      'Light Bill (₹)': '—', 'Water Bill (₹)': '—',
      'Total Due (₹)': '—', 'Amount Paid (₹)': '—',
      'Payment Status': '—', 'Payment Mode': '—',
      'Paid On': '—', 'WhatsApp Sent': '—', Notes: renter.notes || '',
    }];
  }

  return records.sort((a, b) => b.year - a.year || monthIdx(b.month) - monthIdx(a.month)).map(r => {
    const amtPaid = r.amountPaid ?? (r.rentPaid ? r.totalAmount : 0);
    const partial = amtPaid < r.totalAmount && amtPaid > 0;
    return {
      Name: renter.name,
      Phone: renter.phone,
      'Room / Flat': renter.flat,
      Status: renter.status === 'active' ? 'Active' : 'Inactive',
      'Moved In': dateStr(renter.movedInDate),
      'Moved Out': dateStr(renter.movedOutDate),
      'Monthly Rent (₹)': renter.monthlyRent,
      'Advance Paid': renter.advancePaid ? 'Yes' : 'No',
      'Advance Amount (₹)': renter.advanceAmount || 0,
      Month: r.month,
      Year: r.year,
      'Rent Amount (₹)': r.rentAmount,
      'Light Prev Reading': r.lightReadingPrev,
      'Light Curr Reading': r.lightReadingCurr,
      'Light Units': r.lightUnits,
      'Light Bill (₹)': r.lightBill,
      'Water Bill (₹)': r.waterBill,
      'Total Due (₹)': r.totalAmount,
      'Amount Paid (₹)': amtPaid,
      'Balance (₹)': r.totalAmount - amtPaid,
      'Payment Status': r.rentPaid ? (partial ? 'Partial' : 'Paid') : 'Pending',
      'Payment Mode': r.paymentMode || '—',
      'Paid On': dateStr(r.paidDate),
      'WhatsApp Sent': r.whatsappSent ? 'Yes' : 'No',
      Notes: r.notes || renter.notes || '',
    };
  });
}

const monthIdx = (m) => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(m);

// ── Export to EXCEL (.xlsx) ────────────────────────────────────────────────
export function exportExcel(renters, rentRecords, filename = 'AkTenent_Export') {
  const allRows = renters.flatMap(r => buildRenterRows(r, rentRecords));
  const ws = XLSX.utils.json_to_sheet(allRows);

  // Column widths
  ws['!cols'] = [
    { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
    { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 10 }, { wch: 6 },
    { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 },
    { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rent Data');

  // Summary sheet
  const summaryRows = renters.map(r => {
    const records = rentRecords.filter(rec => rec.renterId === r.id);
    const totalDue = records.reduce((s, rec) => s + rec.totalAmount, 0);
    const totalReceived = records.reduce((s, rec) => s + (rec.amountPaid ?? (rec.rentPaid ? rec.totalAmount : 0)), 0);
    return {
      Name: r.name, Phone: r.phone, 'Room': r.flat,
      Status: r.status === 'active' ? 'Active' : 'Inactive',
      'Monthly Rent (₹)': r.monthlyRent,
      'Total Records': records.length,
      'Total Due (₹)': totalDue,
      'Total Received (₹)': totalReceived,
      'Balance (₹)': totalDue - totalReceived,
    };
  });
  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  ws2['!cols'] = [{ wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportExcelSingle(renter, rentRecords, filename) {
  const rows = buildRenterRows(renter, rentRecords);
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = Array(25).fill({ wch: 14 });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, renter.name.slice(0, 31));
  XLSX.writeFile(wb, `${filename || `AkTenent_${renter.name.replace(/\s+/g, '_')}`}.xlsx`);
}

// ── Export to CSV ──────────────────────────────────────────────────────────
export function exportCSV(renters, rentRecords, filename = 'AkTenent_Export') {
  const allRows = renters.flatMap(r => buildRenterRows(r, rentRecords));
  if (!allRows.length) return;
  const headers = Object.keys(allRows[0]);
  const csv = [
    headers.join(','),
    ...allRows.map(row =>
      headers.map(h => {
        const val = String(row[h] ?? '').replace(/"/g, '""');
        return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val}"` : val;
      }).join(',')
    )
  ].join('\n');
  downloadText(csv, `${filename}.csv`, 'text/csv');
}

export function exportCSVSingle(renter, rentRecords, filename) {
  exportCSV([renter], rentRecords, filename || `AkTenent_${renter.name.replace(/\s+/g, '_')}`);
}

// ── Export to JSON ─────────────────────────────────────────────────────────
export function exportJSON(renters, rentRecords, filename = 'AkTenent_Export') {
  const data = {
    exportedAt: new Date().toISOString(),
    totalRenters: renters.length,
    renters: renters.map(r => ({
      ...r,
      rentHistory: rentRecords
        .filter(rec => rec.renterId === r.id)
        .sort((a, b) => b.year - a.year || monthIdx(b.month) - monthIdx(a.month))
    }))
  };
  downloadText(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
}

export function exportJSONSingle(renter, rentRecords, filename) {
  const data = {
    exportedAt: new Date().toISOString(),
    renter: {
      ...renter,
      rentHistory: rentRecords
        .filter(r => r.renterId === renter.id)
        .sort((a, b) => b.year - a.year || monthIdx(b.month) - monthIdx(a.month))
    }
  };
  downloadText(JSON.stringify(data, null, 2), `${filename || `AkTenent_${renter.name.replace(/\s+/g, '_')}`}.json`, 'application/json');
}

// ── Helper: download text file ─────────────────────────────────────────────
function downloadText(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
