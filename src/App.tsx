import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { DashboardStats } from './components/DashboardStats.tsx';
import { ReportsList } from './components/ReportsList.tsx';
import { AdminUserManagement } from './components/AdminUserManagement.tsx';
import { FonnteBotHub } from './components/FonnteBotHub.tsx';
import { SpreadsheetSyncView } from './components/SpreadsheetSyncView.tsx';
import { MonthlyPrintReportView } from './components/MonthlyPrintReportView.tsx';
import { OPTKnowledgeBase } from './components/OPTKnowledgeBase.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { LogoutConfirmModal } from './components/LogoutConfirmModal.tsx';
import { NewReportModal } from './components/NewReportModal.tsx';
import { ReportDetailModal } from './components/ReportDetailModal.tsx';
import { OPTReport, User, DashboardStats as StatsType } from './types/index.ts';
import { api, authStorage } from './services/api.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [reports, setReports] = useState<OPTReport[]>([]);
  const [stats, setStats] = useState<StatsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<OPTReport | null>(null);

  // Initial user check & data load
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // 1. Check existing session
      const meRes = await api.getMe();
      if (meRes.authenticated && meRes.user) {
        setCurrentUser(meRes.user);
        // Load data if authenticated
        const [reportsRes, statsRes] = await Promise.all([
          api.getReports(),
          api.getStats()
        ]);
        if (reportsRes.success) setReports(reportsRes.reports);
        if (statsRes.success) setStats(statsRes.stats);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Initial load failed', err);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshReports = async () => {
    try {
      const [repRes, statsRes] = await Promise.all([
        api.getReports(),
        api.getStats()
      ]);
      if (repRes.success) setReports(repRes.reports);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle Login
  const handleLogin = async (username: string, pass: string) => {
    return await api.login(username, pass);
  };

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
    await refreshReports();
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.logout();
      authStorage.clearToken();
      setCurrentUser(null);
      setIsLogoutModalOpen(false);
      setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
      authStorage.clearToken();
      setCurrentUser(null);
      setIsLogoutModalOpen(false);
      setActiveTab('dashboard');
    }
  };

  // If initial authentication check is loading
  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-md animate-pulse">
          <img
            src="/logo_tanggamus.jpg"
            alt="Logo Tanggamus"
            className="w-full h-full object-contain"
          />
        </div>
        <p className="text-xs font-semibold text-slate-500 tracking-wider">Memuat Sistem SIGAP-OPT...</p>
      </div>
    );
  }

  // Must login first to access all menus
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const waitingVerificationCount = reports.filter(r => r.status === 'Menunggu Verifikasi').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => {}}
        onOpenLogoutConfirm={() => setIsLogoutModalOpen(true)}
        waitingCount={waitingVerificationCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardStats
            stats={stats}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenNewReport={() => setIsNewReportModalOpen(true)}
            onSelectReport={(report) => setSelectedReport(report)}
            currentUser={currentUser}
            spreadsheetSyncedCount={reports.filter(r => r.syncedToSheets).length}
            onRefreshData={refreshReports}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsList
            reports={reports}
            currentUser={currentUser}
            onOpenNewReport={() => setIsNewReportModalOpen(true)}
            onSelectReport={(report) => setSelectedReport(report)}
            onRefreshReports={refreshReports}
            isLoading={isLoading}
            onNavigateToPrint={() => setActiveTab('print')}
          />
        )}

        {activeTab === 'fonnte' && (
          <FonnteBotHub
            currentUser={currentUser}
            onNewReportCreated={refreshReports}
          />
        )}

        {activeTab === 'sheets' && (
          <SpreadsheetSyncView
            reports={reports}
            currentUser={currentUser}
            onRefreshReports={refreshReports}
          />
        )}

        {activeTab === 'print' && (
          <MonthlyPrintReportView
            reports={reports}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'users' && (
          currentUser?.role === 'admin' ? (
            <AdminUserManagement
              currentUser={currentUser}
              onRefreshUsers={refreshReports}
            />
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md mx-auto space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center font-bold text-xl">
                🔒
              </div>
              <h2 className="text-lg font-bold text-slate-900">Akses Dibatasi</h2>
              <p className="text-xs text-slate-500">
                Menu Manajemen User hanya dapat diakses oleh akun dengan Role <strong>Administrator</strong>.
              </p>
            </div>
          )
        )}

        {activeTab === 'guide' && <OPTKnowledgeBase />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2.5">
            <img
              src="/logo_tanggamus.jpg"
              alt="Logo Tanggamus"
              className="w-5 h-5 object-contain"
            />
            <span className="font-bold text-emerald-900 text-xs tracking-tight">SIGAP-OPT</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Terhubung WhatsApp Fonnte</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1 text-teal-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>Google Spreadsheets Auto-Sync</span>
            </span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Prominent Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        currentUser={currentUser}
      />

      {/* 2. Form Pengaduan Baru */}
      <NewReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        onReportCreated={() => {
          refreshReports();
        }}
      />

      {/* 3. Detail Laporan & Verifikasi Petugas */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        currentUser={currentUser}
        onReportUpdated={() => {
          refreshReports();
        }}
      />
    </div>
  );
}
