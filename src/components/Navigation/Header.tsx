import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  Shield,
  Check,
  Code2,
  Building,
  UserCheck,
} from 'lucide-react';
import { UserRole, AppNotification, Employee } from '../../types/hris';
import { ROLES, OFFICE_COORDINATES } from '../../data/mockData';

interface HeaderProps {
  currentTab: string;
  onToggleSidebar: () => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onOpenLaravelHub: () => void;
  onOpenSearch: () => void;
  currentEmployee: Employee;
  allEmployees: Employee[];
  onSelectEmployeeAsCurrent: (emp: Employee) => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Ringkasan operasional dan analitik SDM' },
  employees: { title: 'Master Karyawan', subtitle: 'Database profil, kontrak, dan data kepegawaian' },
  departments: { title: 'Struktur Departemen', subtitle: 'Divisi operasional dan alokasi anggaran' },
  positions: { title: 'Master Jabatan', subtitle: 'Level karir, tanggung jawab, dan standar gaji' },
  shifts: { title: 'Jadwal & Shift Roster', subtitle: 'Pola shift berulang Pagi, Siang, Malam, dan validasi jam kerja' },
  attendance: { title: 'Presensi & Geofence GPS', subtitle: 'Pencatatan jam kerja terverifikasi lokasi dan shift' },
  leaves: { title: 'Manajemen Cuti', subtitle: 'Alur persetujuan cuti berjenjang Manager & HR' },
  overtime: { title: 'Klaim Lembur (Overtime)', subtitle: 'Pencatatan dan kalkulasi kompensasi lembur' },
  payroll: { title: 'Payroll & Slip Gaji', subtitle: 'Perhitungan gaji bulanan, BPJS, PPh21, dan cetak slip' },
  performance: { title: 'Penilaian Kinerja (KPI)', subtitle: 'Evaluasi kompetensi terstruktur dan tren nilai' },
  announcements: { title: 'Papan Pengumuman', subtitle: 'Informasi dan edaran resmi korporat' },
  reports: { title: 'Pusat Laporan & Ekspor', subtitle: 'Unduh laporan komprehensif format Excel dan PDF' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onToggleSidebar,
  currentRole,
  onRoleChange,
  notifications,
  onMarkNotificationRead,
  onOpenLaravelHub,
  onOpenSearch,
  currentEmployee,
  allEmployees,
  onSelectEmployeeAsCurrent,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentTabMeta = TAB_TITLES[currentTab] || {
    title: 'Sistem HRIS',
    subtitle: 'Manajemen SDM Terpadu',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between transition-colors">
      {/* Left: Hamburger & Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle menu navigasi"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>NEXA-HRIS</span>
            <span>/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {currentTabMeta.title}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden md:inline truncate">
            {currentTabMeta.subtitle}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Cari Karyawan / NIK...</span>
          <kbd className="hidden lg:inline text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-500 font-mono">
            Ctrl+K
          </kbd>
        </button>

        {/* Office Status Badge */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300">
          <Building className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="truncate max-w-[140px]">{OFFICE_COORDINATES.name}</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Laravel 12 Source Code Deliverables Hub Button */}
        <button
          onClick={onOpenLaravelHub}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Laravel 12 Specs</span>
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline font-semibold">{ROLES[currentRole].name}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  Simulasi Role & Otorisasi
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ganti role untuk menguji perizinan Spatie & alur persetujuan.
                </p>
              </div>

              {Object.values(ROLES).map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    onRoleChange(role.id);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2.5 transition-colors ${
                    currentRole === role.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="mt-0.5">
                    {currentRole === role.id ? (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span>{role.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {role.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {role.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            aria-label="Notifikasi sistem"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                  Notifikasi Sistem ({unreadCount})
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer">
                  Tandai semua dibaca
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => onMarkNotificationRead(n.id)}
                    className={`px-3 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors ${
                      !n.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current User Avatar & Profile Switch */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={currentEmployee.photo}
              alt={currentEmployee.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {currentEmployee.name.split(',')[0]}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {currentEmployee.employeeId}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentEmployee.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentEmployee.email}
                </p>
                <div className="mt-1 text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                  {currentEmployee.positionName} · {currentEmployee.departmentName}
                </div>
              </div>

              <div className="p-2">
                <p className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Beralih Karyawan Aktif:
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {allEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        onSelectEmployeeAsCurrent(emp);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs text-left transition-colors ${
                        currentEmployee.id === emp.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          src={emp.photo}
                          alt={emp.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="truncate">{emp.name}</span>
                      </div>
                      {currentEmployee.id === emp.id && (
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
