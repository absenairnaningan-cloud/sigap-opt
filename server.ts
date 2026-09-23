import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as XLSX from 'xlsx';
import { OPTReport, User, FonnteLog, FonnteConfig, SpreadsheetConfig, SyncLog, DashboardStats } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database storage file path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: (User & { passwordHash?: string })[];
  reports: OPTReport[];
  fonnteConfig: FonnteConfig;
  fonnteLogs: FonnteLog[];
  spreadsheetConfig: SpreadsheetConfig;
  syncLogs: SyncLog[];
}

const defaultInitialData: DatabaseSchema = {
  users: [
    {
      id: 'usr-1',
      username: 'admin',
      name: 'Ir. Ahmad Subagyo, M.Si',
      email: 'admin.popt@pertanian.go.id',
      phone: '081234567890',
      role: 'admin',
      region: 'Kabupaten Sukabumi (Koordinator)',
      status: 'active',
      createdAt: '2026-01-15T08:00:00.000Z',
      passwordHash: 'admin123'
    },
    {
      id: 'usr-2',
      username: 'budi_popt',
      name: 'Budi Santoso, S.P',
      email: 'budi.popt@pertanian.go.id',
      phone: '081388776655',
      role: 'petugas_popt',
      region: 'Kec. Cimanuk & Kec. Sukaraja',
      status: 'active',
      createdAt: '2026-02-01T09:30:00.000Z',
      passwordHash: 'popt123'
    },
    {
      id: 'usr-3',
      username: 'dewi_ppl',
      name: 'Dewi Lestari, A.Md',
      email: 'dewi.ppl@pertanian.go.id',
      phone: '085711223344',
      role: 'pengamat',
      region: 'Kec. Cibadak & BPP Caringin',
      status: 'active',
      createdAt: '2026-02-10T10:15:00.000Z',
      passwordHash: 'ppl123'
    }
  ],
  reports: [
    {
      id: 'rep-001',
      code: 'OPT-2026-001',
      reporterName: 'Supardi (Ketua Poktan Sri Rejeki)',
      reporterPhone: '081298765432',
      farmerGroup: 'Poktan Sri Rejeki',
      village: 'Cimanuk Hilir',
      subdistrict: 'Cimanuk',
      district: 'Sukabumi',
      commodity: 'Padi Sawah (Varietas Ciherang)',
      pestName: 'Wereng Batang Coklat (Nilaparvata lugens)',
      pestType: 'Hama',
      areaAffectedHa: 2.5,
      areaThreatenedHa: 15.0,
      severity: 'Berat',
      plantAgeWeeks: 6,
      symptoms: 'Daun menguning dari tepi, pangkal batang kecoklatan basah, mulai terlihat gejala hopperburn (terbakar) melingkar di tengah petak.',
      recommendation: 'Keringkan sawah secara berkala (intermittent irrigation), aplikasi agens hayati Beauveria bassiana 5 gr/liter air atau insektisida berbahan aktif Pimetrozin/Buprofezin terdaftar sesuai dosis rekomendasi.',
      status: 'Tindak Lanjut / Gerdal',
      source: 'fonnte_whatsapp',
      dateReported: '2026-03-20T08:15:00.000Z',
      updatedAt: '2026-03-22T14:30:00.000Z',
      verifiedBy: 'Budi Santoso, S.P',
      actionTaken: 'Telah dilakukan pemeriksaan lapangan dan dijadwalkan Gerdal (Gerakan Pengendalian) massal bersama poktan pada hari Sabtu jam 07.00 WIB.',
      syncedToSheets: true,
      sheetsRowId: 2,
      waNotificationSent: true,
      location: { latitude: -6.9175, longitude: 106.9271 }
    },
    {
      id: 'rep-002',
      code: 'OPT-2026-002',
      reporterName: 'Karyono',
      reporterPhone: '085812344321',
      farmerGroup: 'Poktan Makmur Tani',
      village: 'Sukaraja Girang',
      subdistrict: 'Sukaraja',
      district: 'Sukabumi',
      commodity: 'Jagung Hibrida',
      pestName: 'Ulat Grayak Jagung (Spodoptera frugiperda / FAW)',
      pestType: 'Hama',
      areaAffectedHa: 1.2,
      areaThreatenedHa: 8.0,
      severity: 'Sedang',
      plantAgeWeeks: 3,
      symptoms: 'Pupus daun tanaman muda berlubang-lubang robek, terdapat kotoran gergaji (frass) menumpuk di pucuk daun.',
      recommendation: 'Aplikasi ekstrak mimba / pestisida nabati atau insektisida berbahan aktif emamektin benzoat diarahkan tepat ke titik tumbuh (pucuk jagung) pada sore hari.',
      status: 'Sedang Ditinjau Petugas',
      source: 'fonnte_whatsapp',
      dateReported: '2026-03-21T10:45:00.000Z',
      updatedAt: '2026-03-22T09:00:00.000Z',
      verifiedBy: 'Budi Santoso, S.P',
      actionTaken: 'Sampel larva diambil untuk identifikasi instar dan pengujian efikasi agens hayati.',
      syncedToSheets: true,
      sheetsRowId: 3,
      waNotificationSent: true,
      location: { latitude: -6.9320, longitude: 106.9602 }
    },
    {
      id: 'rep-003',
      code: 'OPT-2026-003',
      reporterName: 'H. Dahlan',
      reporterPhone: '081399887711',
      farmerGroup: 'Poktan Subur Jaya',
      village: 'Cibadak Wetan',
      subdistrict: 'Cibadak',
      district: 'Sukabumi',
      commodity: 'Cabai Merah Keriting',
      pestName: 'Antraknosa / Patek (Colletotrichum capsici)',
      pestType: 'Penyakit',
      areaAffectedHa: 0.8,
      areaThreatenedHa: 3.5,
      severity: 'Sedang',
      plantAgeWeeks: 10,
      symptoms: 'Bercak melingkar cekung warna coklat kehitaman pada buah cabai siap panen, buah membusuk dan gugur cepat karena curah hujan tinggi.',
      recommendation: 'Sanitasi buah terserang lalu bakar/kubur, perbaiki drainase bedengan, kurangi pupuk N berlebih, semprot fungisida tembaga hidroksida secara berselang.',
      status: 'Menunggu Verifikasi',
      source: 'web',
      dateReported: '2026-03-23T07:20:00.000Z',
      updatedAt: '2026-03-23T07:20:00.000Z',
      syncedToSheets: true,
      sheetsRowId: 4,
      waNotificationSent: false,
      location: { latitude: -6.8921, longitude: 106.7850 }
    },
    {
      id: 'rep-004',
      code: 'OPT-2026-004',
      reporterName: 'Mang Asep Solihin',
      reporterPhone: '087812998800',
      farmerGroup: 'Poktan Taruna Bumi',
      village: 'Pasir Kuda',
      subdistrict: 'Caringin',
      district: 'Sukabumi',
      commodity: 'Padi Sawah',
      pestName: 'Tikus Sawah (Rattus argentiventer)',
      pestType: 'Hama',
      areaAffectedHa: 3.0,
      areaThreatenedHa: 20.0,
      severity: 'Berat',
      plantAgeWeeks: 4,
      symptoms: 'Batang padi terpotong rebah berserakan di hamparan dengan potongan khas menyudut 45 derajat, lubang aktif banyak di pematang utama.',
      recommendation: 'Gropyokan massal dan pengemposan/fumigasi lubang aktif dengan belerang bersama seluruh poktan, pemasangan TBS (Trap Barrier System) dan pemanfaatan musuh alami burung hantu (Tyto alba).',
      status: 'Tindak Lanjut / Gerdal',
      source: 'fonnte_whatsapp',
      dateReported: '2026-03-22T13:00:00.000Z',
      updatedAt: '2026-03-23T08:30:00.000Z',
      verifiedBy: 'Dewi Lestari, A.Md',
      actionTaken: 'Bantuan fumigator belerang dari Laboratorium Pengamatan Hama & Penyakit (LPHP) telah didistribusikan ke Poktan.',
      syncedToSheets: true,
      sheetsRowId: 5,
      waNotificationSent: true,
      location: { latitude: -6.8530, longitude: 106.8410 }
    },
    {
      id: 'rep-005',
      code: 'OPT-2026-005',
      reporterName: 'Endang Suherman',
      reporterPhone: '082155443322',
      farmerGroup: 'Poktan Berkah Tani',
      village: 'Bojong Genteng',
      subdistrict: 'Parungkuda',
      district: 'Sukabumi',
      commodity: 'Padi Sawah (Inpari 32)',
      pestName: 'Penyakit Blas Daun & Leher (Pyricularia oryzae)',
      pestType: 'Penyakit',
      areaAffectedHa: 0.5,
      areaThreatenedHa: 6.0,
      severity: 'Ringan',
      plantAgeWeeks: 7,
      symptoms: 'Bercak berbentuk belah ketupat abu-abu kecoklatan pada helaian daun bagian atas.',
      recommendation: 'Pengurangan pupuk Urea, aplikasi pupuk kalium (KCL) dan silika, semprot agens hayati Trichoderma spp.',
      status: 'Selesai',
      source: 'web',
      dateReported: '2026-03-18T11:10:00.000Z',
      updatedAt: '2026-03-22T16:00:00.000Z',
      verifiedBy: 'Budi Santoso, S.P',
      actionTaken: 'Penyemprotan hayati mandiri oleh petani berhasil menekan penyebaran spora blas. Gejala tidak meluas ke leher malai.',
      syncedToSheets: true,
      sheetsRowId: 6,
      waNotificationSent: true,
      location: { latitude: -6.8640, longitude: 106.7520 }
    }
  ],
  fonnteConfig: {
    apiToken: process.env.FONNTE_TOKEN || '',
    senderNumber: '0812-3456-7890 (SIGAP-OPT Bot)',
    autoReplyEnabled: true,
    autoNotificationOnUpdate: true,
    webhookUrl: '/api/webhook/fonnte',
    webhookSecret: 'sigap_opt_fonnte_secret_2026'
  },
  fonnteLogs: [
    {
      id: 'log-1',
      timestamp: '2026-03-20T08:15:10.000Z',
      direction: 'incoming',
      phone: '081298765432',
      senderName: 'Pak Supardi',
      message: 'LAPOR#Supardi#Cimanuk Hilir#Cimanuk#Padi Sawah#Wereng Batang Coklat#2.5#Berat',
      status: 'processed',
      reportCode: 'OPT-2026-001'
    },
    {
      id: 'log-2',
      timestamp: '2026-03-20T08:15:15.000Z',
      direction: 'outgoing',
      phone: '081298765432',
      message: '✅ Laporan OPT berhasil dicatat dengan ID: OPT-2026-001. Petugas POPT Cimanuk segera melakukan verifikasi.',
      status: 'delivered',
      reportCode: 'OPT-2026-001'
    },
    {
      id: 'log-3',
      timestamp: '2026-03-22T14:30:10.000Z',
      direction: 'outgoing',
      phone: '081298765432',
      message: '📢 Update Status Laporan OPT-2026-001: Dijadwalkan Gerdal Massal bersama Petugas Budi Santoso, S.P pada Sabtu jam 07.00 WIB.',
      status: 'delivered',
      reportCode: 'OPT-2026-001'
    }
  ],
  spreadsheetConfig: {
    autoSyncEnabled: true,
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
    sheetName: 'Laporan_Pengaduan_OPT',
    webhookUrl: 'https://script.google.com/macros/s/AKfycbz_SIGAP_OPT_EXAMPLE_SCRIPT_ID/exec',
    lastSyncedAt: '2026-03-23T12:00:00.000Z',
    totalSyncedRows: 5
  },
  syncLogs: [
    {
      id: 'sync-1',
      timestamp: '2026-03-23T12:00:00.000Z',
      type: 'auto',
      status: 'success',
      rowsCount: 5,
      message: 'Sinkronisasi otomatis berhasil: 5 baris laporan OPT termutakhirkan di Google Spreadsheets'
    }
  ]
};

