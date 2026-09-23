import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Check, 
  FileSpreadsheet, 
  X, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { googleSignIn, getCachedAccessToken } from '../services/googleAuth.ts';
import { createSigapSpreadsheet, syncReportsToSpreadsheet } from '../services/googleSheetsApi.ts';
import { OPTReport, SpreadsheetConfig } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AutoConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: OPTReport[];
  defaultEmail?: string;
  onSuccess: (updatedConfig: SpreadsheetConfig) => void;
}

export const AutoConnectModal: React.FC<AutoConnectModalProps> = ({
  isOpen,
  onClose,
  reports,
  defaultEmail = 'absenairnaningan@gmail.com',
  onSuccess
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [sheetTitle, setSheetTitle] = useState('SIGAP-OPT Database Laporan Tanggamus');
  const [syncExisting, setSyncExisting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusStep, setStatusStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [createdResult, setCreatedResult] = useState<{
    spreadsheetId: string;
    spreadsheetUrl: string;
    rowsSynced: number;
  } | null>(null);

  if (!isOpen) return null;

  const handleStartAutoConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Harap masukkan alamat email Google yang valid');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setStatusStep('Menghubungkan akun Google (' + email.trim() + ')...');

    try {
      // 1. Authenticate with Google OAuth popup with login_hint
      let token = getCachedAccessToken();
      if (!token) {
        setStatusStep('Silakan izinkan akses akun Google pada jendela popup...');
        const authRes = await googleSignIn(email.trim());
        token = authRes.accessToken;
      }

      // 2. Create Spreadsheet in user's Google Drive automatically
      setStatusStep('Membuat dokumen spreadsheet baru di Google Drive Anda...');
      const created = await createSigapSpreadsheet(token, sheetTitle.trim());

      // 3. Sync existing reports if requested
      let rowsSynced = 0;
      if (syncExisting && reports.length > 0) {
        setStatusStep(`Menyinkronkan ${reports.length} laporan pengaduan ke sheet...`);
        try {
          rowsSynced = await syncReportsToSpreadsheet(
            token,
            created.spreadsheetId,
            created.sheetName,
            reports
          );
        } catch (syncErr) {
          console.warn('Syncing existing rows had an issue:', syncErr);
        }
      }

      // 4. Update Applet Configuration in Backend
      setStatusStep('Menyimpan konfigurasi otomatis ke sistem SIGAP-OPT...');
      const newConfig: SpreadsheetConfig = {
        autoSyncEnabled: true,
        spreadsheetId: created.spreadsheetId,
        sheetName: created.sheetName,
        webhookUrl: created.spreadsheetUrl,
        lastSyncedAt: new Date().toISOString(),
        totalSyncedRows: rowsSynced || reports.length
      };

      await api.updateSpreadsheetConfig(newConfig);

      setCreatedResult({
        spreadsheetId: created.spreadsheetId,
        spreadsheetUrl: created.spreadsheetUrl,
        rowsSynced
      });

      onSuccess(newConfig);
    } catch (err: any) {
      console.error('Auto connect error:', err);
      setErrorMsg(err.message || 'Gagal membuat dan menghubungkan Google Spreadsheet.');
    } finally {
      setIsProcessing(false);
      setStatusStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500"></div>

        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {!createdResult ? (
          <div>
            {/* Header */}
            <div className="flex items-start space-x-3.5 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Hubungkan Google Sheet Otomatis
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cukup masukkan alamat email Google Anda. Sistem akan membuatkan dokumen Google Spreadsheet lengkap dengan tabel rapi dan menghubungkannya secara instan.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleStartAutoConnect} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Akun Google Anda <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="namaanda@gmail.com"
                    disabled={isProcessing}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Spreadsheet baru akan dibuat langsung di Google Drive milik akun email ini.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Dokumen Spreadsheet
                </label>
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  disabled={isProcessing}
                  placeholder="SIGAP-OPT Database Laporan Tanggamus"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncExisting}
                    onChange={(e) => setSyncExisting(e.target.checked)}
                    disabled={isProcessing}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-emerald-900">
                    Langsung salin {reports.length} data pengaduan saat ini ke Spreadsheet
                  </span>
                </label>
                <p className="text-[11px] text-emerald-700/80 pl-6">
                  Termasuk nomor tiket, nama petani, kecamatan, jenis OPT, dan status penanganan.
                </p>
              </div>

              {/* Status Indicator when loading */}
              {isProcessing && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center space-x-2.5 text-blue-900 text-xs font-semibold">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  <span>{statusStep || 'Sedang memproses...'}</span>
                </div>
              )}

              {/* Official Google Button Style */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-lg shadow-emerald-700/25 transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sedang Membuat & Menghubungkan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Buat & Hubungkan Otomatis Sekarang</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 text-center pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Koneksi Resmi Google Workspace API &bull; Dokumen tersimpan di Drive Anda</span>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-2 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                Berhasil Dibuat & Terhubung!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Dokumen Google Spreadsheet telah otomatis dibuat di akun <strong>{email}</strong> dan tersambung dengan sistem SIGAP-OPT.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">ID Spreadsheet:</span>
                <span className="font-mono font-bold text-slate-800 truncate max-w-[200px]">
                  {createdResult.spreadsheetId}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Data Tersinkron:</span>
                <span className="font-bold text-emerald-700">
                  {createdResult.rowsSynced} Baris Data
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Status Integrasi:</span>
                <span className="font-bold text-emerald-600 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Auto-Sync Aktif</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <a
                href={createdResult.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Buka Dokumen di Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
