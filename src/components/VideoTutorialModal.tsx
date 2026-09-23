import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft,
  X,
  FileSpreadsheet,
  Code2,
  Share2,
  Sparkles,
  HelpCircle,
  Eye
} from 'lucide-react';

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  appsScriptCode: string;
}

interface StepItem {
  id: number;
  title: string;
  subtitle: string;
  timestamp: string;
  durationSec: number;
  description: string;
  tips: string;
  screenTitle: string;
  screenAction: string;
  mockUI: 'create_sheet' | 'open_script' | 'paste_code' | 'deploy_modal' | 'copy_url' | 'connect_app';
}

const TUTORIAL_STEPS: StepItem[] = [
  {
    id: 1,
    title: '1. Buat Dokumen Google Sheets Baru',
    subtitle: 'Buka sheets.new di browser dan beri nama spreadsheet',
    timestamp: '00:00 - 00:25',
    durationSec: 15,
    description: 'Buka Google Sheets di browser Anda (atau ketik sheets.new). Beri nama dokumen misalnya "SIGAP-OPT Database Laporan 2026" dan buat tab sheet bernama "Laporan_Pengaduan_OPT".',
    tips: 'Pastikan Anda login dengan akun Google resmi Dinas/Unit Kerja agar file tersimpan aman.',
    screenTitle: 'Google Sheets &mdash; sheets.google.com',
    screenAction: 'Membuat spreadsheet baru & menentukan nama tab lembar kerja',
    mockUI: 'create_sheet'
  },
  {
    id: 2,
    title: '2. Buka Menu Extensions &gt; Apps Script',
    subtitle: 'Akses editor skrip otomatisasi bawaan Google',
    timestamp: '00:25 - 00:50',
    durationSec: 15,
    description: 'Pada menu bilah atas Google Sheets, klik menu "Extensions" (Ekstensi) lalu pilih "Apps Script". Jendela editor Apps Script akan terbuka pada tab baru browser Anda.',
    tips: 'Apps Script adalah platform serverless bawaan Google yang bertindak sebagai jembatan API penerima data.',
    screenTitle: 'Google Sheets &mdash; Menu Bar',
    screenAction: 'Mengklik Extensions &rarr; Apps Script',
    mockUI: 'open_script'
  },
  {
    id: 3,
    title: '3. Tempel Kode Skrip Penampung Data',
    subtitle: 'Salin skrip SIGAP-OPT dan tempel ke Kode.gs',
    timestamp: '00:50 - 01:25',
    durationSec: 20,
    description: 'Hapus fungsi bawaan "myFunction()" pada file Code.gs. Salin seluruh kode template integrasi SIGAP-OPT yang disediakan, lalu tempel (Paste) ke editor Apps Script dan klik ikon Simpan (Save).',
    tips: 'Skrip ini otomatis membuat header kolom rapi jika sheet masih kosong dan menambahkan baris baru setiap ada laporan.',
    screenTitle: 'Google Apps Script &mdash; Code.gs',
    screenAction: 'Menempelkan kode receiver doPost(e) & Klik Simpan (Ctrl+S)',
    mockUI: 'paste_code'
  },
  {
    id: 4,
    title: '4. Deploy sebagai Web App Publik',
    subtitle: 'Konfigurasi hak akses agar sistem SIGAP-OPT dapat mengirim data',
    timestamp: '01:25 - 02:05',
    durationSec: 20,
    description: 'Klik tombol biru "Deploy" di kanan atas &rarr; pilih "New deployment". Klik ikon roda gigi jenis deployment lalu pilih "Web App". Atur "Execute as: Me" dan yang terpenting setel "Who has access: Anyone".',
    tips: 'Wajib memilih "Anyone" (Siapa saja) agar server backend SIGAP-OPT dapat mengirimkan data tanpa popup login manual.',
    screenTitle: 'Deploy Dialog &mdash; Google Apps Script',
    screenAction: 'Memilih Jenis Web App, Execute as: Me, Who has access: Anyone',
    mockUI: 'deploy_modal'
  },
  {
    id: 5,
    title: '5. Salin Web App URL Hasil Deploy',
    subtitle: 'Dapatkan tautan Web App /exec yang dibuat Google',
    timestamp: '02:05 - 02:35',
    durationSec: 15,
    description: 'Setelah mengklik Deploy dan memberikan izin otorisasi (Authorize access), Google akan memberikan "Web app URL" dengan format https://script.google.com/macros/s/.../exec. Klik tombol "Copy".',
    tips: 'URL ini adalah gerbang webhook pribadi spreadsheet Anda.',
    screenTitle: 'New Deployment Result &mdash; Google Apps Script',
    screenAction: 'Menyalin Web App URL https://script.google.com/macros/s/.../exec',
    mockUI: 'copy_url'
  },
  {
    id: 6,
    title: '6. Tempel ke Pengaturan SIGAP-OPT & Uji Sinkron',
    subtitle: 'Simpan URL di SIGAP-OPT dan lakukan uji coba sinkronisasi',
    timestamp: '02:35 - 03:00',
    durationSec: 15,
    description: 'Kembali ke tab SIGAP-OPT &rarr; menu Spreadsheets &rarr; klik "Atur ID Google Sheet & Webhook". Tempel URL Web App ke kolom "Google Apps Script Webhook URL", lalu simpan dan klik tombol "Sinkronkan Sekarang".',
    tips: 'Selamat! Setiap kali petani atau petugas mengirim laporan via WhatsApp Fonnte atau Form Web, data langsung masuk ke Google Sheet secara realtime.',
    screenTitle: 'SIGAP-OPT &mdash; Menu Integrasi Spreadsheets',
    screenAction: 'Menyimpan Webhook URL & Menekan tombol "Sinkronkan Sekarang"',
    mockUI: 'connect_app'
  }
];

