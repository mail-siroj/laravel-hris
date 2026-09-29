import React from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  Users,
  Building2,
  Briefcase,
  Clock,
  CalendarDays,
  Timer,
  Wallet,
  Award,
  Megaphone,
  FileSpreadsheet,
  Code2,
  Database,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { UserRole } from '../../types/hris';
import { ROLES } from '../../data/mockData';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentRole: UserRole;
  pendingLeavesCount: number;
  pendingOvertimesCount: number;
  unreadAnnouncementsCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onOpenLaravelHub: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  isAction?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  pendingLeavesCount,
  pendingOvertimesCount,
  unreadAnnouncementsCount,
  isOpen,
  onOpenLaravelHub,
}) => {
  const roleInfo = ROLES[currentRole];

  const menuSections: MenuSection[] = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        {
          id: 'shifts',
          label: 'Jadwal & Shift Roster',
          icon: CalendarClock,
          badge: 'Roster',
          badgeColor: 'bg-indigo-500/20 text-indigo-400',
        },
        {
          id: 'attendance',
          label: 'Presensi & Geofence',
          icon: Clock,
          badge: 'GPS',
          badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
      ],
    },
    {
      title: 'MANAJEMEN SDM',
      items: [
        { id: 'employees', label: 'Data Karyawan', icon: Users },
        { id: 'departments', label: 'Departemen', icon: Building2 },
        { id: 'positions', label: 'Jabatan & Karir', icon: Briefcase },
        {
          id: 'leaves',
          label: 'Manajemen Cuti',
          icon: CalendarDays,
          badge: pendingLeavesCount > 0 ? String(pendingLeavesCount) : undefined,
          badgeColor: 'bg-amber-500 text-white',
        },
        {
          id: 'overtime',
          label: 'Lembur (Overtime)',
          icon: Timer,
          badge: pendingOvertimesCount > 0 ? String(pendingOvertimesCount) : undefined,
          badgeColor: 'bg-indigo-500 text-white',
        },
      ],
    },
    {
      title: 'KEUANGAN & KINERJA',
      items: [
        { id: 'payroll', label: 'Payroll & Slip Gaji', icon: Wallet },
        { id: 'performance', label: 'Penilaian Kinerja (KPI)', icon: Award },
        {
          id: 'announcements',
          label: 'Pengumuman',
          icon: Megaphone,
          badge: unreadAnnouncementsCount > 0 ? String(unreadAnnouncementsCount) : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { id: 'reports', label: 'Pusat Laporan & Ekspor', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'ARSITEKTUR & DEVOPS',
      items: [
        {
          id: 'laravel_hub',
          label: 'Laravel 12 & ERD Hub',
          icon: Code2,
          isAction: true,
          badge: 'Filament v4',
          badgeColor: 'bg-indigo-600 text-white',
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-200 bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
            N
          </div>
          {isOpen && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm tracking-tight text-white truncate">
                NEXA-HRIS
              </span>
              <span className="text-[11px] text-slate-400 font-mono tracking-tight truncate">
                Enterprise Suite
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Role Pill Banner */}
      {isOpen && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Hak Akses Aktif
              </span>
              <span className="text-xs font-semibold text-white truncate">
                {roleInfo.name}
              </span>
            </div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-indigo-500/20 text-indigo-300">
            {roleInfo.badge}
          </span>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {isOpen && (
              <div className="px-2 text-[10px] font-semibold text-slate-500 tracking-wider">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.isAction) {
                        onOpenLaravelHub();
                      } else {
                        onSelectTab(item.id);
                      }
                    }}
                    title={!isOpen ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {isOpen && <span className="truncate">{item.label}</span>}
                    </div>

                    {isOpen && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Laravel 12 Architecture Quick CTA */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <button
          onClick={onOpenLaravelHub}
          className="w-full flex items-center gap-2 p-2 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-800/40 text-left transition-colors group"
        >
          <Database className="w-4 h-4 text-indigo-400 shrink-0" />
          {isOpen && (
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-indigo-200 truncate">
                Laravel 12 & ERD Hub
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                20 Deliverables Source
              </div>
            </div>
          )}
          {isOpen && <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />}
        </button>
      </div>
    </aside>
  );
};
