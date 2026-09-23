import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Smartphone, 
  Settings, 
  Bot, 
  ArrowDownRight, 
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  Shield
} from 'lucide-react';
import { FonnteConfig, FonnteLog, User } from '../types/index.ts';
import { api } from '../services/api.ts';

interface FonnteBotHubProps {
  currentUser: User | null;
  onNewReportCreated?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

export const FonnteBotHub: React.FC<FonnteBotHubProps> = ({ currentUser, onNewReportCreated }) => {
  const [config, setConfig] = useState<FonnteConfig | null>(null);
  const [logs, setLogs] = useState<FonnteLog[]>([]);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configFeedback, setConfigFeedback] = useState('');

  // Simulator State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: `🌾 *SELAMAT DATANG DI SIGAP-OPT BOT* 🌾\n_Sistem Tanggap & Pengaduan Organisme Pengganggu Tanaman_\n\nHalo Petani Sukabumi! Ketik *MENU* untuk melihat format pengaduan cepat atau ketik *STATUS#KODE_TIKET* untuk melacak tindak lanjut.`,
      time: '12:00'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [simPhone, setSimPhone] = useState('081298765432');
  const [simName, setSimName] = useState('Supardi (Petani)');
  const [isSimulating, setIsSimulating] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const [confRes, logsRes] = await Promise.all([
        api.getFonnteConfig(),
        api.getFonnteLogs()
      ]);
      if (confRes.success) setConfig(confRes.config);
      if (logsRes.success) setLogs(logsRes.logs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() || isSimulating) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: now
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMsg('');
    setIsSimulating(true);

    try {
      const res = await api.simulateFonnteChat(textToSend, simPhone, simName);
      if (res.success) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages((prev) => [...prev, botMsg]);
        loadData();
        if (textToSend.toUpperCase().startsWith('LAPOR') && onNewReportCreated) {
          onNewReportCreated();
        }
      }
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setIsSavingConfig(true);
    setConfigFeedback('');

