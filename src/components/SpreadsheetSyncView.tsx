import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  Check, 
  Copy, 
  Settings, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Database,
  ExternalLink,
  Code2,
  PlayCircle,
  Video
} from 'lucide-react';
import { OPTReport, SpreadsheetConfig, SyncLog, User } from '../types/index.ts';
import { api } from '../services/api.ts';
import { VideoTutorialModal } from './VideoTutorialModal.tsx';
import { AutoConnectModal } from './AutoConnectModal.tsx';
import { Sparkles } from 'lucide-react';

interface SpreadsheetSyncViewProps {
  reports: OPTReport[];
  currentUser: User | null;
  onRefreshReports: () => void;
}

export const SpreadsheetSyncView: React.FC<SpreadsheetSyncViewProps> = ({
  reports,
  currentUser,
  onRefreshReports,
}) => {
  const [config, setConfig] = useState<SpreadsheetConfig | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [isCopiedScript, setIsCopiedScript] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showVideoTutorial, setShowVideoTutorial] = useState(false);
  const [showAutoConnectModal, setShowAutoConnectModal] = useState(false);
  const [searchTable, setSearchTable] = useState('');

  const loadData = async () => {
    try {
      const [confRes, logsRes] = await Promise.all([
        api.getSpreadsheetConfig(),
        api.getSpreadsheetLogs()
      ]);
      if (confRes.success) setConfig(confRes.config);
      if (logsRes.success) setSyncLogs(logsRes.logs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    try {
      const res = await api.syncSpreadsheetsNow();
      if (res.success) {
        setSyncMessage(res.message);
        onRefreshReports();
        loadData();
        setTimeout(() => setSyncMessage(''), 4000);
      }
    } catch {
      setSyncMessage('Gagal sinkronisasi data');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    try {
      const res = await api.updateSpreadsheetConfig(config);
      if (res.success) {
        setShowConfigModal(false);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const appsScriptCode = `/**
 * SIGAP-OPT - Google Apps Script Web App Endpoint
 * Tempel kode ini di menu Extensions -> Apps Script pada Google Sheet Anda.
 * Deploy sebagai Web App (Who has access: Anyone).
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Laporan_Pengaduan_OPT") || ss.getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    var item = payload.data;
    
    // Header check
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Kode Laporan", "Tanggal", "Nama Pelapor", "No WA", 
        "Desa", "Kecamatan", "Komoditas", "Nama OPT", 
        "Tipe", "Luas Terserang (Ha)", "Luas Terancam (Ha)", 
        "Tingkat Serangan", "Status", "Verifikator", "Rekomendasi", "Update Terakhir"
      ]);
      sheet.getRange(1, 1, 1, 16).setBackground("#0F9D58").setFontColor("#FFFFFF").setFontWeight("bold");
    }
    
    sheet.appendRow([
      item.code, item.dateReported, item.reporterName, item.reporterPhone,
      item.village, item.subdistrict, item.commodity, item.pestName,
      item.pestType, item.areaAffectedHa, item.areaThreatenedHa,
      item.severity, item.status, item.verifiedBy, item.recommendation, item.updatedAt
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", code: item.code }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setIsCopiedScript(true);
    setTimeout(() => setIsCopiedScript(false), 2000);
  };

  const filteredReports = reports.filter((r) => {
    const q = searchTable.toLowerCase();
    return (
      r.code.toLowerCase().includes(q) ||
      r.reporterName.toLowerCase().includes(q) ||
      r.village.toLowerCase().includes(q) ||
      r.commodity.toLowerCase().includes(q) ||
      r.pestName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-400" />
              <span>Database Spreadsheets Terpadu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pemantauan Data Terhubung Spreadsheets Otomatis
            </h1>
            <p className="text-teal-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Setiap pengaduan OPT yang masuk (baik dari Web maupun Chatbot Fonnte WhatsApp) otomatis dicatat ke dalam database tabel Google Spreadsheets untuk mempermudah rekapitulasi dinas, visualisasi peta serangan, dan arsip data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowAutoConnectModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-green-300 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition active:scale-95 cursor-pointer ring-2 ring-white/30 animate-pulse"
            >
              <Sparkles className="w-4 h-4 fill-slate-950 text-emerald-950" />
              <span>Hubungkan Otomatis via Email</span>
            </button>

            <button
              onClick={() => setShowVideoTutorial(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4 fill-slate-950 text-amber-400" />
              <span>Video Tutorial</span>
            </button>

            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
            </button>

            <a
              href={api.getExportCsvUrl()}
              download
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </a>
          </div>
        </div>
      </div>

      {syncMessage && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Status Sinkronisasi</p>
            <p className="text-sm font-black text-teal-900 mt-0.5 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              <span>Otomatis Aktif</span>
            </p>
            <p className="text-[11px] text-slate-400">Tersinkron tiap ada laporan baru</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Baris Spreadsheets</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">
              {config?.totalSyncedRows || reports.length} Baris
            </p>
            <p className="text-[11px] text-slate-400">Tabel: {config?.sheetName || 'Laporan_Pengaduan_OPT'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Sinkronisasi Terakhir</p>
            <p className="text-xs font-bold text-slate-800 mt-1 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {config?.lastSyncedAt ? new Date(config.lastSyncedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Baru saja'}
              </span>
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <button
                onClick={() => setShowAutoConnectModal(true)}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center space-x-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Buat Otomatis via Email</span>
              </button>
              <span className="text-slate-300">&bull;</span>
              <button
                onClick={() => setShowConfigModal(true)}
                className="text-[11px] text-slate-500 hover:text-slate-700 font-medium underline"
              >
                Manual ID
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* SPREADSHEET LIVE GRID VIEW */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Spreadsheet Header Mockup */}
        <div className="bg-[#0F9D58] text-white p-3.5 px-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Google Sheets: {config?.sheetName || 'Laporan_Pengaduan_OPT'}
              </h3>
              <p className="text-[10px] text-emerald-100 font-mono">
                ID Dokumen: {config?.spreadsheetId || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-white/20 text-white font-semibold">
              Terbaca Real-time
            </span>
          </div>
        </div>

        {/* Search bar inside sheet */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <input
            type="text"
            value={searchTable}
            onChange={(e) => setSearchTable(e.target.value)}
            placeholder="Cari baris spreadsheet (kode, pelapor, desa, komoditas)..."
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs w-72 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <span className="text-slate-500 font-medium">
            Menampilkan {filteredReports.length} baris data
          </span>
        </div>

        {/* Grid Table */}
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-300 select-none">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200 bg-slate-200/70 text-center w-12 font-sans text-slate-500">
                  #
                </th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[120px]">Kode_Laporan</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[150px]">Nama_Pelapor</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[120px]">No_WA_Fonnte</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[120px]">Desa</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[120px]">Kecamatan</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[140px]">Komoditas</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[160px]">Jenis_OPT</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-right min-w-[90px]">Luas_Ha</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[100px]">Intensitas</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[140px]">Status_Penanganan</th>
                <th className="py-2.5 px-3 border-r border-slate-200 min-w-[140px]">Petugas_POPT</th>
                <th className="py-2.5 px-3 min-w-[200px]">Rekomendasi_PHT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredReports.map((r, idx) => (
                <tr key={r.id} className="hover:bg-emerald-50/40 transition">
                  <td className="py-2 px-3 border-r border-slate-200 bg-slate-50 text-center text-slate-400 font-sans text-[11px]">
                    {idx + 2}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-bold text-emerald-800">
                    {r.code}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-900 font-sans font-medium">
                    {r.reporterName}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-slate-600">
                    {r.reporterPhone || '-'}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-sans">{r.village}</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-sans">{r.subdistrict}</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-sans">{r.commodity}</td>
                  <td className="py-2 px-3 border-r border-slate-200 font-sans text-slate-900 font-medium">
                    {r.pestName}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 text-right font-bold text-slate-800">
                    {r.areaAffectedHa}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-sans">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      r.severity === 'Ringan' ? 'bg-emerald-100 text-emerald-800' :
                      r.severity === 'Sedang' ? 'bg-amber-100 text-amber-800' :
                      r.severity === 'Berat' ? 'bg-rose-100 text-rose-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-sans">
                    <span className="text-[11px] font-medium text-slate-700">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 font-sans text-slate-600">
                    {r.verifiedBy || '-'}
                  </td>
                  <td className="py-2 px-3 font-sans text-slate-500 text-[11px] truncate max-w-xs">
                    {r.recommendation || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Google Apps Script Integration Helper */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <Code2 className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Panduan Menghubungkan Google Sheet Langsung (Apps Script)
              </h3>
              <p className="text-xs text-slate-500">
                Gunakan skrip di bawah untuk menghubungkan Google Sheet Anda secara instan tanpa perlu OAuth rumit
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowVideoTutorial(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 transition cursor-pointer"
            >
              <PlayCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Putar Video Tutorial</span>
            </button>

            <button
              onClick={handleCopyScript}
              className="flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition cursor-pointer"
            >
              {isCopiedScript ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4 text-teal-600" />}
              <span>{isCopiedScript ? 'Tersalin!' : 'Salin Skrip'}</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono max-h-48 overflow-y-auto">
          <pre>{appsScriptCode}</pre>
        </div>

        <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 pl-1">
          <li>Buka file Google Sheets Anda, lalu klik menu <strong>Extensions &gt; Apps Script</strong>.</li>
          <li>Hapus kode bawaan dan tempelkan kode skrip di atas, lalu simpan.</li>
          <li>Klik tombol <strong>Deploy &gt; New deployment</strong>, pilih type <strong>Web App</strong>.</li>
          <li>Setel <em>Execute as: Me</em> dan <em>Who has access: Anyone</em>, lalu klik Deploy.</li>
          <li>Salin URL Web App yang dihasilkan dan tempelkan pada menu <strong>Atur ID Google Sheet</strong> di atas.</li>
        </ol>
      </div>

      {/* MODAL CONFIG */}
      {showConfigModal && config && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Konfigurasi Integrasi Google Spreadsheets
            </h3>

            <form onSubmit={handleSaveConfig} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Sheet ID / URL
                </label>
                <input
                  type="text"
                  value={config.spreadsheetId}
                  onChange={(e) => setConfig({ ...config, spreadsheetId: e.target.value })}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lembar Kerja (Sheet Tab Name)
                </label>
                <input
                  type="text"
                  value={config.sheetName}
                  onChange={(e) => setConfig({ ...config, sheetName: e.target.value })}
                  placeholder="Laporan_Pengaduan_OPT"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Google Apps Script Webhook URL (Opsional)
                </label>
                <input
                  type="text"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoSyncEnabled}
                    onChange={(e) => setConfig({ ...config, autoSyncEnabled: e.target.checked })}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span className="font-semibold text-slate-800">
                    Aktifkan Sinkronisasi Otomatis Setiap Laporan Baru
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL VIDEO TUTORIAL INTERAKTIF */}
      <VideoTutorialModal
        isOpen={showVideoTutorial}
        onClose={() => setShowVideoTutorial(false)}
        appsScriptCode={appsScriptCode}
      />

      {/* MODAL HUBUNGKAN OTOMATIS VIA EMAIL */}
      <AutoConnectModal
        isOpen={showAutoConnectModal}
        onClose={() => setShowAutoConnectModal(false)}
        reports={reports}
        defaultEmail={currentUser?.email || 'absenairnaningan@gmail.com'}
        onSuccess={(updatedConfig) => {
          setConfig(updatedConfig);
          onRefreshReports();
          loadData();
        }}
      />
    </div>
  );
};
