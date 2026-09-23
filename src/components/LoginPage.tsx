import React, { useState } from 'react';
import { LogIn, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { User } from '../types/index.ts';

interface LoginPageProps {
  onLogin: (username: string, pass: string) => Promise<{ success: boolean; message: string; user?: User }>;
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Harap masukkan username dan password');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await onLogin(username.trim(), password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Username atau password salah');
      }
    } catch {
      setErrorMsg('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/5 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background aesthetic blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-emerald-100/60 to-transparent pointer-events-none -z-10 blur-3xl"></div>

      {/* Top Header info */}
      <div className="max-w-md w-full mx-auto flex items-center justify-center space-x-3 pt-4">
        <div className="w-10 h-10 rounded-xl p-0.5 bg-white border border-slate-200/90 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
          <img
            src="/logo_tanggamus.jpg"
            alt="Lambang Kabupaten Tanggamus"
            className="w-full h-full object-contain"
          />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-slate-800">
          SIGAP-OPT
        </span>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="bg-white rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/60 border border-slate-200/80 text-left relative">
          {/* Header Card */}
          <div className="text-center mb-7">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shadow-md shadow-emerald-900/10 mb-3.5 ring-4 ring-emerald-50">
              <img
                src="/logo_tanggamus.jpg"
                alt="Lambang Kabupaten Tanggamus"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Login Petugas & Admin</h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Silakan masuk menggunakan akun petugas Anda untuk mengakses seluruh menu dan data sistem SIGAP-OPT.
            </p>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md shadow-emerald-700/20 transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi akun...' : 'Masuk ke Sistem'}</span>
            </button>
          </form>

          {/* Security badge note */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sistem Proteksi Akses & Basis Data Terenkripsi</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-slate-400 pb-2">
        <p>Dinas Pertanian & Ketahanan Pangan Kabupaten Tanggamus &bull; SIGAP-OPT</p>
      </div>
    </div>
  );
};