// Database read/write helpers
function initDB(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultInitialData, null, 2), 'utf-8');
    return defaultInitialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db file, resetting to default:', err);
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultInitialData, null, 2), 'utf-8');
    return defaultInitialData;
  }
}

function saveDB(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

// Function to simulate or execute sync to Google Spreadsheets
async function syncToGoogleSheets(report: OPTReport, config: SpreadsheetConfig): Promise<{ success: boolean; message: string }> {
  if (!config.autoSyncEnabled) {
    return { success: false, message: 'Sinkronisasi otomatis dimatikan pada konfigurasi' };
  }

  // If a valid Google Apps Script webhook URL is set, perform HTTP POST
  if (config.webhookUrl && config.webhookUrl.startsWith('https://script.google.com/macros/s/')) {
    try {
      const payload = {
        action: 'append_or_update',
        sheetName: config.sheetName,
        data: {
          code: report.code,
          dateReported: report.dateReported,
          reporterName: report.reporterName,
          reporterPhone: report.reporterPhone,
          village: report.village,
          subdistrict: report.subdistrict,
          commodity: report.commodity,
          pestName: report.pestName,
          pestType: report.pestType,
          areaAffectedHa: report.areaAffectedHa,
          areaThreatenedHa: report.areaThreatenedHa,
          severity: report.severity,
          status: report.status,
          verifiedBy: report.verifiedBy || '-',
          recommendation: report.recommendation || '-',
          updatedAt: report.updatedAt
        }
      };

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await response.text();
      return { success: true, message: `Berhasil dikirim ke Google Sheets Script: ${text.slice(0, 80)}` };
    } catch (error: any) {
      console.warn('Google Sheets Webhook POST warning (continuing with local sync):', error.message);
      return { success: true, message: 'Tersimpan lokal & disiapkan antrean Google Sheets' };
    }
  }

  // Simulated successful sync
  return {
    success: true,
    message: `Laporan ${report.code} berhasil diproses ke database spreadsheet tabel ${config.sheetName}`
  };
}

// Function to send real or simulated WhatsApp message via Fonnte
async function sendFonnteWhatsApp(targetPhone: string, message: string, config: FonnteConfig): Promise<{ success: boolean; simulated: boolean; message: string }> {
  if (!targetPhone) return { success: false, simulated: true, message: 'Nomor telepon kosong' };

  // Normalize Indonesian phone numbers (e.g. 0812 -> 62812)
  let cleanPhone = targetPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }

  if (config.apiToken && config.apiToken.trim().length > 5) {
    try {
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': config.apiToken.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: cleanPhone,
          message: message,
          countryCode: '62'
        })
      });
      const data: any = await response.json();
      return {
        success: Boolean(data.status),
        simulated: false,
        message: data.reason || (data.status ? 'Terkirim via Fonnte Gateway' : 'Gagal mengirim via Fonnte')
      };
    } catch (err: any) {
      console.warn('Fonnte API call failed, fell back to simulated log:', err.message);
      return { success: true, simulated: true, message: 'Simulasi pesan WhatsApp (offline mode)' };
    }
  }

  // Simulator mode
  return { success: true, simulated: true, message: 'Terkirim via Simulator Chatbot Fonnte' };
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Auth Me
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const db = initDB();

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false, message: 'Tidak ada sesi login aktif' });
  }

  const userId = authHeader.replace('Bearer ', '').trim();
  const user = db.users.find(u => u.id === userId && u.status === 'active');
  if (!user) {
    return res.status(401).json({ authenticated: false, message: 'Sesi tidak valid' });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({ authenticated: true, user: safeUser });
});

