import { User, OPTReport, FonnteConfig, FonnteLog, SpreadsheetConfig, SyncLog, DashboardStats } from '../types/index.ts';

const TOKEN_KEY = 'sigap_opt_session_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem('sipopt_session_token'),
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem('sipopt_session_token');
  },
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('sipopt_session_token');
  },
};

const getHeaders = () => {
  const token = authStorage.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  async getMe(): Promise<{ authenticated: boolean; user?: User }> {
    try {
      const res = await fetch('/api/auth/me', { headers: getHeaders() });
      if (!res.ok) return { authenticated: false };
      return await res.json();
    } catch {
      return { authenticated: false };
    }
  },

  async login(username: string, password: string): Promise<{ success: boolean; message: string; user?: User; token?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      authStorage.setToken(data.token);
    }
    return data;
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: getHeaders() });
    } finally {
      authStorage.clearToken();
    }
    return { success: true, message: 'Logout berhasil' };
  },

  // Users (Admin feature: Tambah User, Edit, Hapus)
  async getUsers(): Promise<{ success: boolean; users: User[] }> {
    const res = await fetch('/api/users', { headers: getHeaders() });
    return await res.json();
  },

  async createUser(userData: {
    username: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    region: string;
    password: string;
  }): Promise<{ success: boolean; message: string; user?: User }> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  async updateUser(id: string, userData: Partial<User & { password?: string }>): Promise<{ success: boolean; message: string; user?: User }> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return await res.json();
  },

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  // Reports (Pengaduan OPT)
  async getReports(params?: {
    status?: string;
    commodity?: string;
    severity?: string;
    subdistrict?: string;
    search?: string;
  }): Promise<{ success: boolean; reports: OPTReport[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
    }
    const res = await fetch(`/api/reports?${query.toString()}`, { headers: getHeaders() });
    return await res.json();
  },

  async createReport(reportData: Partial<OPTReport>): Promise<{ success: boolean; message: string; report?: OPTReport }> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reportData)
    });
    return await res.json();
  },

  async updateReport(id: string, updateData: Partial<OPTReport>): Promise<{ success: boolean; message: string; report?: OPTReport }> {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData)
    });
    return await res.json();
  },

  async deleteReport(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return await res.json();
  },

  // Fonnte WhatsApp Chatbot
  async getFonnteConfig(): Promise<{ success: boolean; config: FonnteConfig }> {
    const res = await fetch('/api/fonnte/config', { headers: getHeaders() });
    return await res.json();
  },

  async updateFonnteConfig(config: Partial<FonnteConfig>): Promise<{ success: boolean; message: string; config?: FonnteConfig }> {
    const res = await fetch('/api/fonnte/config', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    return await res.json();
  },

  async getFonnteLogs(): Promise<{ success: boolean; logs: FonnteLog[] }> {
    const res = await fetch('/api/fonnte/logs', { headers: getHeaders() });
    return await res.json();
  },

  async simulateFonnteChat(message: string, senderPhone?: string, senderName?: string): Promise<{ success: boolean; reply: string; senderPhone: string }> {
    const res = await fetch('/api/fonnte/simulate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, senderPhone, senderName })
    });
    return await res.json();
  },

  // Spreadsheets
  async getSpreadsheetConfig(): Promise<{ success: boolean; config: SpreadsheetConfig }> {
    const res = await fetch('/api/sheets/config', { headers: getHeaders() });
    return await res.json();
  },

  async updateSpreadsheetConfig(config: Partial<SpreadsheetConfig>): Promise<{ success: boolean; message: string; config?: SpreadsheetConfig }> {
    const res = await fetch('/api/sheets/config', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
    return await res.json();
  },

  async syncSpreadsheetsNow(): Promise<{ success: boolean; message: string; lastSyncedAt: string; totalSynced: number }> {
    const res = await fetch('/api/sheets/sync', {
      method: 'POST',
      headers: getHeaders()
    });
    return await res.json();
  },

  async getSpreadsheetLogs(): Promise<{ success: boolean; logs: SyncLog[] }> {
    const res = await fetch('/api/sheets/logs', { headers: getHeaders() });
    return await res.json();
  },

  getExportCsvUrl(): string {
    return '/api/sheets/export-csv';
  },

  getExportExcelUrl(params?: { month?: string | number; year?: string | number; status?: string; commodity?: string; subdistrict?: string }): string {
    const q = new URLSearchParams();
    if (params?.month) q.append('month', String(params.month));
    if (params?.year) q.append('year', String(params.year));
    if (params?.status) q.append('status', params.status);
    if (params?.commodity) q.append('commodity', params.commodity);
    if (params?.subdistrict) q.append('subdistrict', params.subdistrict);
    const qs = q.toString();
    return `/api/reports/export-excel${qs ? `?${qs}` : ''}`;
  },

  // Stats
  async getStats(): Promise<{ success: boolean; stats: DashboardStats }> {
    const res = await fetch('/api/stats', { headers: getHeaders() });
    return await res.json();
  }
};
