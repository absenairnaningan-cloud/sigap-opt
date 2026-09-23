import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Calendar, 
  Download, 
  Filter, 
  Printer, 
  CheckCircle2, 
  FileText, 
  Table, 
  PieChart, 
  Clock, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { OPTReport, User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface MonthlyPrintReportViewProps {
  reports: OPTReport[];
  currentUser: User | null;
}

export const MonthlyPrintReportView: React.FC<MonthlyPrintReportViewProps> = ({
  reports,
  currentUser
}) => {
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString();
  const currentYear = currentDate.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>('all');
  const [isDownloading, setIsDownloading] = useState(false);

  const months = [
    { value: '1', name: 'Januari' },
    { value: '2', name: 'Februari' },
    { value: '3', name: 'Maret' },
    { value: '4', name: 'April' },
    { value: '5', name: 'Mei' },
    { value: '6', name: 'Juni' },
    { value: '7', name: 'Juli' },
    { value: '8', name: 'Agustus' },
    { value: '9', name: 'September' },
    { value: '10', name: 'Oktober' },
    { value: '11', name: 'November' },
    { value: '12', name: 'Desember' }
  ];

  const years = ['2026', '2025', '2024'];

  // Distinct subdistricts & commodities from reports
  const subdistricts = Array.from(new Set(reports.map(r => r.subdistrict).filter(Boolean))).sort();
  const commodities = Array.from(new Set(reports.map(r => r.commodity).filter(Boolean))).sort();

  // Filtered reports preview
  const filteredReports = reports.filter((r) => {
    const d = new Date(r.dateReported);
    const matchYear = selectedYear === 'all' || d.getFullYear().toString() === selectedYear;
    const matchMonth = selectedMonth === 'all' || (d.getMonth() + 1).toString() === selectedMonth;
    const matchCommodity = selectedCommodity === 'all' || r.commodity.toLowerCase().includes(selectedCommodity.toLowerCase());
    const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const matchSubdistrict = selectedSubdistrict === 'all' || r.subdistrict.toLowerCase().includes(selectedSubdistrict.toLowerCase());

    return matchYear && matchMonth && matchCommodity && matchStatus && matchSubdistrict;
  });

  // Calculate statistics for preview
  const totalLaporan = filteredReports.length;
  const totalLuasTerserang = filteredReports.reduce((sum, r) => sum + (Number(r.areaAffectedHa) || 0), 0);
  const totalLuasTerancam = filteredReports.reduce((sum, r) => sum + (Number(r.areaThreatenedHa) || 0), 0);
  const selesaiCount = filteredReports.filter(r => r.status === 'Selesai').length;
  const gerdalCount = filteredReports.filter(r => r.status === 'Tindak Lanjut / Gerdal').length;
  const verifCount = filteredReports.filter(r => r.status === 'Menunggu Verifikasi').length;

  const currentMonthName = selectedMonth === 'all' 
    ? 'Semua Bulan' 
    : months.find(m => m.value === selectedMonth)?.name || 'Bulan Dipilih';

  const downloadExcelUrl = api.getExportExcelUrl({
    month: selectedMonth,
    year: selectedYear,
    status: selectedStatus !== 'all' ? selectedStatus : undefined,
    commodity: selectedCommodity !== 'all' ? selectedCommodity : undefined,
    subdistrict: selectedSubdistrict !== 'all' ? selectedSubdistrict : undefined
  });

  const handleDownloadExcel = () => {
    setIsDownloading(true);
    // Trigger download via anchor
    const link = document.createElement('a');
    link.href = downloadExcelUrl;
    link.download = `Laporan_OPT_${currentMonthName}_${selectedYear}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloading(false);
    }, 1200);
  };

  const handlePrintBrowser = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
              <Printer className="w-3.5 h-3.5" />
              <span>Modul Cetak Laporan Bulanan Dinas</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Cetak Rekapitulasi Laporan OPT ke File Excel (.xlsx)
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              Pilih periode bulan dan filter wilayah untuk mengunduh rekapitulasi data pengaduan OPT resmi siap cetak lengkap dengan kalkulasi luas serangan, komoditas, dan lembar statistik eksekutif.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadExcel}
              disabled={isDownloading}
              className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/25 transition active:scale-95 cursor-pointer disabled:opacity-75"
            >
              <FileSpreadsheet className="w-5 h-5 text-slate-950 fill-slate-950" />
              <span>{isDownloading ? 'Menyiapkan File...' : 'Unduh File Excel (.xlsx)'}</span>
              <Download className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={handlePrintBrowser}
              className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-xs transition"
              title="Cetak tampilan dokumen ringkasan ini"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Selector Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Pilih Periode Bulan & Filter Data Laporan
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Bulan */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Bulan Laporan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Bulan (Setahun Penuh)</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Tahun Anggaran
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Tahun</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          </div>

          {/* Kecamatan */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Kecamatan
            </label>
            <select
              value={selectedSubdistrict}
              onChange={(e) => setSelectedSubdistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Kecamatan</option>
              {subdistricts.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Komoditas */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Komoditas
            </label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Komoditas</option>
              {commodities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Penanganan */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Status Penanganan
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Status</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Sedang Ditinjau Petugas">Sedang Ditinjau Petugas</option>
              <option value="Tindak Lanjut / Gerdal">Tindak Lanjut / Gerdal</option>
              <option value="Selesai">Terkendali / Selesai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Laporan Periode Ini
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalLaporan}</span>
            <span className="text-xs font-semibold text-slate-500">Berkas</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {currentMonthName} {selectedYear}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Luas Terserang OPT
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-black text-amber-700">{totalLuasTerserang.toFixed(2)}</span>
            <span className="text-xs font-bold text-amber-800">Ha</span>
          </div>
          <span className="text-[11px] text-slate-500 block">Total hamparan terdampak</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
            Luas Terancam
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-black text-rose-700">{totalLuasTerancam.toFixed(2)}</span>
            <span className="text-xs font-bold text-rose-800">Ha</span>
          </div>
          <span className="text-[11px] text-slate-500 block">Potensi penularan OPT</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Terkendali / Selesai
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{selesaiCount}</span>
            <span className="text-xs font-semibold text-slate-500">/ {totalLaporan} laporan</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            {gerdalCount} proses gerdal aktif
          </span>
        </div>
      </div>

      {/* Preview Table of the Excel content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Table className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                Pratinjau Data Laporan ({filteredReports.length} Baris Data)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Struktur tabel di bawah ini yang akan diekspor rapi ke dalam dokumen Microsoft Excel (.xlsx) dengan 2 lembar kerja (Worksheet).
            </p>
          </div>

          <a
            href={downloadExcelUrl}
            download
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel Sekarang</span>
          </a>
        </div>

        {filteredReports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              Tidak ada data laporan pada periode {currentMonthName} {selectedYear}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Coba ganti filter bulan, tahun, atau kecamatan di atas untuk menampilkan data laporan lain.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center">No</th>
                  <th className="py-3 px-3">No Tiket</th>
                  <th className="py-3 px-3">Tanggal Lapor</th>
                  <th className="py-3 px-3">Pelapor / Petani</th>
                  <th className="py-3 px-3">Kecamatan</th>
                  <th className="py-3 px-3">Desa</th>
                  <th className="py-3 px-3">Komoditas</th>
                  <th className="py-3 px-3">Nama OPT</th>
                  <th className="py-3 px-3 text-right">Terserang (Ha)</th>
                  <th className="py-3 px-3 text-center">Keparahan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report, idx) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{report.code}</td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {new Date(report.dateReported).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{report.reporterName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{report.subdistrict}</td>
                    <td className="py-2.5 px-3 text-slate-600">{report.village}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {report.commodity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{report.pestName}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                      {Number(report.areaAffectedHa).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        report.severity === 'Ringan' ? 'bg-blue-100 text-blue-800' :
                        report.severity === 'Sedang' ? 'bg-amber-100 text-amber-800' :
                        report.severity === 'Berat' ? 'bg-orange-100 text-orange-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        report.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                        report.status === 'Tindak Lanjut / Gerdal' ? 'bg-teal-100 text-teal-800' :
                        report.status === 'Sedang Ditinjau Petugas' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{report.verifiedBy || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Info Box */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Format Excel (.xlsx) menyertakan 2 sheet: <strong>Data Laporan Bulanan</strong> dan <strong>Ringkasan Rekap Dinas</strong>.
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            SIGAP-OPT &bull; Dinas Pertanian Kabupaten Tanggamus
          </div>
        </div>
      </div>
    </div>
  );
};