    try {
      const res = await api.updateFonnteConfig(config);
      if (res.success) {
        setConfigFeedback('Konfigurasi token Fonnte berhasil disimpan!');
        setTimeout(() => setConfigFeedback(''), 3000);
      }
    } catch {
      setConfigFeedback('Gagal menyimpan konfigurasi');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const fullWebhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/fonnte` : '/api/webhook/fonnte';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(fullWebhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>Integrasi Chatbot WhatsApp Fonnte Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Pusat Kendali Chatbot & Webhook WhatsApp
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
              Petani dan kelompok tani dapat melaporkan serangan hama langsung dari WhatsApp mereka. Sistem otomatis mencatat ke database pengaduan dan sinkron ke spreadsheet pemantauan.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Webhook Endpoint Aktif</span>
            </span>
          </div>
        </div>
      </div>

      {/* Webhook Endpoint Card */}
      <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>URL Webhook Fonnte untuk Aplikasi Anda</span>
            </h2>
            <p className="text-xs text-slate-500">
              Salin URL ini dan tempelkan ke kolom <strong>Webhook URL</strong> di dashboard Fonnte Anda (<a href="https://md.fonnte.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">md.fonnte.com</a>).
            </p>
          </div>

          <button
            onClick={handleCopyWebhook}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition active:scale-95 flex-shrink-0"
          >
            {copiedWebhook ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-600" />}
            <span>{copiedWebhook ? 'Tersalin ke Clipboard!' : 'Salin URL Webhook'}</span>
          </button>
        </div>

        <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto flex items-center justify-between">
          <span>{fullWebhookUrl}</span>
          <span className="text-[10px] text-slate-400 uppercase font-sans font-bold bg-slate-800 px-2 py-0.5 rounded ml-2">
            POST JSON
          </span>
        </div>
      </div>

      {/* Main 2-column: Left Simulator, Right Config & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Live Interactive WhatsApp Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Phone Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-inner">
                🌾
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">SIGAP-OPT Bot WhatsApp</h3>
                <p className="text-[11px] text-emerald-200 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>online &bull; Fonnte Auto-Gateway</span>
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-[10px] text-emerald-200 block">Simulasi Pengirim:</span>
              <span className="font-bold font-mono">{simPhone}</span>
            </div>
          </div>

          {/* Quick Template Prompts */}
          <div className="p-2.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-emerald-800 font-bold whitespace-nowrap px-1">Klik Tes:</span>
            <button
              onClick={() => handleSendMessage('MENU')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold whitespace-nowrap shadow-2xs"
            >
              MENU
            </button>
            <button
              onClick={() => handleSendMessage('LAPOR#Pak Supardi#Cimanuk Hilir#Cimanuk#Padi Sawah#Wereng Batang Coklat#2.5#Berat')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold whitespace-nowrap shadow-2xs"
            >
              LAPOR Wereng (Padi)
            </button>
            <button
              onClick={() => handleSendMessage('LAPOR#Karyono#Sukaraja Girang#Sukaraja#Jagung Hibrida#Ulat Grayak FAW#1.2#Sedang')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold whitespace-nowrap shadow-2xs"
            >
              LAPOR Ulat FAW (Jagung)
            </button>
            <button
              onClick={() => handleSendMessage('STATUS#OPT-2026-001')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold whitespace-nowrap shadow-2xs"
            >
              STATUS#OPT-2026-001
            </button>
            <button
              onClick={() => handleSendMessage('PANDUAN')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-semibold whitespace-nowrap shadow-2xs"
            >
              PANDUAN
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#E5DDD5]/50 bg-repeat">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 shadow-xs text-xs sm:text-[13px] leading-relaxed relative ${
                    msg.sender === 'user'
                      ? 'bg-[#DCF8C6] text-slate-900 rounded-tr-none'
                      : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/60'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className="block text-[10px] text-slate-400 text-right mt-1 font-mono">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            {isSimulating && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-xs text-xs text-slate-400 italic flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-200"></div>
                  <span>SIGAP-OPT Bot sedang membalas...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-[#F0F2F5] border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ketik pesan WhatsApp (contoh: LAPOR#Nama#Desa#Hama#Luas atau MENU)..."
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isSimulating || !inputMsg.trim()}
                className="w-10 h-10 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white flex items-center justify-center shadow-md transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Config & Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Fonnte API Configuration Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Settings className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Konfigurasi Token Fonnte</h3>
            </div>

            {configFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                {configFeedback}
              </div>
            )}

            {config && (
              <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fonnte API Token (Device Token)
                  </label>
                  <input
                    type="password"
                    value={config.apiToken}
                    onChange={(e) => setConfig({ ...config, apiToken: e.target.value })}
                    placeholder="Masukkan token dari md.fonnte.com..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Jika dikosongkan, bot otomatis berjalan dalam mode simulator offline.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Label Nomor Pengirim Bot
                  </label>
                  <input
                    type="text"
                    value={config.senderNumber}
                    onChange={(e) => setConfig({ ...config, senderNumber: e.target.value })}
                    placeholder="0812-3456-7890 (SIGAP-OPT Bot)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoReplyEnabled}
                      onChange={(e) => setConfig({ ...config, autoReplyEnabled: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700 font-medium">
                      Aktifkan Auto-Reply Chatbot
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoNotificationOnUpdate}
                      onChange={(e) => setConfig({ ...config, autoNotificationOnUpdate: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-700 font-medium">
                      Kirim WA Otomatis Saat Status Laporan Diperbarui
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="w-full mt-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
                >
                  {isSavingConfig ? 'Menyimpan...' : 'Simpan Konfigurasi Fonnte'}
                </button>
              </form>
            )}
          </div>

          {/* Live Message Logs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-sm text-slate-900">Riwayat Pesan WhatsApp</h3>
              </div>
              <button
                onClick={loadData}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">Belum ada aktivitas chat WhatsApp.</p>
              ) : (
                logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center space-x-1 font-bold">
                        {log.direction === 'incoming' ? (
                          <span className="text-blue-600 flex items-center space-x-0.5">
                            <ArrowDownRight className="w-3 h-3" />
                            <span>Pesan Masuk ({log.phone})</span>
                          </span>
                        ) : (
                          <span className="text-emerald-600 flex items-center space-x-0.5">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Pesan Keluar</span>
                          </span>
                        )}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 font-mono text-[11px] line-clamp-2">{log.message}</p>
                    {log.reportCode && (
                      <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {log.reportCode}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