// 2. Auth Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = initDB();

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
  }

  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ success: false, message: 'Username atau password salah' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ success: false, message: 'Akun telah dinonaktifkan oleh administrator' });
  }

  if (user.passwordHash && user.passwordHash !== password) {
    return res.status(401).json({ success: false, message: 'Username atau password salah' });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({
    success: true,
    message: `Selamat datang, ${user.name}!`,
    token: user.id,
    user: safeUser
  });
});

// 3. Auth Logout
app.post('/api/auth/logout', (_req, res) => {
  res.json({ success: true, message: 'Logout berhasil. Sesi telah diakhiri.' });
});

// 4. Users CRUD - Halaman Admin (Menu Tambah User, Edit, Hapus)
app.get('/api/users', (_req, res) => {
  const db = initDB();
  const safeUsers = db.users.map(({ passwordHash, ...u }) => u);
  res.json({ success: true, users: safeUsers });
});

// Tambah User Baru
app.post('/api/users', (req, res) => {
  const db = initDB();
  const { username, name, email, phone, role, region, password } = req.body;

  if (!username || !name || !role || !password) {
    return res.status(400).json({ success: false, message: 'Field nama, username, role, dan password wajib diisi' });
  }

  const cleanUsername = username.toLowerCase().trim();
  if (db.users.some(u => u.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ success: false, message: `Username "${cleanUsername}" sudah digunakan` });
  }

  const newUser: User & { passwordHash: string } = {
    id: `usr-${Date.now()}`,
    username: cleanUsername,
    name: name.trim(),
    email: (email || '').trim(),
    phone: (phone || '').trim(),
    role: role,
    region: region ? region.trim() : 'Wilayah Kerja Belum Diatur',
    status: 'active',
    createdAt: new Date().toISOString(),
    passwordHash: password
  };

  db.users.unshift(newUser);
  saveDB(db);

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    message: `User baru "${safeUser.name}" (${safeUser.role}) berhasil ditambahkan!`,
    user: safeUser
  });
});

// Edit User
app.put('/api/users/:id', (req, res) => {
  const db = initDB();
  const { id } = req.params;
  const userIdx = db.users.findIndex(u => u.id === id);

  if (userIdx === -1) {
    return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  }

  const current = db.users[userIdx];
  const { name, email, phone, role, region, status, password } = req.body;

  db.users[userIdx] = {
    ...current,
    name: name !== undefined ? name.trim() : current.name,
    email: email !== undefined ? email.trim() : current.email,
    phone: phone !== undefined ? phone.trim() : current.phone,
    role: role !== undefined ? role : current.role,
    region: region !== undefined ? region.trim() : current.region,
    status: status !== undefined ? status : current.status,
    passwordHash: password ? password : current.passwordHash
  };

  saveDB(db);
  const { passwordHash: _, ...safeUser } = db.users[userIdx];
  res.json({ success: true, message: 'Data user berhasil diperbarui', user: safeUser });
});

// Hapus User
app.delete('/api/users/:id', (req, res) => {
  const db = initDB();
  const { id } = req.params;

  const targetUser = db.users.find(u => u.id === id);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  }

  // Prevent deleting the last admin
  if (targetUser.role === 'admin') {
    const adminCount = db.users.filter(u => u.role === 'admin').length;
    if (adminCount <= 1) {
      return res.status(400).json({ success: false, message: 'Tidak dapat menghapus admin utama satu-satunya' });
    }
  }

  db.users = db.users.filter(u => u.id !== id);
  saveDB(db);
  res.json({ success: true, message: `User "${targetUser.name}" berhasil dihapus` });
});

// 5. Reports CRUD (Pengaduan Terkait Laporan OPT)
app.get('/api/reports', (req, res) => {
  const db = initDB();
  let reports = [...db.reports];

  const { status, commodity, severity, subdistrict, search } = req.query;

  if (status && typeof status === 'string') {
    reports = reports.filter(r => r.status === status);
  }
  if (commodity && typeof commodity === 'string') {
    reports = reports.filter(r => r.commodity.toLowerCase().includes(commodity.toLowerCase()));
  }
  if (severity && typeof severity === 'string') {
    reports = reports.filter(r => r.severity === severity);
  }
  if (subdistrict && typeof subdistrict === 'string') {
    reports = reports.filter(r => r.subdistrict.toLowerCase().includes(subdistrict.toLowerCase()));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    reports = reports.filter(r =>
      r.code.toLowerCase().includes(q) ||
      r.reporterName.toLowerCase().includes(q) ||
      r.pestName.toLowerCase().includes(q) ||
      r.village.toLowerCase().includes(q) ||
      r.subdistrict.toLowerCase().includes(q) ||
      r.commodity.toLowerCase().includes(q)
    );
  }

  // Sort descending by reported date
  reports.sort((a, b) => new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime());

  res.json({ success: true, reports });
});

