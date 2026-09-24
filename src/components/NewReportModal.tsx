import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle, MapPin, Phone, Shield, FileSpreadsheet, MessageSquare } from 'lucide-react';
import { OPTReport, AttackSeverity, Subdistrict } from '../types/index.ts';
import { api } from '../services/api.ts';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (report: OPTReport) => void;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({
  isOpen,
  onClose,
  onReportCreated,
}) => {
  const [subdistricts, setSubdistricts] = useState<Subdistrict[]>([]);
  const [formData, setFormData] = useState({
    reporterName: '',
    reporterPhone: '',
    farmerGroup: '',
    village: '',
    subdistrict: '',
    district: 'Sukabumi',
    commodity: 'Padi Sawah',
    pestName: 'Wereng Batang Coklat (Nilaparvata lugens)',
    pestType: 'Hama' as 'Hama' | 'Penyakit',
    areaAffectedHa: 1.0,
    areaThreatenedHa: 5.0,
    severity: 'Sedang' as AttackSeverity,
    plantAgeWeeks: 4,
    symptoms: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getSubdistricts().then(res => {
        if (res.success && res.subdistricts) {
          setSubdistricts(res.subdistricts);
        }
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.reporterName || !formData.village || !formData.subdistrict) {
      setErrorMsg('Nama Pelapor, Desa, dan Kecamatan wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.createReport(formData);
      if (res.success && res.report) {
        setSuccessMsg(`Laporan berhasil diterbitkan dengan ID: ${res.report.code}`);
        onReportCreated(res.report);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Gagal menyimpan laporan');
      }
    } catch {
      setErrorMsg('Koneksi ke server terputus.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-left relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          aria-label="Tutup form"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Form Pengaduan Serangan OPT</h2>
            <p className="text-xs text-slate-500">
              Laporan otomatis terhubung ke Database Spreadsheets & WhatsApp Chatbot
            </p>
          </div>
        </div>

        {/* Auto Sync info banner */}
        <div className="mb-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Otomatisasi Aktif:</strong> Laporan ini langsung diinput ke Google Spreadsheets dan notifikasi konfirmasi dikirim ke WhatsApp pelapor via Fonnte Gateway.
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Reporter info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Pelapor / Petani <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.reporterName}
                onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                placeholder="e.g. Pak Marwan / Poktan..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor WhatsApp Pelapor
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.reporterPhone}
                  onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                  placeholder="081234567890 (Untuk Notif Fonnte)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelompok Tani (Poktan)
              </label>
              <input
                type="text"
                value={formData.farmerGroup}
                onChange={(e) => setFormData({ ...formData, farmerGroup: e.target.value })}
                placeholder="e.g. Poktan Harapan Maju"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Desa / Kelurahan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                placeholder="e.g. Sukamaju"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kecamatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                list="registered-subdistricts-list"
                value={formData.subdistrict}
                onChange={(e) => setFormData({ ...formData, subdistrict: e.target.value })}
                placeholder="Pilih atau ketik Kecamatan..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <datalist id="registered-subdistricts-list">
                {subdistricts.map(s => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Commodity & Pest info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Komoditas Tanaman
              </label>
              <select
                value={formData.commodity}
                onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Padi Sawah (Ciherang/Inpari)">Padi Sawah (Ciherang/Inpari)</option>
                <option value="Padi Gogo">Padi Gogo</option>
                <option value="Jagung Hibrida">Jagung Hibrida</option>
                <option value="Cabai Merah Keriting">Cabai Merah Keriting</option>
                <option value="Bawang Merah">Bawang Merah</option>
                <option value="Kedelai">Kedelai</option>
                <option value="Tomat / Sayuran">Tomat / Sayuran</option>
                <option value="Kelapa Sawit">Kelapa Sawit</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipe OPT
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pestType: 'Hama' })}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition ${
                    formData.pestType === 'Hama'
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🐛 Hama Serangga/Hewan
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pestType: 'Penyakit' })}
                  className={`py-2 px-3 rounded-xl border font-bold text-xs transition ${
                    formData.pestType === 'Penyakit'
                      ? 'bg-rose-100 border-rose-300 text-rose-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  🍄 Penyakit Jamur/Bakteri
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Organisme Pengganggu Tanaman (OPT) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.pestName}
              onChange={(e) => setFormData({ ...formData, pestName: e.target.value })}
              placeholder="e.g. Wereng Batang Coklat, Ulat Grayak FAW, Tikus Sawah, Penyakit Blas..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Area & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Luas Terserang (Hektar)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.05"
                value={formData.areaAffectedHa}
                onChange={(e) => setFormData({ ...formData, areaAffectedHa: parseFloat(e.target.value) || 0.1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Luas Terancam (Hektar)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={formData.areaThreatenedHa}
                onChange={(e) => setFormData({ ...formData, areaThreatenedHa: parseFloat(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tingkat Intensitas Serangan
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as AttackSeverity })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              Gejala Serangan di Lapangan
            </label>
            <textarea
              rows={3}
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              placeholder="Jelaskan kondisi daun, batang, atau buah terserang (misal: daun menguning, titik bakar melingkar, populasi nimfa padat)..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-md shadow-emerald-700/20 transition flex items-center space-x-2 disabled:opacity-70"
            >
              <Send className="w-4 h-4" />
              <span>{isLoading ? 'Menyimpan & Mensinkronkan...' : 'Kirim Laporan Pengaduan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
