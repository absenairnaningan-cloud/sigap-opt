import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  FileSpreadsheet, 
  MessageSquare, 
  PlusCircle, 
  ShieldAlert, 
  ArrowRight,
  Sparkles,
  MapPin,
  Flame
} from 'lucide-react';
import { DashboardStats as StatsType, OPTReport, User } from '../types/index.ts';

interface DashboardStatsProps {
  stats: StatsType | null;
  onNavigate: (tab: string) => void;
  onOpenNewReport: () => void;
  onSelectReport: (report: OPTReport) => void;
  currentUser: User | null;
  spreadsheetSyncedCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  onNavigate,
  onOpenNewReport,
  onSelectReport,
  currentUser,
  spreadsheetSyncedCount,
}) => {
  if (!stats) {
    return (
      <div className="py-12 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-sm">Memuat data pemantauan OPT...</p>
      </div>
    );
  }

  const severityTotal = (stats.severityCounts.Ringan || 0) + 
                        (stats.severityCounts.Sedang || 0) + 
                        (stats.severityCounts.Berat || 0) + 
                        (stats.severityCounts.Puso || 0) || 1;

  const getPercent = (count: number) => Math.round(((count || 0) / severityTotal) * 100);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sistem Proteksi Pangan Terpadu Dinas Pertanian</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Pemantauan & Pengaduan OPT Real-Time
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-2xl">
              Terhubung langsung dengan <strong className="text-white">Chatbot WhatsApp Fonnte</strong> dan <strong className="text-white">Database Spreadsheets Otomatis</strong> untuk percepatan penanganan serangan hama dan perlindungan hasil panen petani.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewReport}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Buat Laporan Pengaduan</span>
            </button>
            <button
              onClick={() => onNavigate('fonnte')}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Buka Bot WA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Integration Status Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fonnte Card */}
        <div 
          onClick={() => onNavigate('fonnte')}
          className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs hover:border-emerald-400 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center ring-1 ring-emerald-200 group-hover:scale-105 transition">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900">Chatbot Fonnte WhatsApp</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  ● Aktif (Auto-Reply)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Petani dapat lapor via WA: <code className="bg-slate-100 text-emerald-700 px-1 py-0.5 rounded text-[11px] font-mono">LAPOR#Nama#Desa#Hama#Luas</code>
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition" />
        </div>

        {/* Spreadsheets Card */}
        <div 
          onClick={() => onNavigate('sheets')}
          className="bg-white p-4 rounded-2xl border border-teal-200/80 shadow-xs hover:border-teal-400 transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center ring-1 ring-teal-200 group-hover:scale-105 transition">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900">Database Spreadsheets Otomatis</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  ● {spreadsheetSyncedCount || stats.totalReports} Baris Terhubung
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Setiap laporan otomatis dicatat ke Google Sheets tanpa entri manual
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengaduan</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-3">{stats.totalReports}</p>
          <p className="text-[11px] text-slate-500 mt-1">Laporan hama/penyakit masuk</p>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Menunggu Verifikasi</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600 mt-3">{stats.waitingVerification}</p>
          <p className="text-[11px] text-amber-700/80 mt-1">Perlu tinjauan petugas lapangan</p>
        </div>

        {/* Tindak Lanjut & Gerdal */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Tindak Lanjut / Gerdal</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-600 mt-3">{stats.inProgress}</p>
          <p className="text-[11px] text-blue-700/80 mt-1">Gerakan pengendalian lapangan</p>
        </div>

        {/* Terkendali / Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Terkendali / Selesai</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-3">{stats.resolved}</p>
          <p className="text-[11px] text-emerald-700/80 mt-1">Populasi OPT ditekan aman</p>
        </div>
      </div>

      {/* Area & Severity Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Progress */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Tingkat Intensitas Serangan</h2>
              <p className="text-xs text-slate-500">Berdasarkan skala pengamatan POPT</p>
            </div>
            <ShieldAlert className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Ringan (&lt;25%)</span>
                </span>
                <span className="text-slate-600">{stats.severityCounts.Ringan || 0} ({getPercent(stats.severityCounts.Ringan)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all" 
                  style={{ width: `${getPercent(stats.severityCounts.Ringan)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Sedang (25% - 50%)</span>
                </span>
                <span className="text-slate-600">{stats.severityCounts.Sedang || 0} ({getPercent(stats.severityCounts.Sedang)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all" 
                  style={{ width: `${getPercent(stats.severityCounts.Sedang)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Berat (50% - 85%)</span>
                </span>
                <span className="text-slate-600">{stats.severityCounts.Berat || 0} ({getPercent(stats.severityCounts.Berat)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-rose-500 h-2 rounded-full transition-all" 
                  style={{ width: `${getPercent(stats.severityCounts.Berat)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-purple-700 flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>Puso / Fuso (&gt;85%)</span>
                </span>
                <span className="text-slate-600">{stats.severityCounts.Puso || 0} ({getPercent(stats.severityCounts.Puso)}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all" 
                  style={{ width: `${getPercent(stats.severityCounts.Puso)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
            <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
              <p className="text-[11px] font-medium text-rose-700">Luas Terserang</p>
              <p className="text-lg font-black text-rose-900 mt-0.5">{stats.totalAreaAffectedHa} Ha</p>
            </div>
            <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
              <p className="text-[11px] font-medium text-amber-700">Luas Terancam</p>
              <p className="text-lg font-black text-amber-900 mt-0.5">{stats.totalAreaThreatenedHa} Ha</p>
            </div>
          </div>
        </div>

        {/* Top Pests Attacks */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Jenis OPT Terbanyak Dilaporkan</h2>
              <p className="text-xs text-slate-500">Frekuensi serangan berdasarkan laporan</p>
            </div>
            <AlertTriangle className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-2.5 pt-1">
            {stats.topPests.map((p, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.pestName}</p>
                    <p className="text-[10px] text-slate-500">{p.commodity}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-700">
                  {p.count} kasus
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wilayah Sebaran Kecamatan */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Sebaran Wilayah Kecamatan</h2>
              <p className="text-xs text-slate-500">Konsentrasi laporan pengaduan</p>
            </div>
            <MapPin className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-2 pt-1">
            {Object.entries(stats.subdistrictCounts).map(([kec, count], idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 text-xs">
                <span className="font-semibold text-slate-800 flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                  <span>Kecamatan {kec}</span>
                </span>
                <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  {count} Laporan
                </span>
              </div>
            ))}
          </div>

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => onNavigate('users')}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition flex items-center justify-center space-x-1.5"
            >
              <span>+ Atur Petugas per Wilayah (Halaman Admin)</span>
            </button>
          )}
        </div>
      </div>

      {/* Recent Reports Table Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Laporan Pengaduan Terkini</h2>
            <p className="text-xs text-slate-500">Laporan terbaru yang masuk via Web & Chatbot WhatsApp</p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>Lihat Semua Laporan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Kode Tiket</th>
                <th className="py-3 px-4">Pelapor & Lokasi</th>
                <th className="py-3 px-4">Komoditas & Hama</th>
                <th className="py-3 px-4">Intensitas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Spreadsheet</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    {report.code}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-800">{report.reporterName}</p>
                    <p className="text-[10px] text-slate-500">Desa {report.village}, Kec. {report.subdistrict}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">{report.commodity}</p>
                    <p className="text-[10px] text-slate-500">{report.pestName}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      report.severity === 'Ringan' ? 'bg-emerald-100 text-emerald-800' :
                      report.severity === 'Sedang' ? 'bg-amber-100 text-amber-800' :
                      report.severity === 'Berat' ? 'bg-rose-100 text-rose-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {report.severity} ({report.areaAffectedHa} Ha)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[10px] border border-slate-200">
                      {report.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] text-teal-700 font-semibold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                      <span>Tersinkron</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectReport(report)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition"
                    >
                      Buka & Verifikasi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
