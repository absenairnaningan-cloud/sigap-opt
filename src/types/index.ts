export type UserRole = 'admin' | 'petugas_popt' | 'pengamat';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  region: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type AttackSeverity = 'Ringan' | 'Sedang' | 'Berat' | 'Puso';

export type ReportStatus = 
  | 'Menunggu Verifikasi'
  | 'Sedang Ditinjau Petugas'
  | 'Tindak Lanjut / Gerdal'
  | 'Selesai';

export interface OPTReport {
  id: string;
  code: string; // e.g. "OPT-2026-001"
  reporterName: string;
  reporterPhone: string;
  farmerGroup: string; // Kelompok Tani
  village: string; // Desa
  subdistrict: string; // Kecamatan
  district: string; // Kabupaten
  commodity: string; // Padi, Jagung, Cabai, dll
  pestName: string; // e.g. "Wereng Batang Coklat (Nilaparvata lugens)"
  pestType: 'Hama' | 'Penyakit';
  areaAffectedHa: number; // Luas terserang (Ha)
  areaThreatenedHa: number; // Luas terancam (Ha)
  severity: AttackSeverity;
  plantAgeWeeks: number; // Umur tanaman (HST / Minggu)
  symptoms: string;
  recommendation?: string;
  status: ReportStatus;
  source: 'web' | 'fonnte_whatsapp';
  dateReported: string;
  updatedAt: string;
  verifiedBy?: string;
  actionTaken?: string;
  syncedToSheets: boolean;
  sheetsRowId?: number;
  waNotificationSent: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface FonnteConfig {
  apiToken: string;
  senderNumber: string;
  autoReplyEnabled: boolean;
  autoNotificationOnUpdate: boolean;
  webhookUrl: string;
  webhookSecret: string;
}

export interface FonnteLog {
  id: string;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
  phone: string;
  senderName?: string;
  message: string;
  status: 'delivered' | 'processed' | 'failed' | 'simulated';
  reportCode?: string;
}

export interface SpreadsheetConfig {
  autoSyncEnabled: boolean;
  spreadsheetId: string;
  sheetName: string;
  webhookUrl: string; // Google Apps Script web app endpoint
  lastSyncedAt: string | null;
  totalSyncedRows: number;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'auto' | 'manual';
  status: 'success' | 'failed';
  rowsCount: number;
  message: string;
}

export interface Subdistrict {
  id: string;
  name: string;
  coordinator?: string;
  targetAreaHa?: number;
  description?: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalReports: number;
  waitingVerification: number;
  inProgress: number;
  resolved: number;
  totalAreaAffectedHa: number;
  totalAreaThreatenedHa: number;
  severityCounts: Record<AttackSeverity, number>;
  topPests: { pestName: string; count: number; commodity: string }[];
  recentReports: OPTReport[];
  subdistrictCounts: Record<string, number>;
  subdistricts?: Subdistrict[];
}