export const VideoTutorialModal: React.FC<VideoTutorialModalProps> = ({
  isOpen,
  onClose,
  appsScriptCode,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const step = TUTORIAL_STEPS[currentStepIndex];

  // Auto-play progress simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && isPlaying) {
      interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            // Next step or loop
            if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
              setCurrentStepIndex((idx) => idx + 1);
            } else {
              setCurrentStepIndex(0);
            }
            return 0;
          }
          return prev + (100 / (step.durationSec * 10));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, currentStepIndex, step.durationSec]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const selectStep = (index: number) => {
    setCurrentStepIndex(index);
    setPlaybackProgress(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 rounded-2xl sm:rounded-3xl max-w-5xl w-full border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 sm:px-7 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                  Video Tutorial Interaktif
                </span>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-slate-400 font-mono">3 Menit Lengkap</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Konfigurasi Integrasi Google Spreadsheets SIGAP-OPT
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyCode}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
              title="Salin Skrip Apps Script"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Tersalin!' : 'Salin Kode Skrip'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Tutup Tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player + Step Content Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-slate-200">
          {/* Main Visual Player Simulation Area (Left / Top) */}
          <div className="lg:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800">
            {/* Mock Screen Video Container */}
            <div className="relative aspect-video bg-slate-900 overflow-hidden flex flex-col border-b border-slate-800 select-none group">
              {/* Fake OS Window Titlebar */}
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 ml-2 hidden sm:inline" dangerouslySetInnerHTML={{ __html: step.screenTitle }}></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                    Langkah {step.id} dari {TUTORIAL_STEPS.length}
                  </span>
                </div>
              </div>

              {/* Dynamic Screen Simulator per Step */}
              <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center items-center bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
                {/* Visual Backdrop Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none"></div>

                {/* Simulated Screen Component */}
                {step.mockUI === 'create_sheet' && (
                  <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-4 text-slate-900 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center text-white">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">SIGAP-OPT Database Laporan 2026</p>
                          <p className="text-[10px] text-slate-400">File tersimpan di Google Drive</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Tab: Laporan_Pengaduan_OPT</span>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-1 text-[10px] font-mono text-center">
                      <div className="bg-emerald-50 text-emerald-900 font-bold p-1 rounded border border-emerald-200">No Tiket</div>
                      <div className="bg-emerald-50 text-emerald-900 font-bold p-1 rounded border border-emerald-200">Pelapor</div>
                      <div className="bg-emerald-50 text-emerald-900 font-bold p-1 rounded border border-emerald-200">Kecamatan</div>
                      <div className="bg-emerald-50 text-emerald-900 font-bold p-1 rounded border border-emerald-200">OPT & Luas</div>
                      <div className="p-1 bg-slate-50 text-slate-600 rounded">OPT-2026-001</div>
                      <div className="p-1 bg-slate-50 text-slate-600 rounded">Supardi</div>
                      <div className="p-1 bg-slate-50 text-slate-600 rounded">Kota Agung</div>
                      <div className="p-1 bg-slate-50 text-slate-600 rounded">Wereng (1.5 Ha)</div>
                    </div>
                  </div>
                )}

                {step.mockUI === 'open_script' && (
                  <div className="w-full max-w-lg bg-slate-800 rounded-xl shadow-2xl p-4 border border-slate-700 animate-in zoom-in-95 duration-300">
                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-700 flex items-center space-x-3 text-xs">
                      <span className="text-slate-400">File</span>
                      <span className="text-slate-400">Edit</span>
                      <span className="text-slate-400">View</span>
                      <span className="text-slate-400">Insert</span>
                      <span className="text-slate-400">Format</span>
                      <span className="text-slate-400">Data</span>
                      <span className="text-slate-400">Tools</span>
                      <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 animate-pulse">
                        Extensions &gt; Apps Script
                      </span>
                    </div>
                    <div className="mt-4 p-4 bg-slate-900/80 rounded-lg border border-slate-700 text-center">
                      <Code2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 animate-bounce" />
                      <p className="text-xs font-bold text-white">Membuka Editor Google Apps Script...</p>
                      <p className="text-[11px] text-slate-400 mt-1">Platform backend cloud serverless otomatis dari Google</p>
                    </div>
                  </div>
                )}

                {step.mockUI === 'paste_code' && (
                  <div className="w-full max-w-lg bg-slate-900 rounded-xl shadow-2xl p-4 border border-slate-700 text-left animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                      <span className="font-mono text-emerald-400 font-semibold flex items-center space-x-1.5">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Code.gs</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                        Ctrl + S (Saved)
                      </span>
                    </div>
                    <div className="mt-3 bg-slate-950 p-3 rounded-lg font-mono text-[11px] text-emerald-300/90 leading-relaxed overflow-hidden">
                      <p className="text-slate-500">// SIGAP-OPT Web App Handler</p>
                      <p className="text-purple-400">function <span className="text-amber-300">doPost</span>(e) &#123;</p>
                      <p className="pl-4 text-slate-300">var data = JSON.parse(e.postData.contents);</p>
                      <p className="pl-4 text-slate-300">sheet.appendRow([data.ticketCode, data.reporterName, ...]);</p>
                      <p className="pl-4 text-emerald-400 font-bold">return ContentService.createTextOutput(JSON.stringify(&#123;status: 'ok'&#125;));</p>
                      <p className="text-purple-400">&#125;</p>
                    </div>
                  </div>
                )}

                {step.mockUI === 'deploy_modal' && (
                  <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-5 border border-slate-700 text-left animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                      <p className="text-xs font-bold text-white">New deployment &mdash; Web App</p>
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold">Langkah Kunci</span>
                    </div>
                    <div className="mt-3 space-y-2.5 text-xs">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-700">
                        <p className="text-[10px] text-slate-400">Execute as (Jalankan sebagai):</p>
                        <p className="font-bold text-slate-200">Me (akun-email-dinas@gmail.com)</p>
                      </div>
                      <div className="p-2 bg-emerald-950/60 rounded-lg border border-emerald-500/50">
                        <p className="text-[10px] text-emerald-400 font-semibold">Who has access (Siapa yang memiliki akses):</p>
                        <p className="font-extrabold text-emerald-300 flex items-center space-x-1.5 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Anyone (Siapa saja)</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <span className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-md">
                        Klik Tombol Deploy
                      </span>
                    </div>
                  </div>
                )}

                {step.mockUI === 'copy_url' && (
                  <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-5 border border-slate-700 text-left animate-in zoom-in-95 duration-300">
                    <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Deployment Sukses Dibuat!</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mb-3">
                      Salin tautan Web App berikut untuk ditempelkan ke aplikasi SIGAP-OPT:
                    </p>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-700 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-teal-300 truncate max-w-[240px]">
                        https://script.google.com/macros/s/AKfycb.../exec
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded-lg shadow-sm flex items-center space-x-1">
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </span>
                    </div>
                  </div>
                )}

                {step.mockUI === 'connect_app' && (
                  <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 text-slate-900 text-left animate-in zoom-in-95 duration-300">
                    <p className="text-xs font-bold text-slate-900 mb-2">
                      Menu Spreadsheets &gt; Atur ID Google Sheet & Webhook
                    </p>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold">Google Apps Script Webhook URL:</span>
                        <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-lg font-mono text-[10px] text-emerald-900 truncate">
                          https://script.google.com/macros/s/.../exec
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm">
                        <Check className="w-3.5 h-3.5" />
                        <span>Sinkronkan Sekarang</span>
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Auto-Sync Aktif!</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Subtitle caption banner */}
                <div className="absolute bottom-3 left-4 right-4 bg-slate-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-center">
                  <p className="text-xs sm:text-sm font-semibold text-emerald-300">
                    &bull; {step.screenAction}
                  </p>
                </div>
              </div>

              {/* Video Timeline & Controls */}
              <div className="bg-slate-950 px-4 py-3 flex flex-col space-y-2">
                {/* Timeline Progress Bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden cursor-pointer" onClick={() => setPlaybackProgress(0)}>
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-100 ease-linear rounded-full"
                    style={{ width: `${playbackProgress}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition flex items-center space-x-1"
                      title={isPlaying ? 'Jeda Tutorial' : 'Putar Tutorial'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />}
                    </button>

                    <button
                      onClick={() => {
                        setPlaybackProgress(0);
                        setIsPlaying(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                      title="Ulangi Langkah Ini"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <span className="font-mono text-[11px] text-slate-400">
                      {step.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      disabled={currentStepIndex === 0}
                      onClick={() => selectStep(currentStepIndex - 1)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 flex items-center space-x-1 text-xs"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Sebelumnya</span>
                    </button>

                    <button
                      disabled={currentStepIndex === TUTORIAL_STEPS.length - 1}
                      onClick={() => selectStep(currentStepIndex + 1)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-white font-bold flex items-center space-x-1 text-xs"
                    >
                      <span>Lanjut</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step Explanation text container */}
            <div className="p-4 sm:p-6 bg-slate-900 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {step.subtitle}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
                  Step {step.id} / 6
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                {step.description}
              </p>

              <div className="mt-3.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-amber-200">Tips Penting: </strong>
                  <span>{step.tips}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Playlist & Code Snippet Sidebar */}
          <div className="lg:col-span-4 flex flex-col bg-slate-900/60 p-4 sm:p-5 overflow-y-auto space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Daftar Langkah Tutorial</span>
                <span className="text-[10px] text-emerald-400 font-mono">6 Langkah</span>
              </p>

              <div className="space-y-1.5">
                {TUTORIAL_STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => selectStep(idx)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center space-x-3 ${
                      currentStepIndex === idx
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-semibold'
                        : 'bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-400'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      currentStepIndex === idx ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {s.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-slate-200 font-medium">{s.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{s.durationSec} detik</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Box: Code Snippet */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col space-y-2 mt-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Kode Google Apps Script</span>
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline flex items-center space-x-1 cursor-pointer"
                >
                  {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Tempel kode ini pada menu <em>Extensions &gt; Apps Script</em> di dokumen spreadsheet Anda.
              </p>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 max-h-24 overflow-y-auto">
                <pre>{appsScriptCode.slice(0, 180)}...</pre>
              </div>
            </div>

            {/* External Docs Link */}
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition"
            >
              <span>Buka Google Sheets Baru (sheets.new)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
