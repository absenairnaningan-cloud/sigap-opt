import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  FileSpreadsheet, 
  Eye, 
  Trash2,
  Filter
} from 'lucide-react';
import { OPTReport, User } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Printer } from 'lucide-react';

interface ReportsListProps {
  reports: OPTReport[];
  currentUser: User | null;
  onOpenNewReport: () => void;
  onSelectReport: (report: OPTReport) => void;
  onRefreshReports: () => void;
  isLoading: boolean;
  onNavigateToPrint?: () => void;
}

export const ReportsList: React.FC<ReportsListProps> = ({
  reports,
  currentUser,
  onOpenNewReport,
  onSelectReport,
  onRefreshReports,
  isLoading,
  onNavigateToPrint,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [commodityFilter, setCommodityFilter] = useState('all');

  const filteredReports = reports.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSeverity = severityFilter === 'all' || r.severity === severityFilter;
    const matchCommodity = commodityFilter === 'all' || r.commodity.toLowerCase().includes(commodityFilter.toLowerCase());
    
    const q = search.toLowerCase();
    const matchQuery =
      r.code.toLowerCase().includes(q) ||
      r.reporterName.toLowerCase().includes(q) ||
      r.pestName.toLowerCase().includes(q) ||
      r.village.toLowerCase().includes(q) ||
      r.subdistrict.toLowerCase().includes(q) ||
      r.commodity.toLowerCase().includes(q);

    return matchStatus && matchSeverity && matchCommodity && matchQuery;
  });

  const handleDelete = async (report: OPTReport) => {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Hanya Administrator yang memiliki akses menghapus data laporan.');
      return;
    }
    const confirmed = window.confirm(`Hapus laporan pengaduan ${report.code} dari ${report.reporterName}?`);
    if (!confirmed) return;

    try {
      const res = await api.deleteReport(report.id);
      if (res.success) {
        onRefreshReports();
      } else {
        alert(res.message);
      }
    } catch {
      alert('Gagal menghubungi server');
    }
  };

  const commodities = Array.from(new Set(reports.map((r) => r.commodity.split(' ')[0])));

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Daftar Pengaduan Organisme Pengganggu Tanaman
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data pemantauan serangan hama & penyakit tanaman dari masyarakat, kelompok tani, dan petugas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToPrint && (
            <button
              onClick={onNavigateToPrint}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Cetak & Unduh Laporan Rekapitulasi Excel Berdasarkan Bulan"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              <span>Cetak Excel Bulanan</span>
            </button>
          )}

          <a
            href={api.getExportCsvUrl()}
            download
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition shadow-xs"
            title="Download database dalam format CSV untuk Google Spreadsheets"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </a>

          <button
            onClick={onOpenNewReport}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Laporan Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode tiket, nama, desa..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Status Penanganan</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Sedang Ditinjau Petugas">Sedang Ditinjau Petugas</option>
              <option value="Tindak Lanjut / Gerdal">Tindak Lanjut / Gerdal</option>
              <option value="Selesai">Terkendali / Selesai</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Tingkat Intensitas</option>
              <option value="Ringan">Ringan (&lt;25%)</option>
              <option value="Sedang">Sedang (25% - 50%)</option>
              <option value="Berat">Berat (50% - 85%)</option>
              <option value="Puso">Puso / Fuso (&gt;85%)</option>
            </select>
          </div>

          {/* Commodity Filter & Refresh */}
          <div className="flex items-center space-x-2">
            <select
              value={commodityFilter}
              onChange={(e) => setCommodityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Komoditas</option>
              {commodities.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={onRefreshReports}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition flex-shrink-0"
              title="Muat Ulang"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Active Filter Pills */}
        {(statusFilter !== 'all' || severityFilter !== 'all' || commodityFilter !== 'all' || search) && (
          <div className="flex items-center space-x-2 pt-2 text-xs">
            <span className="text-slate-400 font-medium flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter aktif:</span>
            </span>
            <button
              onClick={() => {
                setStatusFilter('all');
                setSeverityFilter('all');
                setCommodityFilter('all');
                setSearch('');
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] sm:text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">No. Tiket & Tanggal</th>
                <th className="py-3.5 px-4">Pelapor & Kelompok Tani</th>
                <th className="py-3.5 px-4">Wilayah & Komoditas</th>
                <th className="py-3.5 px-4">OPT & Intensitas</th>
                <th className="py-3.5 px-4">Status Penanganan</th>
                <th className="py-3.5 px-4">Integrasi Otomatis</th>
                <th className="py-3.5 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-base font-semibold text-slate-600">Tidak ada laporan pengaduan ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter status</p>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-extrabold text-emerald-800 text-xs sm:text-sm">
                        {report.code}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(report.dateReported).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{report.reporterName}</p>
                      <p className="text-[11px] text-slate-500">{report.farmerGroup || 'Umum'}</p>
                      {report.reporterPhone && (
                        <p className="text-[10px] text-emerald-700 font-mono mt-0.5">WA: {report.reporterPhone}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{report.commodity}</p>
                      <p className="text-[11px] text-slate-500">
                        Desa {report.village}, Kec. {report.subdistrict}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{report.pestName}</p>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          report.severity === 'Ringan' ? 'bg-emerald-100 text-emerald-800' :
                          report.severity === 'Sedang' ? 'bg-amber-100 text-amber-800' :
                          report.severity === 'Berat' ? 'bg-rose-100 text-rose-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {report.severity}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {report.areaAffectedHa} Ha terserang
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        report.status === 'Menunggu Verifikasi'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : report.status === 'Sedang Ditinjau Petugas'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : report.status === 'Tindak Lanjut / Gerdal'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {report.status === 'Selesai' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {report.status === 'Menunggu Verifikasi' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        <span>{report.status}</span>
                      </span>
                      {report.verifiedBy && (
                        <p className="text-[10px] text-slate-500 mt-1">Oleh: {report.verifiedBy}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      {/* Spreadsheets sync badge */}
                      <div className="flex items-center space-x-1.5 text-[11px]">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        <span className="text-teal-800 font-medium">
                          {report.syncedToSheets ? 'Otomatis di Spreadsheets' : 'Pending Sync'}
                        </span>
                      </div>

                      {/* Source badge */}
                      <div className="flex items-center space-x-1.5 text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="text-slate-600">
                          {report.source === 'fonnte_whatsapp' ? 'Fonnte WhatsApp' : 'Form Web'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelectReport(report)}
                          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition shadow-xs"
                          title="Lihat detail laporan & isi verifikasi lapangan"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Periksa</span>
                        </button>

                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(report)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Laporan (Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
