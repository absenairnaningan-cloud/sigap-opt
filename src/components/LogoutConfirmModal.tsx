import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { User } from '../types/index.ts';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentUser: User | null;
  isLoading?: boolean;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentUser,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Konfirmasi Logout</h3>
            <p className="text-xs text-slate-500">Akhiri sesi pengguna SIGAP-OPT</p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 text-xs text-slate-700 space-y-1.5">
          <p>
            Anda saat ini login sebagai <strong className="text-slate-900 font-semibold">{currentUser?.name}</strong>.
          </p>
          <p className="text-slate-500">
            Role: <span className="font-semibold capitalize text-emerald-700">{currentUser?.role.replace('_', ' ')}</span> &bull; Wilayah: {currentUser?.region}
          </p>
          <p className="text-slate-600 pt-1 text-[11px]">
            Setelah logout, Anda akan diarahkan ke tampilan publik dan fitur administrasi/verifikasi laporan akan dikunci.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition flex items-center space-x-1.5 disabled:opacity-70"
          >
            <LogOut className="w-4 h-4" />
            <span>{isLoading ? 'Memproses...' : 'Ya, Logout Sekarang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
