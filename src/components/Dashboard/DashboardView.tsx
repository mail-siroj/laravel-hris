import React from 'react';
import {
  Users,
  UserCheck,
  CalendarOff,
  ClockAlert,
  Coins,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Building2,
  Megaphone,
  Code2,
} from 'lucide-react';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  OvertimeRequest,
  PayrollRecord,
  Announcement,
  UserRole,
} from '../../types/hris';
import { formatRupiah, formatDateIndo } from '../../utils/formatters';

interface DashboardViewProps {
  employees: Employee[];
  attendances: AttendanceRecord[];
  leaves: LeaveRequest[];
  overtimes: OvertimeRequest[];
  payrolls: PayrollRecord[];
  announcements: Announcement[];
  currentRole: UserRole;
  currentEmployee: Employee;
  onNavigateTab: (tab: string) => void;
  onApproveLeave: (leaveId: string, type: 'manager' | 'hr') => void;
  onRejectLeave: (leaveId: string) => void;
  onOpenLaravelHub: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  attendances,
  leaves,
  overtimes,
  payrolls,
  announcements,
  currentRole,
  currentEmployee,
  onNavigateTab,
  onApproveLeave,
  onRejectLeave,
  onOpenLaravelHub,
}) => {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status !== 'Magang').length;
  
  // Today's attendance stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter((a) => a.date === todayStr);
  const presentToday = todayAttendances.filter((a) => a.status === 'Hadir').length;
  const lateToday = todayAttendances.filter((a) => a.status === 'Terlambat').length;
  const leaveToday = todayAttendances.filter((a) => a.status === 'Izin' || a.status === 'Sakit').length;
  const alphaToday = Math.max(0, totalEmployees - (presentToday + lateToday + leaveToday));

  // Current month payroll sum
  const latestPayrollMonth = payrolls.filter((p) => p.month === 9 && p.year === 2026);
  const totalPayrollCost = latestPayrollMonth.reduce((acc, curr) => acc + curr.netSalary, 0);

  // Department Distribution
  const deptCountMap = employees.reduce<Record<string, number>>((acc, emp) => {
    acc[emp.departmentName] = (acc[emp.departmentName] || 0) + 1;
    return acc;
  }, {});

  // Pending items for current user's role
  const pendingLeavesForApproval = leaves.filter((l) => {
    if (currentRole === 'super_admin') return l.status === 'pending' || l.status === 'manager_approved';
    if (currentRole === 'hr_manager') return l.status === 'manager_approved';
    if (currentRole === 'manager') return l.status === 'pending';
    return false;
  });

  const myAttendanceToday = todayAttendances.find((a) => a.employeeId === currentEmployee.id);

  return (
    <div className="space-y-6">
      {/* Top Banner: Laravel 12 & Filament v4 Architecture Highlight */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 p-5 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                Arsitektur Enterprise
              </span>
              <span className="text-xs text-slate-300">
                Laravel 12 · PHP 8.4 · Filament v4 · Spatie RBAC · MySQL 8.4
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Sistem Informasi SDM Terintegrasi (NEXA-HRIS)
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl">
              Platform komprehensif untuk absensi geofence GPS, selfie verification, persetujuan cuti berjenjang,
              payroll terautomasi PPh 21 TER & BPJS, evaluasi kinerja 360, serta blueprint kode Laravel 12 siap produksi.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenLaravelHub}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md hover:shadow-indigo-500/20"
            >
              <Code2 className="w-4 h-4" />
              <span>Buka Source Code & ERD</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Karyawan */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Karyawan</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {totalEmployees}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-slate-500">
              <span>{activeEmployees} Karyawan Tetap & PKWT</span>
            </div>
          </div>
        </div>

        {/* Card 2: Karyawan Aktif */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Hadir Hari Ini</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
              {presentToday + lateToday}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-slate-500">
              <span>{Math.round(((presentToday + lateToday) / totalEmployees) * 100)}% Rasio Kehadiran</span>
            </div>
          </div>
        </div>

        {/* Card 3: Cuti & Izin Hari Ini */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cuti / Sakit</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <CalendarOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400">
              {leaveToday}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-slate-500">
              <span>1 Pengajuan Cuti Khusus</span>
            </div>
          </div>
        </div>

        {/* Card 4: Terlambat Hari Ini */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Terlambat</span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <ClockAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400">
              {lateToday}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-slate-500">
              <span>Masuk &gt; 08:30 WIB</span>
            </div>
          </div>
        </div>

        {/* Card 5: Payroll Bulan Ini */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Payroll Sep 2026</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold font-mono tracking-tight text-slate-900 dark:text-white truncate">
              {formatRupiah(totalPayrollCost)}
            </div>
            <div className="mt-1 flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span>100% Gaji Terbayar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Main Analytics & Pending Approvals) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide): Attendance Analytics & Department Distribution */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Attendance Recap Progress */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Rekapitulasi Kehadiran Hari Ini
                </h2>
                <p className="text-xs text-slate-500">
                  {formatDateIndo(todayStr)} · Jam Kerja Baku: 08:30 - 17:30 WIB
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('attendance')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Detail Absensi <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Attendance Stack Bar */}
            <div className="space-y-3">
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(presentToday / totalEmployees) * 100}%` }}
                  className="bg-emerald-500 h-full"
                  title={`Hadir Tepat Waktu: ${presentToday}`}
                />
                <div
                  style={{ width: `${(lateToday / totalEmployees) * 100}%` }}
                  className="bg-amber-500 h-full"
                  title={`Terlambat: ${lateToday}`}
                />
                <div
                  style={{ width: `${(leaveToday / totalEmployees) * 100}%` }}
                  className="bg-blue-500 h-full"
                  title={`Cuti / Izin: ${leaveToday}`}
                />
                <div
                  style={{ width: `${(alphaToday / totalEmployees) * 100}%` }}
                  className="bg-rose-500 h-full"
                  title={`Alpha / Belum Hadir: ${alphaToday}`}
                />
              </div>

              {/* Legend with tabular numbers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Tepat Waktu:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {presentToday}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Terlambat:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {lateToday}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Cuti / Sakit:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {leaveToday}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-slate-600 dark:text-slate-400">Alpha / Belum:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {alphaToday}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Department Headcount & Salary Allocation */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Distribusi Karyawan per Departemen
                </h2>
                <p className="text-xs text-slate-500">
                  Struktur headcount divisi di PT Nusantara Solusi Digital
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('departments')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Kelola Divisi <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(deptCountMap).map(([dept, count]) => {
                const percent = Math.round((count / totalEmployees) * 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {dept}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-slate-500">
                        <span>{count} Orang</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ({percent}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: User Clock-In Widget & Pending Approval Inbox */}
        <div className="space-y-6">
          {/* Quick Presensi Card for Current Logged In Employee */}
          <div className="bg-gradient-to-br from-indigo-900/90 to-slate-900 text-white rounded-xl p-5 border border-indigo-700/50 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider uppercase text-indigo-200">
                Presensi Mandiri Hari Ini
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                GPS Active
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <img
                src={currentEmployee.photo}
                alt={currentEmployee.name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-400"
              />
              <div className="min-w-0">
                <h3 className="text-sm font-bold truncate text-white">
                  {currentEmployee.name}
                </h3>
                <p className="text-xs text-indigo-200 truncate">
                  {currentEmployee.positionName}
                </p>
                <p className="text-[11px] font-mono text-slate-400">
                  {currentEmployee.employeeId}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Status Absen:</span>
                <span className="font-bold text-emerald-300">
                  {myAttendanceToday?.clockIn ? `Hadir (${myAttendanceToday.clockIn})` : 'Belum Check-In'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Verifikasi Lokasi:</span>
                <span className="text-xs font-mono text-indigo-200">
                  {myAttendanceToday?.officeVerified ? 'Kantor HQ Wisma HR' : 'Perlu Validasi'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('attendance')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Clock className="w-4 h-4" />
              <span>Buka Menu Check-In / Check-Out</span>
            </button>
          </div>

          {/* Pending Approval Inbox (Manager / HR only) */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Antrean Persetujuan
                </h2>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                {pendingLeavesForApproval.length} Menunggu
              </span>
            </div>

            {pendingLeavesForApproval.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-75" />
                <p className="font-medium text-slate-700 dark:text-slate-300">
                  Semua pengajuan telah diproses
                </p>
                <p className="text-[11px]">Tidak ada permohonan tertunda untuk role Anda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeavesForApproval.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {req.employeeName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {req.leaveType} · {req.totalDays} Hari
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-semibold uppercase">
                        {req.status === 'pending' ? 'Tingkat 1: Manager' : 'Tingkat 2: HR Final'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-2">
                      "{req.reason}"
                    </p>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                      <button
                        onClick={() =>
                          onApproveLeave(
                            req.id,
                            req.status === 'pending' ? 'manager' : 'hr'
                          )
                        }
                        className="flex-1 py-1.5 px-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Setujui</span>
                      </button>
                      <button
                        onClick={() => onRejectLeave(req.id)}
                        className="py-1.5 px-2.5 rounded bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold text-[11px] transition-colors"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Edaran & Pengumuman
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('announcements')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 2).map((ann) => (
                <div
                  key={ann.id}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white line-clamp-1">
                      {ann.title}
                    </span>
                    {ann.priority === 'urgent' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold uppercase shrink-0">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {ann.content}
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {ann.authorName} · {ann.publishDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
