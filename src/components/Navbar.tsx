import React from 'react';
import { LogOut, Shield, User as UserIcon, Activity, FileSpreadsheet, MessageSquare, BookOpen, UserCheck, Printer } from 'lucide-react';
import { User } from '../types/index.ts';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin?: () => void;
  onOpenLogoutConfirm: () => void;
  waitingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenLogoutConfirm,
  waitingCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg p-0.5 bg-white border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden shrink-0 hover:border-emerald-300 transition-colors">
              <img
                src="/logo_tanggamus.jpg"
                alt="Lambang Kabupaten Tanggamus"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-800 leading-none">
                SIGAP-OPT
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1.5 relative ${
                activeTab === 'reports'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Pengaduan OPT</span>
              {waitingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                  {waitingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('fonnte')}
              className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'fonnte'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Chatbot Fonnte</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            <button
              onClick={() => setActiveTab('sheets')}
              className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'sheets'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Spreadsheets</span>
            </button>

            {/* Menu Cetak Laporan Bulanan Excel */}
            <button
              onClick={() => setActiveTab('print')}
              className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'print'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              <span>Cetak Laporan</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold uppercase">
                Excel
              </span>
            </button>

            {/* Admin Only Tab: Halaman Admin & Menu Tambah User */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                  activeTab === 'users'
                    ? 'bg-purple-50 text-purple-800 font-semibold border border-purple-200'
                    : 'text-slate-600 hover:text-purple-900 hover:bg-purple-50/50'
                }`}
              >
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span>Admin & User</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-200 text-purple-900 font-bold uppercase">
                  Admin
                </span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'guide'
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Panduan OPT</span>
            </button>
          </nav>

          {/* Right Action: User Profile & LOGOUT BUTTON */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* User Info Capsule */}
                <div 
                  onClick={() => {
                    if (currentUser.role === 'admin') setActiveTab('users');
                  }}
                  className="hidden sm:flex items-center space-x-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/70 transition cursor-pointer"
                  title="Lihat Profil / Manajemen"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                      : currentUser.role === 'petugas_popt'
                      ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                      : 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                  }`}>
                    {currentUser.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[130px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize font-medium">
                      {currentUser.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* PROMINENT LOGOUT BUTTON */}
                <button
                  type="button"
                  onClick={onOpenLogoutConfirm}
                  aria-label="Logout"
                  className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 transition-all duration-200 active:scale-95 shadow-xs"
                  title="Keluar dari Akun"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span className="font-bold">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-md shadow-emerald-700/20 transition-all active:scale-95"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Login Petugas / Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between py-2.5 border-t border-slate-100 overflow-x-auto text-xs space-x-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'reports' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Pengaduan ({waitingCount})
          </button>
          <button
            onClick={() => setActiveTab('fonnte')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'fonnte' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Bot WA Fonnte
          </button>
          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'sheets' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Spreadsheets
          </button>
          <button
            onClick={() => setActiveTab('print')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'print' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Cetak Laporan Excel
          </button>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                activeTab === 'users' ? 'bg-purple-600 text-white font-bold' : 'text-purple-700'
              }`}
            >
              Tambah User
            </button>
          )}
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'guide' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            Panduan
          </button>
        </div>
      </div>
    </header>
  );
};
