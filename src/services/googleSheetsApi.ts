import { OPTReport } from '../types/index.ts';

export interface CreateSheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheetName: string;
}

/**
 * Creates a brand new Google Spreadsheet in the user's Google Drive
 * with pre-formatted SIGAP-OPT headers, green color theme, and frozen row.
 */
export async function createSigapSpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<CreateSheetResult> {
  const title = customTitle || `SIGAP-OPT Database Laporan OPT (${new Date().toLocaleDateString('id-ID')})`;
  const sheetName = 'Laporan_Pengaduan_OPT';

  // 1. Create Spreadsheet via Google Sheets API v4
  const createPayload = {
    properties: {
      title,
      locale: 'id_ID',
      autoRecalc: 'ON_CHANGE'
    },
    sheets: [
      {
        properties: {
          title: sheetName,
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 16
          },
          tabColor: {
            red: 0.05,
            green: 0.61,
            blue: 0.34
          }
        }
      }
    ]
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createPayload)
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gagal membuat Google Spreadsheet (HTTP ${createRes.status})`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Insert Header row with formatting
  const headers = [
    'No Tiket',
    'Tanggal Lapor',
    'Nama Pelapor / Petani',
    'No WhatsApp',
    'Kecamatan',
    'Desa / Pekon',
    'Kelompok Tani (Poktan)',
    'Komoditas Tanaman',
    'Hama / Penyakit (OPT)',
    'Tingkat Keparahan',
    'Luas Terserang (Ha)',
    'Luas Terancam (Ha)',
    'Umur Tanaman (HST/Mgg)',
    'Gejala Serangan',
    'Status Tindakan',
    'Petugas Verifikator'
  ];

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:P1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [headers]
    })
  });

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
    sheetName
  };
}

/**
 * Appends or bulk-syncs existing reports into the Google Spreadsheet
 */
export async function syncReportsToSpreadsheet(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  reports: OPTReport[]
): Promise<number> {
  if (!reports.length) return 0;

  const rows = reports.map((r) => [
    r.code,
    new Date(r.dateReported).toLocaleString('id-ID'),
    r.reporterName,
    r.reporterPhone,
    r.subdistrict,
    r.village,
    r.farmerGroup || '-',
    r.commodity,
    r.pestName,
    r.severity,
    r.areaAffectedHa,
    r.areaThreatenedHa,
    r.plantAgeWeeks,
    r.symptoms,
    r.status,
    r.verifiedBy || '-'
  ]);

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:P:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: rows
      })
    }
  );

  if (!appendRes.ok) {
    const err = await appendRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal menyinkronkan data ke Google Sheet');
  }

  return rows.length;
}