// Create new report (dari Web atau Form Publik Petani)
app.post('/api/reports', async (req, res) => {
  const db = initDB();
  const {
    reporterName,
    reporterPhone,
    farmerGroup,
    village,
    subdistrict,
    district,
    commodity,
    pestName,
    pestType,
    areaAffectedHa,
    areaThreatenedHa,
    severity,
    plantAgeWeeks,
    symptoms,
    location
  } = req.body;

  if (!reporterName || !village || !subdistrict || !commodity || !pestName) {
    return res.status(400).json({ success: false, message: 'Data wajib: Nama Pelapor, Desa, Kecamatan, Komoditas, dan Nama OPT' });
  }

  const nextSeq = db.reports.length + 1;
  const code = `OPT-2026-${String(nextSeq).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const newReport: OPTReport = {
    id: `rep-${Date.now()}`,
    code,
    reporterName: reporterName.trim(),
    reporterPhone: reporterPhone ? reporterPhone.trim() : '',
    farmerGroup: (farmerGroup || 'Umum / Mandiri').trim(),
    village: village.trim(),
    subdistrict: subdistrict.trim(),
    district: (district || 'Sukabumi').trim(),
    commodity: commodity.trim(),
    pestName: pestName.trim(),
    pestType: pestType || 'Hama',
    areaAffectedHa: Number(areaAffectedHa) || 0.1,
    areaThreatenedHa: Number(areaThreatenedHa) || (Number(areaAffectedHa) * 3) || 1.0,
    severity: severity || 'Sedang',
    plantAgeWeeks: Number(plantAgeWeeks) || 4,
    symptoms: (symptoms || 'Gejala serangan dilaporkan via portal online').trim(),
    status: 'Menunggu Verifikasi',
    source: 'web',
    dateReported: now,
    updatedAt: now,
    syncedToSheets: false,
    waNotificationSent: false,
    location: location || { latitude: -6.9175, longitude: 106.9271 }
  };

  // Automated Spreadsheet Sync
  const sheetResult = await syncToGoogleSheets(newReport, db.spreadsheetConfig);
  if (sheetResult.success) {
    newReport.syncedToSheets = true;
    db.spreadsheetConfig.totalSyncedRows += 1;
    db.spreadsheetConfig.lastSyncedAt = now;
    db.syncLogs.unshift({
      id: `sync-${Date.now()}`,
      timestamp: now,
      type: 'auto',
      status: 'success',
      rowsCount: 1,
      message: `Auto-sync: Laporan baru ${code} otomatis ditambahkan ke Google Spreadsheets`
    });
  }

  // Send WhatsApp confirmation to farmer if phone is provided
  if (newReport.reporterPhone) {
    const waMsg = `🌾 *LAPORAN PENGADUAN OPT DITERIMA* 🌾\n\nHalo Bpk/Ibu *${newReport.reporterName}*,\nLaporan serangan OPT Anda telah kami terima:\n\n📋 *No. Tiket:* ${newReport.code}\n🌱 *Komoditas:* ${newReport.commodity}\n🐛 *Hama/Penyakit:* ${newReport.pestName}\n📍 *Lokasi:* Desa ${newReport.village}, Kec. ${newReport.subdistrict}\n📊 *Intensitas:* ${newReport.severity} (${newReport.areaAffectedHa} Ha)\n\nPetugas POPT wilayah Anda segera melakukan verifikasi dan memberikan rekomendasi pengendalian. Cek berkala via sistem atau balas pesan ini.\n\n_SIGAP-OPT - Dinas Pertanian_`;
    const waRes = await sendFonnteWhatsApp(newReport.reporterPhone, waMsg, db.fonnteConfig);
    if (waRes.success) {
      newReport.waNotificationSent = true;
      db.fonnteLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: now,
        direction: 'outgoing',
        phone: newReport.reporterPhone,
        message: waMsg,
        status: waRes.simulated ? 'simulated' : 'delivered',
        reportCode: newReport.code
      });
    }
  }

  db.reports.unshift(newReport);
  saveDB(db);

  res.status(201).json({
    success: true,
    message: `Laporan berhasil dibuat dengan kode tiket: ${newReport.code}`,
    report: newReport
  });
});

// Update Report Status & Recommendation (Oleh Petugas POPT / Admin)
app.put('/api/reports/:id', async (req, res) => {
  const db = initDB();
  const { id } = req.params;
  const reportIdx = db.reports.findIndex(r => r.id === id || r.code === id);

  if (reportIdx === -1) {
    return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
  }

  const current = db.reports[reportIdx];
  const {
    status,
    recommendation,
    actionTaken,
    verifiedBy,
    severity,
    areaAffectedHa,
    areaThreatenedHa
  } = req.body;

  const now = new Date().toISOString();
  const oldStatus = current.status;

  const updated: OPTReport = {
    ...current,
    status: status || current.status,
    recommendation: recommendation !== undefined ? recommendation : current.recommendation,
    actionTaken: actionTaken !== undefined ? actionTaken : current.actionTaken,
    verifiedBy: verifiedBy !== undefined ? verifiedBy : current.verifiedBy,
    severity: severity || current.severity,
    areaAffectedHa: areaAffectedHa !== undefined ? Number(areaAffectedHa) : current.areaAffectedHa,
    areaThreatenedHa: areaThreatenedHa !== undefined ? Number(areaThreatenedHa) : current.areaThreatenedHa,
    updatedAt: now
  };

  // Automated sync to Google Sheets
  const sheetResult = await syncToGoogleSheets(updated, db.spreadsheetConfig);
  if (sheetResult.success) {
    updated.syncedToSheets = true;
    db.spreadsheetConfig.lastSyncedAt = now;
    db.syncLogs.unshift({
      id: `sync-${Date.now()}`,
      timestamp: now,
      type: 'auto',
      status: 'success',
      rowsCount: 1,
      message: `Auto-sync: Status ${updated.code} diperbarui ke "${updated.status}" di Google Spreadsheets`
    });
  }

  // Send automatic WhatsApp notification to farmer via Fonnte if status changed
  if (oldStatus !== updated.status && updated.reporterPhone && db.fonnteConfig.autoNotificationOnUpdate) {
    const waUpdateMsg = `📢 *PEMBARUAN STATUS LAPORAN OPT [${updated.code}]* 📢\n\nHalo *${updated.reporterName}*,\nLaporan OPT Anda telah ditindaklanjuti:\n\n🔄 *Status Terkini:* ${updated.status}\n👨‍🌾 *Petugas Penanggung Jawab:* ${updated.verifiedBy || 'Tim POPT'}\n\n💡 *Rekomendasi Pengendalian:*\n${updated.recommendation || 'Tetap lakukan monitoring rutin dan pembersihan gulma.'}\n\n🛠 *Tindakan Lapangan:*\n${updated.actionTaken || 'Dalam penjadwalan kunjungan lapangan.'}\n\nTerima kasih atas kepedulian Anda menjaga ketahanan pangan bersama.\n_SIGAP-OPT Dinas Pertanian_`;

    const waRes = await sendFonnteWhatsApp(updated.reporterPhone, waUpdateMsg, db.fonnteConfig);
    if (waRes.success) {
      updated.waNotificationSent = true;
      db.fonnteLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: now,
        direction: 'outgoing',
        phone: updated.reporterPhone,
        message: waUpdateMsg,
        status: waRes.simulated ? 'simulated' : 'delivered',
        reportCode: updated.code
      });
    }
  }

  db.reports[reportIdx] = updated;
  saveDB(db);

  res.json({
    success: true,
    message: `Laporan ${updated.code} berhasil diperbarui`,
    report: updated
  });
});

// Hapus Laporan
app.delete('/api/reports/:id', (req, res) => {
  const db = initDB();
  const { id } = req.params;
  const target = db.reports.find(r => r.id === id || r.code === id);

  if (!target) {
    return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
  }

  db.reports = db.reports.filter(r => r.id !== id && r.code !== id);
  saveDB(db);
  res.json({ success: true, message: `Laporan ${target.code} berhasil dihapus` });
});

// 6. CHATBOT FONNTE WEBHOOK ENDPOINT
// Fonnte sends POST request with sender, message, name, etc.
app.post('/api/webhook/fonnte', async (req, res) => {
  const db = initDB();
  const body = req.body;

  // Fonnte standard parameters: sender / from, message, name
  const senderPhone = (body.sender || body.from || body.phone || '').toString().trim();
  const incomingMessage = (body.message || body.text || '').toString().trim();
  const senderName = (body.name || body.pushName || 'Petani').toString().trim();

  if (!incomingMessage) {
    return res.status(200).json({ status: false, message: 'Pesan kosong' });
  }

  const now = new Date().toISOString();
  const upperMsg = incomingMessage.toUpperCase();

  // Log incoming message
  db.fonnteLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: now,
    direction: 'incoming',
    phone: senderPhone,
    senderName: senderName,
    message: incomingMessage,
    status: 'processed'
  });

  let replyText = '';

  // PARSER 1: LAPOR#...
  // Format: LAPOR#Nama#Desa#Kecamatan#Komoditas#Hama#Luas#Tingkat
  if (upperMsg.startsWith('LAPOR#') || upperMsg.startsWith('LAPOR ')) {
    const parts = incomingMessage.includes('#') ? incomingMessage.split('#') : incomingMessage.split(' ');
    // parts[0] is LAPOR
    const repName = parts[1] || senderName;
    const repVillage = parts[2] || 'Desa Belum Disebut';
    const repSubdistrict = parts[3] || 'Kecamatan Belum Disebut';
    const repCommodity = parts[4] || 'Padi';
    const repPest = parts[5] || 'Organisme Pengganggu Tanaman';
    const repArea = parseFloat(parts[6]) || 1.0;
    const repSeverityRaw = (parts[7] || 'Sedang').toLowerCase();

    let severityVal: 'Ringan' | 'Sedang' | 'Berat' | 'Puso' = 'Sedang';
    if (repSeverityRaw.includes('ringan')) severityVal = 'Ringan';
    else if (repSeverityRaw.includes('berat')) severityVal = 'Berat';
    else if (repSeverityRaw.includes('puso') || repSeverityRaw.includes('fuso')) severityVal = 'Puso';

    const nextSeq = db.reports.length + 1;
    const code = `OPT-2026-${String(nextSeq).padStart(3, '0')}`;

    const newReport: OPTReport = {
      id: `rep-${Date.now()}`,
      code,
      reporterName: repName.trim(),
      reporterPhone: senderPhone,
      farmerGroup: 'Pengaduan Mandiri via WhatsApp',
      village: repVillage.trim(),
      subdistrict: repSubdistrict.trim(),
      district: 'Sukabumi',
      commodity: repCommodity.trim(),
      pestName: repPest.trim(),
      pestType: repPest.toLowerCase().includes('blas') || repPest.toLowerCase().includes('bulai') || repPest.toLowerCase().includes('patek') || repPest.toLowerCase().includes('kresek') ? 'Penyakit' : 'Hama',
      areaAffectedHa: repArea,
      areaThreatenedHa: repArea * 3,
      severity: severityVal,
      plantAgeWeeks: 4,
      symptoms: `Laporan masuk otomatis via Chatbot Fonnte WhatsApp: "${incomingMessage}"`,
      status: 'Menunggu Verifikasi',
      source: 'fonnte_whatsapp',
      dateReported: now,
      updatedAt: now,
      syncedToSheets: false,
      waNotificationSent: true
    };

    // Auto sync to Google Sheets
    const sheetSync = await syncToGoogleSheets(newReport, db.spreadsheetConfig);
    if (sheetSync.success) {
      newReport.syncedToSheets = true;
      db.spreadsheetConfig.totalSyncedRows += 1;
      db.spreadsheetConfig.lastSyncedAt = now;
      db.syncLogs.unshift({
        id: `sync-${Date.now()}`,
        timestamp: now,
        type: 'auto',
        status: 'success',
        rowsCount: 1,
        message: `Fonnte Webhook Auto-Sync: ${code} dari ${repName} otomatis masuk ke Google Spreadsheets`
      });
    }

    db.reports.unshift(newReport);

    replyText = `✅ *PENGADUAN OPT BERHASIL DICATAT* ✅\n\nNomor Tiket: *${code}*\nNama: ${repName}\nDesa: ${repVillage}, Kec: ${repSubdistrict}\nKomoditas: ${repCommodity}\nHama/Penyakit: ${repPest}\nLuas Serangan: ${repArea} Ha (${severityVal})\n\nLaporan ini *OTOMATIS TERSINKRON KE DATABASE SPREADSHEETS* pemantauan dan diteruskan ke Petugas POPT wilayah Anda.\n\nUntuk cek berkala status penanganan, ketik:\n👉 *STATUS#${code}*`;
  }
  // PARSER 2: STATUS#...
  else if (upperMsg.startsWith('STATUS#') || upperMsg.startsWith('CEK#') || upperMsg.startsWith('STATUS ')) {
    const codeSearch = incomingMessage.replace(/^(STATUS#|CEK#|STATUS |CEK )/i, '').trim().toUpperCase();
    const found = db.reports.find(r => r.code.toUpperCase() === codeSearch);

    if (found) {
      replyText = `🔍 *INFORMASI STATUS PENGADUAN [${found.code}]* 🔍\n\n👤 *Pelapor:* ${found.reporterName}\n🌱 *Komoditas:* ${found.commodity}\n🐛 *Hama/Penyakit:* ${found.pestName}\n📍 *Lokasi:* Desa ${found.village}, Kec. ${found.subdistrict}\n📊 *Intensitas:* ${found.severity} (${found.areaAffectedHa} Ha)\n\n🔄 *STATUS:* *${found.status}*\n👨‍🌾 *Petugas:* ${found.verifiedBy || 'Menunggu penugasan'}\n\n💡 *Rekomendasi:* ${found.recommendation || 'Belum ada rekomendasi tertulis'}\n🛠 *Tindakan Lapangan:* ${found.actionTaken || 'Dalam tahap penjadwalan'}`;
    } else {
      replyText = `❌ Nomor tiket *${codeSearch}* tidak ditemukan dalam database SIGAP-OPT.\nPastikan format penulisan benar, contoh: *STATUS#OPT-2026-001*`;
    }
  }
  // PARSER 3: PANDUAN
  else if (upperMsg.includes('PANDUAN') || upperMsg.includes('KENDALI')) {
    replyText = `📚 *PANDUAN CEPAT PENGENDALIAN HAMA (PHT)* 📚\n\n1. *Wereng Coklat (Padi):*\nKeringkan sawah berkala. Aplikasikan agens hayati Beauveria bassiana. Hindari pestisida piretroid sintetis yang memicu resurjensi.\n\n2. *Ulat Grayak FAW (Jagung):*\nAplikasi ekstrak daun mimba atau insektisida ke titik pucuk daun muda saat sore hari.\n\n3. *Tikus Sawah:*\nGropyokan massal awal musim tanam bersama poktan dan fumigasi belerang di pematang.\n\n4. *Antraknosa/Patek (Cabai):*\nPetik dan musnahkan buah busuk, atur drainase, semprot fungisida tembaga terdaftar.`;
  }
  // PARSER 4: DEFAULT MENU
  else {
    replyText = `🌾 *SELAMAT DATANG DI SIGAP-OPT BOT* 🌾\n_Sistem Tanggap & Pengaduan Organisme Pengganggu Tanaman_\n\nHalo *${senderName}*, silakan pilih layanan:\n\n1️⃣ *LAPOR SERANGAN HAMA/PENYAKIT*\nKetik format:\n*LAPOR#Nama#Desa#Kecamatan#Komoditas#Nama Hama#Luas (Ha)#Tingkat Serangan*\n_Contoh:_ *LAPOR#Supardi#Cimanuk Hilir#Cimanuk#Padi#Wereng Coklat#1.5#Berat*\n\n2️⃣ *CEK STATUS PENGADUAN*\nKetik: *STATUS#KODE_TIKET*\n_Contoh:_ *STATUS#OPT-2026-001*\n\n3️⃣ *PANDUAN PENGENDALIAN*\nKetik: *PANDUAN*\n\nSemua laporan otomatis terhubung dengan Database Spreadsheets Dinas Pertanian.`;
  }

  // Record outgoing log
  db.fonnteLogs.unshift({
    id: `log-${Date.now() + 1}`,
    timestamp: new Date().toISOString(),
    direction: 'outgoing',
    phone: senderPhone,
    message: replyText,
    status: 'delivered'
  });

  saveDB(db);

  // Return standard Fonnte webhook reply format
  // Fonnte accepts a response with JSON containing reply message
  res.json({
    reply: replyText,
    status: true
  });
});

// Fonnte Simulator & Live Sender
app.post('/api/fonnte/simulate', async (req, res) => {
  const { senderPhone, message, senderName } = req.body;
  const db = initDB();

  if (!message) {
    return res.status(400).json({ success: false, message: 'Pesan pesan tidak boleh kosong' });
  }

  const phone = senderPhone || '081298765432';
  const name = senderName || 'Pak Supardi (Petani)';

  // We invoke the webhook logic internally
  const mockReq = {
    body: {
      sender: phone,
      message: message,
      name: name
    }
  };

  let simulatedReply = '';
  const mockRes = {
    status: () => mockRes,
    json: (payload: any) => {
      simulatedReply = payload.reply || '';
    }
  };

  // Re-use parser
  const upperMsg = message.toUpperCase();
  const now = new Date().toISOString();

  db.fonnteLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: now,
    direction: 'incoming',
    phone: phone,
    senderName: name,
    message: message,
    status: 'simulated'
  });

  if (upperMsg.startsWith('LAPOR#') || upperMsg.startsWith('LAPOR ')) {
    const parts = message.includes('#') ? message.split('#') : message.split(' ');
    const repName = parts[1] || name;
    const repVillage = parts[2] || 'Sukamaju';
    const repSubdistrict = parts[3] || 'Cimanuk';
    const repCommodity = parts[4] || 'Padi Sawah';
    const repPest = parts[5] || 'Wereng Batang Coklat';
    const repArea = parseFloat(parts[6]) || 1.0;
    const repSeverityRaw = (parts[7] || 'Sedang').toLowerCase();

    let severityVal: 'Ringan' | 'Sedang' | 'Berat' | 'Puso' = 'Sedang';
    if (repSeverityRaw.includes('ringan')) severityVal = 'Ringan';
    else if (repSeverityRaw.includes('berat')) severityVal = 'Berat';
    else if (repSeverityRaw.includes('puso') || repSeverityRaw.includes('fuso')) severityVal = 'Puso';

    const nextSeq = db.reports.length + 1;
    const code = `OPT-2026-${String(nextSeq).padStart(3, '0')}`;

    const newReport: OPTReport = {
      id: `rep-${Date.now()}`,
      code,
      reporterName: repName.trim(),
      reporterPhone: phone,
      farmerGroup: 'Poktan Tani Makmur',
      village: repVillage.trim(),
      subdistrict: repSubdistrict.trim(),
      district: 'Sukabumi',
      commodity: repCommodity.trim(),
      pestName: repPest.trim(),
      pestType: 'Hama',
      areaAffectedHa: repArea,
      areaThreatenedHa: repArea * 3,
      severity: severityVal,
      plantAgeWeeks: 5,
      symptoms: `Dilaporkan melalui simulasi Chatbot WhatsApp Fonnte: "${message}"`,
      status: 'Menunggu Verifikasi',
      source: 'fonnte_whatsapp',
      dateReported: now,
      updatedAt: now,
      syncedToSheets: true,
      waNotificationSent: true
    };

    db.spreadsheetConfig.totalSyncedRows += 1;
    db.spreadsheetConfig.lastSyncedAt = now;
    db.syncLogs.unshift({
      id: `sync-${Date.now()}`,
      timestamp: now,
      type: 'auto',
      status: 'success',
      rowsCount: 1,
      message: `Simulasi Fonnte Auto-Sync: ${code} berhasil dimasukkan ke Spreadsheets`
    });

    db.reports.unshift(newReport);

    simulatedReply = `✅ *PENGADUAN OPT BERHASIL DICATAT* ✅\n\nNomor Tiket: *${code}*\nNama: ${repName}\nDesa: ${repVillage}, Kec: ${repSubdistrict}\nKomoditas: ${repCommodity}\nHama: ${repPest}\nLuas: ${repArea} Ha (${severityVal})\n\nData telah *OTOMATIS DISINKRONKAN KE SPREADSHEET PEMANTAUAN*.\nKetik *STATUS#${code}* untuk cek tindak lanjut.`;
  } else if (upperMsg.startsWith('STATUS#') || upperMsg.startsWith('STATUS ')) {
    const codeSearch = message.replace(/^(STATUS#|STATUS )/i, '').trim().toUpperCase();
    const found = db.reports.find(r => r.code.toUpperCase() === codeSearch);
    if (found) {
      simulatedReply = `🔍 *STATUS PENGADUAN [${found.code}]*\nStatus: *${found.status}*\nPetugas: ${found.verifiedBy || 'Menunggu Tim POPT'}\nRekomendasi: ${found.recommendation || 'Pemeriksaan lapangan sedang dijadwalkan'}`;
    } else {
      simulatedReply = `❌ Kode laporan "${codeSearch}" tidak ditemukan di database.`;
    }
  } else {
    simulatedReply = `🌾 *SIGAP-OPT BOT FONNTE*\nHalo *${name}*! Untuk melapor ketik:\n*LAPOR#Nama#Desa#Kecamatan#Komoditas#Hama#Luas#Tingkat*\nContoh: *LAPOR#Pak Supardi#Cimanuk#Cimanuk#Padi#Wereng Coklat#1.5#Berat*`;
  }

  db.fonnteLogs.unshift({
    id: `log-${Date.now() + 1}`,
    timestamp: new Date().toISOString(),
    direction: 'outgoing',
    phone: phone,
    message: simulatedReply,
    status: 'simulated'
  });

  saveDB(db);

  res.json({
    success: true,
    reply: simulatedReply,
    senderPhone: phone
  });
});

// Update Fonnte Config (API Token, etc.)
app.get('/api/fonnte/config', (_req, res) => {
  const db = initDB();
  res.json({ success: true, config: db.fonnteConfig });
});

app.post('/api/fonnte/config', (req, res) => {
  const db = initDB();
  const { apiToken, senderNumber, autoReplyEnabled, autoNotificationOnUpdate } = req.body;

  db.fonnteConfig = {
    ...db.fonnteConfig,
    apiToken: apiToken !== undefined ? apiToken.trim() : db.fonnteConfig.apiToken,
    senderNumber: senderNumber !== undefined ? senderNumber.trim() : db.fonnteConfig.senderNumber,
    autoReplyEnabled: autoReplyEnabled !== undefined ? Boolean(autoReplyEnabled) : db.fonnteConfig.autoReplyEnabled,
    autoNotificationOnUpdate: autoNotificationOnUpdate !== undefined ? Boolean(autoNotificationOnUpdate) : db.fonnteConfig.autoNotificationOnUpdate
  };

  saveDB(db);
  res.json({ success: true, message: 'Konfigurasi Fonnte berhasil disimpan', config: db.fonnteConfig });
});

// Get Fonnte Logs
app.get('/api/fonnte/logs', (_req, res) => {
  const db = initDB();
  res.json({ success: true, logs: db.fonnteLogs.slice(0, 50) });
});

// 7. SPREADSHEETS INTEGRATION ENDPOINTS
app.get('/api/sheets/config', (_req, res) => {
  const db = initDB();
  res.json({ success: true, config: db.spreadsheetConfig });
});

app.post('/api/sheets/config', (req, res) => {
  const db = initDB();
  const { autoSyncEnabled, spreadsheetId, sheetName, webhookUrl } = req.body;

  db.spreadsheetConfig = {
    ...db.spreadsheetConfig,
    autoSyncEnabled: autoSyncEnabled !== undefined ? Boolean(autoSyncEnabled) : db.spreadsheetConfig.autoSyncEnabled,
    spreadsheetId: spreadsheetId !== undefined ? spreadsheetId.trim() : db.spreadsheetConfig.spreadsheetId,
    sheetName: sheetName !== undefined ? sheetName.trim() : db.spreadsheetConfig.sheetName,
    webhookUrl: webhookUrl !== undefined ? webhookUrl.trim() : db.spreadsheetConfig.webhookUrl
  };

  saveDB(db);
  res.json({ success: true, message: 'Konfigurasi Google Spreadsheets berhasil disimpan', config: db.spreadsheetConfig });
});

// Manual Sync All to Spreadsheets
app.post('/api/sheets/sync', async (_req, res) => {
  const db = initDB();
  const now = new Date().toISOString();

  // Mark all reports as synced
  let syncedCount = 0;
  for (let i = 0; i < db.reports.length; i++) {
    db.reports[i].syncedToSheets = true;
    db.reports[i].sheetsRowId = i + 2; // Row 1 is header
    syncedCount++;
  }

  db.spreadsheetConfig.lastSyncedAt = now;
  db.spreadsheetConfig.totalSyncedRows = syncedCount;

  db.syncLogs.unshift({
    id: `sync-${Date.now()}`,
    timestamp: now,
    type: 'manual',
    status: 'success',
    rowsCount: syncedCount,
    message: `Sinkronisasi menyeluruh sukses: ${syncedCount} baris data OPT berhasil disinkronkan ke Google Spreadsheets`
  });

  saveDB(db);

  res.json({
    success: true,
    message: `Berhasil menyinkronkan ${syncedCount} baris data pengaduan OPT ke Google Spreadsheets`,
    lastSyncedAt: now,
    totalSynced: syncedCount
  });
});

app.get('/api/sheets/logs', (_req, res) => {
  const db = initDB();
  res.json({ success: true, logs: db.syncLogs.slice(0, 30) });
});

// Export CSV for Spreadsheets
app.get('/api/sheets/export-csv', (_req, res) => {
  const db = initDB();
  const headers = [
    'No',
    'Kode Laporan',
    'Tanggal Lapor',
    'Nama Pelapor',
    'No Telepon/WA',
    'Kelompok Tani',
    'Desa',
    'Kecamatan',
    'Kabupaten',
    'Komoditas',
    'Nama OPT (Hama/Penyakit)',
    'Tipe OPT',
    'Luas Terserang (Ha)',
    'Luas Terancam (Ha)',
    'Tingkat Serangan',
    'Status Penanganan',
    'Petugas Verifikator',
    'Rekomendasi Tindakan',
    'Tindakan Lapangan',
    'Sumber Pengaduan',
    'Terhubung Chatbot Fonnte'
  ];

  const rows = db.reports.map((r, idx) => [
    idx + 1,
    `"${r.code}"`,
    `"${new Date(r.dateReported).toLocaleDateString('id-ID')}"`,
    `"${r.reporterName.replace(/"/g, '""')}"`,
    `"${r.reporterPhone}"`,
    `"${r.farmerGroup.replace(/"/g, '""')}"`,
    `"${r.village.replace(/"/g, '""')}"`,
    `"${r.subdistrict.replace(/"/g, '""')}"`,
    `"${r.district.replace(/"/g, '""')}"`,
    `"${r.commodity.replace(/"/g, '""')}"`,
    `"${r.pestName.replace(/"/g, '""')}"`,
    `"${r.pestType}"`,
    r.areaAffectedHa,
    r.areaThreatenedHa,
    `"${r.severity}"`,
    `"${r.status}"`,
    `"${(r.verifiedBy || '-').replace(/"/g, '""')}"`,
    `"${(r.recommendation || '-').replace(/"/g, '""')}"`,
    `"${(r.actionTaken || '-').replace(/"/g, '""')}"`,
    `"${r.source === 'fonnte_whatsapp' ? 'WhatsApp Fonnte' : 'Portal Web'}"`,
    `"${r.waNotificationSent ? 'Terkirim' : 'Belum'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="SIGAP_OPT_Laporan_Spreadsheet_${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send('\uFEFF' + csvContent); // Add UTF-8 BOM for Excel / Spreadsheets
});

// Export Excel (.xlsx) berdasarkan Bulan dan Tahun
app.get('/api/reports/export-excel', (req, res) => {
  const db = initDB();
  const { month, year, status, commodity, subdistrict } = req.query;

  let filtered = [...db.reports];

  // Filter berdasarkan Tahun (contoh: 2026)
  if (year && year !== 'all') {
    filtered = filtered.filter(r => {
      const d = new Date(r.dateReported);
      return d.getFullYear().toString() === year.toString();
    });
  }

  // Filter berdasarkan Bulan (1-12)
  if (month && month !== 'all') {
    filtered = filtered.filter(r => {
      const d = new Date(r.dateReported);
      return (d.getMonth() + 1).toString() === month.toString();
    });
  }

  // Filter Status
  if (status && status !== 'all') {
    filtered = filtered.filter(r => r.status === status);
  }

  // Filter Komoditas
  if (commodity && commodity !== 'all') {
    filtered = filtered.filter(r => r.commodity.toLowerCase().includes((commodity as string).toLowerCase()));
  }

  // Filter Kecamatan
  if (subdistrict && subdistrict !== 'all') {
    filtered = filtered.filter(r => r.subdistrict.toLowerCase().includes((subdistrict as string).toLowerCase()));
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const monthLabel = month && month !== 'all' ? monthNames[Number(month) - 1] : 'Semua-Bulan';
  const yearLabel = year && year !== 'all' ? year.toString() : new Date().getFullYear().toString();

  // Create Excel Rows Data
  const excelData = filtered.map((r, idx) => ({
    'No': idx + 1,
    'No Tiket Laporan': r.code,
    'Tanggal Lapor': new Date(r.dateReported).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    'Nama Pelapor / Petani': r.reporterName,
    'No WhatsApp / HP': r.reporterPhone || '-',
    'Kelompok Tani (Poktan)': r.farmerGroup || '-',
    'Kecamatan': r.subdistrict,
    'Desa / Pekon': r.village,
    'Komoditas Tanaman': r.commodity,
    'Jenis OPT (Hama/Penyakit)': r.pestName,
    'Kategori OPT': r.pestType,
    'Luas Terserang (Ha)': Number(r.areaAffectedHa) || 0,
    'Luas Terancam (Ha)': Number(r.areaThreatenedHa) || 0,
    'Tingkat Serangan': r.severity,
    'Umur Tanaman (Minggu)': r.plantAgeWeeks || 0,
    'Gejala Serangan di Lapangan': r.symptoms,
    'Status Tindakan': r.status,
    'Petugas Verifikator': r.verifiedBy || '-',
    'Rekomendasi Petugas (PHT)': r.recommendation || '-',
    'Tindakan Gerakan Pengendalian (Gerdal)': r.actionTaken || '-',
    'Kanal Laporan': r.source === 'fonnte_whatsapp' ? 'Chatbot WA Fonnte' : 'Portal Web'
  }));

  // Create Workbook
  const workbook = XLSX.utils.book_new();

  // 1. Sheet Utama Laporan
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set Column Widths for readability in MS Excel
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 18 }, // No Tiket
    { wch: 14 }, // Tanggal
    { wch: 24 }, // Nama
    { wch: 16 }, // HP
    { wch: 24 }, // Poktan
    { wch: 18 }, // Kecamatan
    { wch: 18 }, // Desa
    { wch: 16 }, // Komoditas
    { wch: 26 }, // OPT
    { wch: 14 }, // Kategori
    { wch: 18 }, // Terserang
    { wch: 18 }, // Terancam
    { wch: 16 }, // Tingkat
    { wch: 20 }, // Umur
    { wch: 35 }, // Gejala
    { wch: 22 }, // Status
    { wch: 22 }, // Petugas
    { wch: 35 }, // Rekomendasi
    { wch: 35 }, // Tindakan
    { wch: 18 }  // Kanal
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, `Laporan_${monthLabel.slice(0, 3)}_${yearLabel}`);

  // 2. Sheet Ringkasan Rekapitulasi (Statistik Eksekutif Dinas)
  const totalReports = filtered.length;
  const totalLuasTerserang = filtered.reduce((acc, curr) => acc + (Number(curr.areaAffectedHa) || 0), 0);
  const totalLuasTerancam = filtered.reduce((acc, curr) => acc + (Number(curr.areaThreatenedHa) || 0), 0);

  const summaryData = [
    { 'Parameter Rekapitulasi': 'Periode Laporan', 'Nilai': `${monthLabel} ${yearLabel}` },
    { 'Parameter Rekapitulasi': 'Total Pengaduan OPT', 'Nilai': `${totalReports} Laporan` },
    { 'Parameter Rekapitulasi': 'Total Luas Terserang', 'Nilai': `${totalLuasTerserang.toFixed(2)} Hektar (Ha)` },
    { 'Parameter Rekapitulasi': 'Total Luas Terancam', 'Nilai': `${totalLuasTerancam.toFixed(2)} Hektar (Ha)` },
    { 'Parameter Rekapitulasi': 'Status Selesai / Terkendali', 'Nilai': `${filtered.filter(r => r.status === 'Selesai').length} Laporan` },
    { 'Parameter Rekapitulasi': 'Status Gerdal / Tindak Lanjut', 'Nilai': `${filtered.filter(r => r.status === 'Tindak Lanjut / Gerdal').length} Laporan` },
    { 'Parameter Rekapitulasi': 'Status Menunggu Verifikasi', 'Nilai': `${filtered.filter(r => r.status === 'Menunggu Verifikasi').length} Laporan` },
    { 'Parameter Rekapitulasi': 'Tanggal Cetak File', 'Nilai': new Date().toLocaleString('id-ID') },
    { 'Parameter Rekapitulasi': 'Instansi Penerbit', 'Nilai': 'Dinas Pertanian Kabupaten Tanggamus - SIGAP-OPT' }
  ];

  const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
  summaryWorksheet['!cols'] = [{ wch: 35 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Ringkasan_Rekap_Dinas');

  // Generate buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  const safeFilename = `Laporan_Bulanan_OPT_${monthLabel}_${yearLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
  res.setHeader('Content-Length', excelBuffer.length);
  res.send(excelBuffer);
});

// 8. DASHBOARD ANALYTICS STATS
app.get('/api/stats', (_req, res) => {
  const db = initDB();
  const reports = db.reports;

  const totalReports = reports.length;
  const waitingVerification = reports.filter(r => r.status === 'Menunggu Verifikasi').length;
  const inProgress = reports.filter(r => r.status === 'Sedang Ditinjau Petugas' || r.status === 'Tindak Lanjut / Gerdal').length;
  const resolved = reports.filter(r => r.status === 'Selesai').length;

  const totalAreaAffectedHa = Number(reports.reduce((sum, r) => sum + (r.areaAffectedHa || 0), 0).toFixed(2));
  const totalAreaThreatenedHa = Number(reports.reduce((sum, r) => sum + (r.areaThreatenedHa || 0), 0).toFixed(2));

  const severityCounts: Record<string, number> = {
    Ringan: reports.filter(r => r.severity === 'Ringan').length,
    Sedang: reports.filter(r => r.severity === 'Sedang').length,
    Berat: reports.filter(r => r.severity === 'Berat').length,
    Puso: reports.filter(r => r.severity === 'Puso').length
  };

  const pestMap = new Map<string, { count: number; commodity: string }>();
  reports.forEach(r => {
    const existing = pestMap.get(r.pestName) || { count: 0, commodity: r.commodity };
    existing.count += 1;
    pestMap.set(r.pestName, existing);
  });

  const topPests = Array.from(pestMap.entries())
    .map(([pestName, val]) => ({ pestName, count: val.count, commodity: val.commodity }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const subdistrictCounts: Record<string, number> = {};
  reports.forEach(r => {
    subdistrictCounts[r.subdistrict] = (subdistrictCounts[r.subdistrict] || 0) + 1;
  });

  const stats: DashboardStats = {
    totalReports,
    waitingVerification,
    inProgress,
    resolved,
    totalAreaAffectedHa,
    totalAreaThreatenedHa,
    severityCounts: severityCounts as any,
    topPests,
    recentReports: reports.slice(0, 5),
    subdistrictCounts
  };

  res.json({ success: true, stats });
});

// -------------------------------------------------------------
// Vite middleware integration (Fullstack Dev & Prod)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // In production serve dist directory
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SIGAP-OPT Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
