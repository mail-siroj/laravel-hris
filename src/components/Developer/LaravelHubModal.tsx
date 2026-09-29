import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Database,
  FileCode,
  FolderTree,
  Shield,
  Layers,
  Terminal,
  Server,
  BookOpen,
  Boxes,
} from 'lucide-react';
import { LARAVEL_PROJECT_TREE, LARAVEL_CODE_FILES, CodeFile } from '../../data/laravelCodebase';
import { ERD_TABLES, MERMAID_ERD } from '../../data/erdData';

interface LaravelHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaravelHubModal: React.FC<LaravelHubModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'files' | 'tree' | 'erd' | 'api' | 'devops' | 'testing' | 'security'
  >('files');
  const [selectedFileId, setSelectedFileId] = useState<string>(LARAVEL_CODE_FILES[0].id);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const selectedFile =
    LARAVEL_CODE_FILES.find((f) => f.id === selectedFileId) || LARAVEL_CODE_FILES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = LARAVEL_CODE_FILES.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.path.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-slate-950 text-slate-100 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden">
        {/* Top Header */}
        <div className="h-16 px-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Laravel 12 & Filament v4 Architecture Hub
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  PHP 8.4 Production Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                20 Arsitektural Deliverables: Clean Architecture, SOLID, Spatie Permissions, Migrations, ERD & DevOps
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Tutup ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-6 py-2 border-b border-slate-800 bg-slate-950 flex items-center gap-2 overflow-x-auto text-xs font-medium shrink-0">
          {[
            { id: 'files', label: 'Kode Sumber (Source Files)', icon: FileCode },
            { id: 'tree', label: 'Struktur Folder (Clean Arch)', icon: FolderTree },
            { id: 'erd', label: 'ERD & Database Schema', icon: Database },
            { id: 'api', label: 'API Specs & Endpoints', icon: Layers },
            { id: 'devops', label: 'DevOps & Docker Deployment', icon: Server },
            { id: 'testing', label: 'Testing Strategy (Pest/PHPUnit)', icon: Terminal },
            { id: 'security', label: 'Security & Hardening Best Practices', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* TAB 1: Source Files Explorer */}
          {activeTab === 'files' && (
            <div className="flex-1 flex overflow-hidden">
              {/* File List Sidebar */}
              <div className="w-72 border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0">
                <div className="p-3 border-b border-slate-800">
                  <input
                    type="text"
                    placeholder="Cari file PHP / migration..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFileId(file.id)}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex flex-col ${
                        selectedFileId === file.id
                          ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <span className="truncate font-mono">{file.name}</span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        {file.category} · {file.path}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Viewer */}
              <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between shrink-0">
                  <div className="min-w-0">
                    <span className="font-mono text-xs font-bold text-white truncate block">
                      {selectedFile.path}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {selectedFile.description}
                    </span>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed">
                  <pre className="whitespace-pre">
                    <code>{selectedFile.content}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Project Tree Structure */}
          {activeTab === 'tree' && (
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div className="max-w-3xl space-y-2">
                <h3 className="text-base font-bold text-white">
                  Struktur Direktori Laravel 12 Enterprise (Clean Architecture)
                </h3>
                <p className="text-xs text-slate-400">
                  Pola arsitektur Service Layer, Repository Pattern, Form Request Validation, Spatie Policy RBAC,
                  dan Filament v4 Resource modules.
                </p>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                  <pre>{LARAVEL_PROJECT_TREE}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ERD & Database Schema */}
          {activeTab === 'erd' && (
            <div className="flex-1 overflow-auto p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">
                  Entity Relationship Diagram (ERD) & Database Relasional
                </h3>
                <p className="text-xs text-slate-400">
                  Desain skema MySQL 8.4 InnoDB dengan foreign key constraints, UTF8MB4 charset, dan indexing optimal.
                </p>
              </div>

              {/* ERD Tables Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ERD_TABLES.map((table) => (
                  <div
                    key={table.name}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-indigo-400" />
                        <span className="font-mono font-bold text-sm text-white">
                          {table.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {table.columns.length} Kolom
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">{table.description}</p>

                    <div className="space-y-1 font-mono text-xs">
                      {table.columns.map((col) => (
                        <div
                          key={col.name}
                          className="flex items-center justify-between py-0.5 border-b border-slate-800/40 text-[11px]"
                        >
                          <div className="flex items-center gap-1.5">
                            {col.key && (
                              <span
                                className={`text-[9px] font-bold px-1 rounded ${
                                  col.key === 'PK'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : col.key === 'FK'
                                    ? 'bg-indigo-500/20 text-indigo-300'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {col.key}
                              </span>
                            )}
                            <span className="text-slate-200">{col.name}</span>
                          </div>
                          <span className="text-slate-500 text-[10px]">{col.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: API Endpoints & Swagger */}
          {activeTab === 'api' && (
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <h3 className="text-base font-bold text-white">
                RESTful API Endpoints (Laravel Sanctum Auth)
              </h3>
              <p className="text-xs text-slate-400">
                Dokumentasi endpoint siap diintegrasikan dengan aplikasi mobile iOS/Android atau frontend terpisah.
              </p>

              <div className="space-y-3 max-w-4xl text-xs font-mono">
                {[
                  {
                    method: 'POST',
                    url: '/api/v1/attendance/clock-in',
                    desc: 'Check-in absensi dengan koordinat lat/lng dan snapshot selfie.',
                    auth: 'Sanctum Bearer',
                  },
                  {
                    method: 'POST',
                    url: '/api/v1/attendance/clock-out',
                    desc: 'Check-out kepulangan jam kerja.',
                    auth: 'Sanctum Bearer',
                  },
                  {
                    method: 'GET',
                    url: '/api/v1/leaves',
                    desc: 'Melihat riwayat cuti karyawan atau bawahan (sesuai role).',
                    auth: 'Sanctum Bearer',
                  },
                  {
                    method: 'POST',
                    url: '/api/v1/leaves',
                    desc: 'Mengajukan permohonan cuti baru.',
                    auth: 'Sanctum Bearer',
                  },
                  {
                    method: 'PATCH',
                    url: '/api/v1/leaves/{id}/manager-approval',
                    desc: 'Approval tingkat 1 oleh Manager divisi.',
                    auth: 'Role: manager | super_admin',
                  },
                  {
                    method: 'PATCH',
                    url: '/api/v1/leaves/{id}/hr-approval',
                    desc: 'Approval tingkat 2 oleh HR Director.',
                    auth: 'Role: hr_manager | super_admin',
                  },
                  {
                    method: 'GET',
                    url: '/api/v1/payroll/my-slips',
                    desc: 'Mengambil daftar slip gaji karyawan terotentikasi.',
                    auth: 'Sanctum Bearer',
                  },
                  {
                    method: 'GET',
                    url: '/api/v1/payroll/{id}/download-pdf',
                    desc: 'Download berkas PDF slip gaji resmi.',
                    auth: 'Sanctum Bearer',
                  },
                ].map((ep, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ep.method === 'GET'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : ep.method === 'POST'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="text-white font-bold">{ep.url}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-400 font-sans">{ep.desc}</div>
                      <span className="text-[10px] text-slate-500">{ep.auth}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DevOps & Deployment */}
          {activeTab === 'devops' && (
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <h3 className="text-base font-bold text-white">
                Panduan Deployment Production (PHP 8.4 + Docker)
              </h3>
              <p className="text-xs text-slate-400">
                Konfigurasi Docker multi-stage, Supervisor queue workers, Redis cache, Nginx reverse proxy, dan cron scheduler.
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <p className="text-emerald-400 font-bold"># 1. Build & Run Docker Containers</p>
                <p className="bg-slate-950 p-2 rounded">docker compose up -d --build</p>

                <p className="text-emerald-400 font-bold mt-3"># 2. Database Migration & Seed</p>
                <p className="bg-slate-950 p-2 rounded">
                  docker compose exec app php artisan migrate --seed
                </p>

                <p className="text-emerald-400 font-bold mt-3"># 3. Optimize Caching for Production</p>
                <p className="bg-slate-950 p-2 rounded">
                  docker compose exec app php artisan config:cache && php artisan route:cache && php artisan view:cache
                </p>

                <p className="text-emerald-400 font-bold mt-3"># 4. Start Horizon & Queue Worker</p>
                <p className="bg-slate-950 p-2 rounded">
                  docker compose exec app php artisan queue:work redis --tries=3
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: Testing Strategy */}
          {activeTab === 'testing' && (
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <h3 className="text-base font-bold text-white">
                Testing Strategy (Pest v3 & PHPUnit)
              </h3>
              <p className="text-xs text-slate-400">
                Pengujian otomatis formula penggajian Indonesia, kalkulasi pajak PPh 21 TER, serta alur approval cuti.
              </p>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <p className="text-indigo-400 font-bold">// Feature Test: Payroll Formula Validation</p>
                <p className="bg-slate-950 p-3 rounded leading-relaxed">
                  {`test('calculates correct bpjs and overtime pay for employee', function () {
    $employee = Employee::factory()->create(['base_salary' => 16500000]);
    $service = app(PayrollCalculationService::class);
    $payroll = $service->generateForEmployee($employee, 9, 2026);

    expect($payroll->bpjs_kesehatan)->toEqual(165000)
        ->and($payroll->net_salary)->toBeGreaterThan(0);
});`}
                </p>
              </div>
            </div>
          )}

          {/* TAB 7: Security Best Practices */}
          {activeTab === 'security' && (
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <h3 className="text-base font-bold text-white">
                Praktik Terbaik Keamanan & Audit Trail (Security Hardening)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-indigo-400">1. Enkripsi Data Sensitif (At Rest)</h4>
                  <p className="text-slate-400">
                    Nomor Induk Kependudukan (NIK), nomor rekening bank, dan besaran gaji dienkripsi menggunakan
                    AES-256-CBC via Laravel Model Encryption (Casts: <code>'encrypted'</code>).
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-indigo-400">2. Role-Based Access Control (RBAC)</h4>
                  <p className="text-slate-400">
                    Otorisasi ketat via Spatie Permission & Laravel Policies. Endpoint hanya dapat dieksekusi oleh user
                    dengan role dan permission terverifikasi.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-indigo-400">3. Validasi Geofence & Anti-Spoofing</h4>
                  <p className="text-slate-400">
                    Validasi radius jarak Haversine di server-side sebelum menyimpan data presensi. Validasi MIME type
                    dan ukuran berkas selfie via Intervention Image.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <h4 className="font-bold text-indigo-400">4. Audit Logs & Rate Limiting</h4>
                  <p className="text-slate-400">
                    Setiap perubahan gaji pokok atau persetujuan cuti dicatat pada tabel audit log. Rate limiting 60 req/min
                    pada endpoint presensi mencegah double punch.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
