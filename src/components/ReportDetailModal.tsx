import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  FileSpreadsheet, 
  Save, 
  Send,
  AlertTriangle,
  Flame,
  Check
} from 'lucide-react';
import { OPTReport, ReportStatus, AttackSeverity, User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface ReportDetailModalProps {
  report: OPTReport | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onReportUpdated: (updated: OPTReport) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  isOpen,
  onClose,
  currentUser,
  onReportUpdated,
}) => {
  if (!isOpen || !report) return null;

  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [severity, setSeverity] = useState<AttackSeverity>(report.severity);
  const [recommendation, setRecommendation] = useState(report.recommendation || '');
  const [actionTaken, setActionTaken] = useState(report.actionTaken || '');
  const [verifiedBy, setVerifiedBy] = useState(report.verifiedBy || currentUser?.name || 'Petugas POPT Wilayah');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await api.updateReport(report.id, {
        status,
        severity,
        recommendation,
        actionTaken,
        verifiedBy
      });

      if (res.success && res.report) {
        setFeedback({
          type: 'success',
          text: `Pembaruan status "${status}" berhasil disimpan. Database Spreadsheets otomatis diperbarui & notifikasi WhatsApp dikirim ke pelapor.`
        });
        onReportUpdated(res.report);
      } else {
        setFeedback({ type: 'error', text: res.message || 'Gagal menyimpan perubahan' });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Koneksi ke server gagal' });
    } finally {
      setIsSaving(false);
    }
  };

  const getWaDirectUrl = () => {
    if (!report.reporterPhone) return '';
    let phone = report.reporterPhone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);
    const msg = encodeURIComponent(
      `Halo Bpk/Ibu ${report.reporterName}, terkait laporan pengaduan OPT ${report.code} (${report.pestName} pada ${report.commodity}) di Desa ${report.village}, Kec. ${report.subdistrict}. Kami dari Tim POPT Dinas Pertanian ingin mengonfirmasi perkembangan penanganan di lapangan.`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          aria-label="Tutup detail"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header with Code and Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xl font-black text-emerald-800">{report.code}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                report.severity === 'Ringan' ? 'bg-emerald-100 text-emerald-800' :
                report.severity === 'Sedang' ? 'bg-amber-100 text-amber-800' :
                report.severity === 'Berat' ? 'bg-rose-100 text-rose-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                Serangan {report.severity}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {report.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Dilaporkan pada {new Date(report.dateReported).toLocaleString('id-ID')}</span>
              <span>&bull;</span>
              <span>Sumber: {report.source === 'fonnte_whatsapp' ? 'WhatsApp Fonnte' : 'Portal Web'}</span>
            </p>
          </div>

          {/* Direct WhatsApp link */}
          {report.reporterPhone && (
            <a
              href={getWaDirectUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Hubungi WA Pelapor</span>
            </a>
          )}
        </div>

        {feedback && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs font-medium flex items-center space-x-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 text-xs">
          <div className="space-y-2">
            <div>
              <span className="text-slate-400 font-medium">Pelapor & Kontak:</span>
              <p className="font-bold text-slate-900 text-sm">{report.reporterName}</p>
              <p className="text-slate-600 flex items-center space-x-1 mt-0.5">
                <Phone className="w-3 h-3 text-emerald-600" />
                <span>{report.reporterPhone || 'Tidak ada nomor'}</span>
              </p>
              <p className="text-slate-500">Kelompok Tani: {report.farmerGroup || '-'}</p>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 font-medium">Lokasi Hamparan:</span>
              <p className="font-semibold text-slate-800 flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                <span>Desa {report.village}, Kec. {report.subdistrict}, Kab. {report.district}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-400 font-medium">Komoditas & Hama:</span>
              <p className="font-bold text-slate-900 text-sm">{report.commodity}</p>
              <p className="text-rose-700 font-semibold">{report.pestName} ({report.pestType})</p>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 font-medium">Data Kerusakan Lahan:</span>
              <div className="flex items-center space-x-3 mt-0.5">
                <p className="text-slate-800">
                  Terserang: <strong className="text-rose-600 font-bold">{report.areaAffectedHa} Ha</strong>
                </p>
                <p className="text-slate-800">
                  Terancam: <strong className="text-amber-600 font-bold">{report.areaThreatenedHa} Ha</strong>
                </p>
              </div>
              <p className="text-slate-500 mt-1">
                Umur Tanaman: <strong>{report.plantAgeWeeks} Minggu / HST</strong>
              </p>
            </div>
          </div>

          {/* Symptoms */}
          <div className="md:col-span-2 pt-2 border-t border-slate-200/60">
            <span className="text-slate-400 font-medium">Gejala & Keterangan Lapangan:</span>
            <p className="text-slate-800 mt-1 bg-white p-3 rounded-lg border border-slate-200 font-normal leading-relaxed">
              {report.symptoms}
            </p>
          </div>
        </div>

        {/* Spreadsheets & Fonnte Realtime Sync Indicator */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-teal-50/50 border border-teal-200/80 rounded-xl text-xs text-teal-900 mb-6">
          <div className="flex items-center space-x-1.5 font-semibold">
            <FileSpreadsheet className="w-4 h-4 text-teal-700" />
            <span>Database Google Spreadsheets: <strong>Tersinkron Otomatis (Row #{report.sheetsRowId || 'Auto'})</strong></span>
          </div>
          <span className="text-teal-300 hidden sm:inline">&bull;</span>
          <div className="flex items-center space-x-1.5 font-semibold">
            <MessageSquare className="w-4 h-4 text-emerald-700" />
            <span>Chatbot WhatsApp Fonnte: <strong>Auto-Notification Aktif</strong></span>
          </div>
        </div>

        {/* VERIFICATION & ACTION FORM */}
        <form onSubmit={handleSaveUpdate} className="space-y-4 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Tindak Lanjut & Verifikasi Petugas POPT</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              Perubahan otomatis men-trigger pesan WhatsApp & baris Spreadsheet
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ubah Status Penanganan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
              >
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Sedang Ditinjau Petugas">Sedang Ditinjau Petugas Lapangan</option>
                <option value="Tindak Lanjut / Gerdal">Tindak Lanjut / Gerakan Pengendalian (Gerdal)</option>
                <option value="Selesai">Selesai / Terkendali</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Konfirmasi Tingkat Intensitas
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as AttackSeverity)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Ringan">Ringan (&lt; 25%)</option>
                <option value="Sedang">Sedang (25% - 50%)</option>
                <option value="Berat">Berat (50% - 85%)</option>
                <option value="Puso">Puso / Fuso (&gt; 85%)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Petugas Penanggung Jawab / Verifikator
            </label>
            <input
              type="text"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
              placeholder="e.g. Budi Santoso, S.P (POPT Cimanuk)"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rekomendasi Pengendalian Hama Terpadu (PHT)
            </label>
            <textarea
              rows={2}
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
              placeholder="e.g. Keringkan sawah berkala, aplikasi Beauveria bassiana 5 gr/liter air atau agens hayati terdaftar..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tindakan Lapangan / Jadwal Gerdal Massal
            </label>
            <textarea
              rows={2}
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="e.g. Telah dijadwalkan Gerakan Pengendalian Massal bersama Kelompok Tani pada hari Sabtu jam 07:00..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Tutup
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-md shadow-emerald-700/20 transition flex items-center space-x-2 disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan & Mensinkronkan...' : 'Simpan & Beritahu Petani'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
