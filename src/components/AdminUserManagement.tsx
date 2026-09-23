import React, { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Search, Shield, MapPin, Phone, Mail, Trash2, Edit, CheckCircle, AlertCircle, RefreshCw, Key, ShieldAlert } from 'lucide-react';
import { User, UserRole } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AdminUserManagementProps {
  currentUser: User | null;
  onRefreshUsers?: () => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    username: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    region: string;
    password: string;
    status: 'active' | 'inactive';
  }>({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: 'petugas_popt',
    region: '',
    password: '',
    status: 'active'
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormData({
      username: '',
      name: '',
      email: '',
      phone: '',
      role: 'petugas_popt',
      region: '',
      password: '',
      status: 'active'
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      region: user.region,
      password: '',
      status: user.status
    });
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name || !formData.username) {
      setFormError('Nama lengkap dan username wajib diisi.');
      return;
    }

    if (!editingUserId && !formData.password) {
      setFormError('Password wajib diisi untuk user baru.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUserId) {
        // Update user
        const res = await api.updateUser(editingUserId, formData);
        if (res.success) {
          setFormSuccess('Data user berhasil diperbarui');
          await loadUsers();
          setTimeout(() => setIsModalOpen(false), 900);
        } else {
          setFormError(res.message || 'Gagal memperbarui user');
        }
      } else {
        // Create user
        const res = await api.createUser(formData);
        if (res.success) {
          setFormSuccess(res.message || 'User baru berhasil ditambahkan');
          await loadUsers();
          setTimeout(() => setIsModalOpen(false), 900);
        } else {
          setFormError(res.message || 'Gagal menambahkan user');
        }
      }
    } catch {
      setFormError('Koneksi ke server terputus.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
      return;
    }

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus user "${user.name}" (${user.username}) dari sistem?`
    );
    if (!confirmed) return;

    try {
      const res = await api.deleteUser(user.id);
      if (res.success) {
        loadUsers();
      } else {
        alert(res.message || 'Gagal menghapus user');
      }
    } catch {
      alert('Gagal menghubungi server');
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id) {
      alert('Anda tidak dapat menonaktifkan akun sendiri.');
      return;
    }
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateUser(user.id, { status: newStatus });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchQuery;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const poptCount = users.filter((u) => u.role === 'petugas_popt').length;
  const pplCount = users.filter((u) => u.role === 'pengamat').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Halaman Khusus Administrator SIGAP-OPT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Manajemen User & Hak Akses Petugas
            </h1>
            <p className="text-purple-200/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Kelola akun administrator dinas, petugas lapangan POPT (Pengendali OPT), dan penyuluh pertanian (PPL) yang bertugas memverifikasi laporan pengaduan masyarakat.
            </p>
          </div>

          {/* Button Tambah User */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 transition-all active:scale-95"
            >
              <UserPlus className="w-5 h-5" />
              <span>+ Tambah User Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Akun Terdaftar</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{users.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
            👥
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-purple-700 font-medium">Administrator Dinas</p>
            <p className="text-2xl font-extrabold text-purple-900 mt-1">{adminCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-700 font-medium">Petugas POPT Lapangan</p>
            <p className="text-2xl font-extrabold text-emerald-900 mt-1">{poptCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-700 font-medium">Penyuluh / Pengamat (PPL)</p>
            <p className="text-2xl font-extrabold text-blue-900 mt-1">{pplCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
            🌾
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, username, wilayah..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Semua Role</option>
            <option value="admin">Administrator Dinas</option>
            <option value="petugas_popt">Petugas POPT Lapangan</option>
            <option value="pengamat">Pengamat / Penyuluh (PPL)</option>
          </select>

          <button
            onClick={loadUsers}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
            title="Refresh Data User"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* User Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Pengguna / Nama</th>
                <th className="py-3.5 px-4">Role & Hak Akses</th>
                <th className="py-3.5 px-4">Wilayah Kerja</th>
                <th className="py-3.5 px-4">Kontak (Email / WA)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data user yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                              : user.role === 'petugas_popt'
                              ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                              : 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                          }`}
                        >
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{user.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">@{user.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {user.role === 'admin' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          <Shield className="w-3 h-3 text-purple-600" />
                          <span>Administrator</span>
                        </span>
                      )}
                      {user.role === 'petugas_popt' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <UserCheck className="w-3 h-3 text-emerald-600" />
                          <span>Petugas POPT Lapangan</span>
                        </span>
                      )}
                      {user.role === 'pengamat' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <span>🌾 Penyuluh / Pengamat</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="line-clamp-1">{user.region || 'Seluruh Wilayah'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      {user.phone && (
                        <div className="flex items-center space-x-1.5 text-slate-600 text-xs">
                          <Phone className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {user.email && (
                        <div className="flex items-center space-x-1.5 text-slate-500 text-xs">
                          <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{user.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border transition ${
                          user.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Klik untuk mengubah status aktif/nonaktif"
                      >
                        {user.status === 'active' ? '● Aktif' : '○ Nonaktif'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Guide Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-purple-50/60 border border-purple-200 p-4 rounded-xl text-xs space-y-1.5">
          <div className="flex items-center space-x-2 font-bold text-purple-900">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Hak Akses: Administrator</span>
          </div>
          <p className="text-purple-800">
            Dapat menambah, mengedit, dan menghapus user, mengonfigurasi Token Chatbot Fonnte, mengatur integrasi Google Spreadsheets, dan rekapitulasi data kabupaten.
          </p>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl text-xs space-y-1.5">
          <div className="flex items-center space-x-2 font-bold text-emerald-900">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Hak Akses: Petugas POPT</span>
          </div>
          <p className="text-emerald-800">
            Dapat memverifikasi laporan pengaduan, menentukan tingkat serangan, input rekomendasi pengendalian PHT, jadwal Gerdal massal, dan notifikasi WhatsApp ke petani.
          </p>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl text-xs space-y-1.5">
          <div className="flex items-center space-x-2 font-bold text-blue-900">
            <span>🌾</span>
            <span>Hak Akses: Penyuluh (PPL)</span>
          </div>
          <p className="text-blue-800">
            Membantu kelompok tani memasukkan pengaduan cepat OPT di wilayah binaan BPP dan memantau status tindak lanjut petugas di lapangan secara berkala.
          </p>
        </div>
      </div>

      {/* MODAL: Form Tambah User / Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-left relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingUserId ? 'Edit Akun Pengguna' : 'Tambah User Baru (Admin)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lengkapi data petugas untuk diberikan akses sistem SIGAP-OPT
                  </p>
                </div>
              </div>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingUserId)}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. suparman_popt"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Role Pengguna <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="petugas_popt">Petugas POPT Lapangan</option>
                    <option value="pengamat">Pengamat / Penyuluh (PPL)</option>
                    <option value="admin">Administrator Sistem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Suparman Hadi, S.P., M.P."
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 081234567890"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Untuk notifikasi otomatis via Fonnte</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Kedinasan
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. suparman@pertanian.go.id"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wilayah Kerja BPP / Kecamatan
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g. Kec. Cikembar & Kec. Cicurug"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {editingUserId ? 'Ganti Password (kosongkan jika tidak ingin mengubah)' : 'Password Akun *'}
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUserId ? 'Ketik password baru...' : '••••••••'}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {editingUserId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Akun
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 transition flex items-center space-x-1.5 disabled:opacity-70"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : editingUserId ? 'Simpan Perubahan' : 'Simpan User Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
