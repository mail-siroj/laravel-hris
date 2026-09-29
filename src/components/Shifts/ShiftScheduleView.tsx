import React, { useState } from 'react';
import {
  CalendarClock,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Briefcase,
  Coffee,
  Check,
  Info,
  Filter,
  AlertOctagon,
  ShieldAlert,
  Wrench,
  Search,
  CheckCheck,
} from 'lucide-react';
import {
  Shift,
  ShiftPattern,
  EmployeeShiftSchedule,
  Employee,
  Department,
  UserRole,
  ShiftAuditReport,
  ShiftConflictItem,
} from '../../types/hris';
import {
  auditShiftSchedules,
  checkProspectiveShiftConflict,
} from '../../utils/shiftConflictAuditor';

interface ShiftScheduleViewProps {
  shifts: Shift[];
  patterns: ShiftPattern[];
  schedules: EmployeeShiftSchedule[];
  employees: Employee[];
  departments: Department[];
  currentRole: UserRole;
  auditReport: ShiftAuditReport;
  onRunFullAudit: () => ShiftAuditReport;
  onAddShift: (shift: Shift) => void;
  onUpdateShift: (shift: Shift) => void;
  onAddShiftPattern: (pattern: ShiftPattern) => void;
  onUpdateShiftPattern: (pattern: ShiftPattern) => void;
  onDeleteShiftPattern: (patternId: string) => void;
  onApplyRecurringPattern: (
    employeeIds: string[],
    patternId: string,
    startDate: string,
    days: number
  ) => void;
  onUpdateScheduleCell: (
    employeeId: string,
    date: string,
    shiftId: string
  ) => void;
}

export const ShiftScheduleView: React.FC<ShiftScheduleViewProps> = ({
  shifts,
  patterns,
  schedules,
  employees,
  departments,
  currentRole,
  auditReport,
  onRunFullAudit,
  onAddShift,
  onUpdateShift,
  onAddShiftPattern,
  onUpdateShiftPattern,
  onDeleteShiftPattern,
  onApplyRecurringPattern,
  onUpdateScheduleCell,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'master' | 'patterns' | 'audit'>('roster');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [conflictOnlyFilter, setConflictOnlyFilter] = useState(false);

  // Date range for Roster view (7 days window)
  const today = new Date();
  const [startDateOffset, setStartDateOffset] = useState<number>(-2);

  // Apply Pattern Modal State
  const [showApplyPatternModal, setShowApplyPatternModal] = useState(false);
  const [selectedPatternId, setSelectedPatternId] = useState(patterns[0]?.id || '');
  const [targetDeptId, setTargetDeptId] = useState('all');
  const [patternStartDate, setPatternStartDate] = useState(today.toISOString().split('T')[0]);
  const [patternDays, setPatternDays] = useState(14);

  // Create / Edit Shift Pattern Modal State
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState<ShiftPattern | null>(null);
  const [patternFormName, setPatternFormName] = useState('');
  const [patternFormDesc, setPatternFormDesc] = useState('');
  const [patternFormCycleDays, setPatternFormCycleDays] = useState<number>(7);
  const [patternFormDays, setPatternFormDays] = useState<
    { dayIndex: number; shiftId: string; shiftLabel: string }[]
  >([]);

  // Shift Master Modal State
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftFormCode, setShiftFormCode] = useState('');
  const [shiftFormName, setShiftFormName] = useState('');
  const [shiftFormStartTime, setShiftFormStartTime] = useState('08:00');
  const [shiftFormEndTime, setShiftFormEndTime] = useState('16:00');
  const [shiftFormEarlyMins, setShiftFormEarlyMins] = useState(60);
  const [shiftFormLateMins, setShiftFormLateMins] = useState(15);
  const [shiftFormDesc, setShiftFormDesc] = useState('');
  const [shiftFormIsNight, setShiftFormIsNight] = useState(false);

  // Quick Inline Schedule Cell Popover State
  const [activeCellPop, setActiveCellPop] = useState<{
    empId: string;
    date: string;
    empName: string;
    currentShiftId: string;
  } | null>(null);

  // Conflict Warning Confirmation Dialog State (when updating a cell that causes a conflict)
  const [pendingConflictConfirmation, setPendingConflictConfirmation] = useState<{
    empId: string;
    date: string;
    empName: string;
    shiftId: string;
    shiftName: string;
    conflict: ShiftConflictItem;
  } | null>(null);

  // Conflict Audit Modal Drawer State
  const [showConflictAuditModal, setShowConflictAuditModal] = useState(false);

  const canManage = currentRole === 'super_admin' || currentRole === 'hr_manager' || currentRole === 'manager';

  // Compute 7 days for the roster matrix
  const daysList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + startDateOffset + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
    const dayFullName = new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(d);
    const dayNumber = d.getDate();
    const isToday = dateStr === today.toISOString().split('T')[0];
    return { dateStr, dayName, dayFullName, dayNumber, isToday };
  });

  // Check if a specific cell has an active conflict from the current audit report
  const getCellConflict = (empId: string, date: string): ShiftConflictItem | undefined => {
    return auditReport.conflicts.find(
      (c) => c.employeeId === empId && (c.date === date || c.conflictingDate === date)
    );
  };

  const filteredEmployees = employees.filter((e) => {
    const matchDept = selectedDept === 'all' || e.departmentId === selectedDept;
    if (!conflictOnlyFilter) return matchDept;
    const hasConflict = auditReport.affectedEmployeeIds.includes(e.id);
    return matchDept && hasConflict;
  });

  // Helper for shift badge colors and icons
  const getShiftBadge = (shiftCode: string, hasConflict = false) => {
    if (hasConflict) {
      return 'bg-rose-100 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-600 ring-2 ring-rose-500/40 animate-pulse';
    }
    switch (shiftCode) {
      case 'PAGI':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'SIANG':
        return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'MALAM':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'OFF':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
  };

  const getShiftIcon = (code: string) => {
    switch (code) {
      case 'PAGI':
        return <Sun className="w-3 h-3 text-amber-500 inline mr-1" />;
      case 'SIANG':
        return <Sunset className="w-3 h-3 text-blue-500 inline mr-1" />;
      case 'MALAM':
        return <Moon className="w-3 h-3 text-purple-400 inline mr-1" />;
      case 'OFF':
        return <Coffee className="w-3 h-3 text-slate-400 inline mr-1" />;
      default:
        return <Briefcase className="w-3 h-3 text-emerald-500 inline mr-1" />;
    }
  };

  // Open modal to create a new recurring pattern
  const handleOpenCreatePattern = () => {
    setEditingPattern(null);
    setPatternFormName('');
    setPatternFormDesc('');
    setPatternFormCycleDays(7);
    const defaultDays = [
      { dayIndex: 0, shiftId: 'shift-pagi', shiftLabel: 'Hari 1: Pagi (07:00)' },
      { dayIndex: 1, shiftId: 'shift-pagi', shiftLabel: 'Hari 2: Pagi (07:00)' },
      { dayIndex: 2, shiftId: 'shift-siang', shiftLabel: 'Hari 3: Siang (15:00)' },
      { dayIndex: 3, shiftId: 'shift-siang', shiftLabel: 'Hari 4: Siang (15:00)' },
      { dayIndex: 4, shiftId: 'shift-malam', shiftLabel: 'Hari 5: Malam (23:00)' },
      { dayIndex: 5, shiftId: 'shift-malam', shiftLabel: 'Hari 6: Malam (23:00)' },
      { dayIndex: 6, shiftId: 'OFF', shiftLabel: 'Hari 7: Libur (OFF)' },
    ];
    setPatternFormDays(defaultDays);
    setShowPatternModal(true);
  };

  // Open modal to edit existing pattern
  const handleOpenEditPattern = (pat: ShiftPattern) => {
    setEditingPattern(pat);
    setPatternFormName(pat.name);
    setPatternFormDesc(pat.description);
    setPatternFormCycleDays(pat.cycleDays);
    setPatternFormDays(
      pat.patternSchedule.map((p, idx) => ({
        dayIndex: p.dayIndex,
        shiftId: p.shiftId,
        shiftLabel: p.shiftLabel || `Hari ke-${idx + 1}`,
      }))
    );
    setShowPatternModal(true);
  };

  const handleCycleDaysChange = (newCount: number) => {
    const validCount = Math.max(1, Math.min(28, newCount));
    setPatternFormCycleDays(validCount);

    const updated = Array.from({ length: validCount }, (_, i) => {
      if (patternFormDays[i]) {
        return patternFormDays[i];
      }
      return {
        dayIndex: i,
        shiftId: i === validCount - 1 ? 'OFF' : 'shift-pagi',
        shiftLabel: `Hari ke-${i + 1}`,
      };
    });
    setPatternFormDays(updated);
  };

  // Quick preset template loader
  const handleLoadPreset = (type: '3shift' | '4regu' | 'office' | 'night_guardian') => {
    if (type === '3shift') {
      setPatternFormName('Pola Rotasi 3-Shift Industri (2 Pagi - 2 Siang - 2 Malam - 1 Libur)');
      setPatternFormDesc('Standar rotasi 3-shift continuous operasi 24 jam dengan siklus mingguan aman.');
      setPatternFormCycleDays(7);
      setPatternFormDays([
        { dayIndex: 0, shiftId: 'shift-pagi', shiftLabel: 'Hari 1: Pagi (07:00)' },
        { dayIndex: 1, shiftId: 'shift-pagi', shiftLabel: 'Hari 2: Pagi (07:00)' },
        { dayIndex: 2, shiftId: 'shift-siang', shiftLabel: 'Hari 3: Siang (15:00)' },
        { dayIndex: 3, shiftId: 'shift-siang', shiftLabel: 'Hari 4: Siang (15:00)' },
        { dayIndex: 4, shiftId: 'shift-malam', shiftLabel: 'Hari 5: Malam (23:00)' },
        { dayIndex: 5, shiftId: 'shift-malam', shiftLabel: 'Hari 6: Malam (23:00)' },
        { dayIndex: 6, shiftId: 'OFF', shiftLabel: 'Hari 7: Libur (OFF)' },
      ]);
    } else if (type === '4regu') {
      setPatternFormName('Pola 4-Regu Rotasi Kontinu (2 Pagi - 2 Siang - 2 Malam - 2 Libur)');
      setPatternFormDesc('Pola rotasi siklus 8 hari populer untuk pabrik manufaktur dan data center 24/7.');
      setPatternFormCycleDays(8);
      setPatternFormDays([
        { dayIndex: 0, shiftId: 'shift-pagi', shiftLabel: 'Hari 1: Pagi (07:00)' },
        { dayIndex: 1, shiftId: 'shift-pagi', shiftLabel: 'Hari 2: Pagi (07:00)' },
        { dayIndex: 2, shiftId: 'shift-siang', shiftLabel: 'Hari 3: Siang (15:00)' },
        { dayIndex: 3, shiftId: 'shift-siang', shiftLabel: 'Hari 4: Siang (15:00)' },
        { dayIndex: 4, shiftId: 'shift-malam', shiftLabel: 'Hari 5: Malam (23:00)' },
        { dayIndex: 5, shiftId: 'shift-malam', shiftLabel: 'Hari 6: Malam (23:00)' },
        { dayIndex: 6, shiftId: 'OFF', shiftLabel: 'Hari 7: Libur (OFF)' },
        { dayIndex: 7, shiftId: 'OFF', shiftLabel: 'Hari 8: Libur (OFF)' },
      ]);
    } else if (type === 'office') {
      setPatternFormName('Pola Kantor Reguler (Senin - Jumat Kerja, Sabtu - Minggu Libur)');
      setPatternFormDesc('Jadwal kerja standar perbankan / kantor korporat 5 hari kerja 08:30 - 17:30.');
      setPatternFormCycleDays(7);
      setPatternFormDays([
        { dayIndex: 0, shiftId: 'shift-reguler', shiftLabel: 'Senin: Reguler' },
        { dayIndex: 1, shiftId: 'shift-reguler', shiftLabel: 'Selasa: Reguler' },
        { dayIndex: 2, shiftId: 'shift-reguler', shiftLabel: 'Rabu: Reguler' },
        { dayIndex: 3, shiftId: 'shift-reguler', shiftLabel: 'Kamis: Reguler' },
        { dayIndex: 4, shiftId: 'shift-reguler', shiftLabel: 'Jumat: Reguler' },
        { dayIndex: 5, shiftId: 'OFF', shiftLabel: 'Sabtu: Libur' },
        { dayIndex: 6, shiftId: 'OFF', shiftLabel: 'Minggu: Libur' },
      ]);
    } else if (type === 'night_guardian') {
      setPatternFormName('Pola Penjaga Malam & SOC (4 Malam - 3 Libur)');
      setPatternFormDesc('Khusus tim Cyber Security SOC & Teknisi Server shift malam berturut-turut.');
      setPatternFormCycleDays(7);
      setPatternFormDays([
        { dayIndex: 0, shiftId: 'shift-malam', shiftLabel: 'Hari 1: Malam (23:00)' },
        { dayIndex: 1, shiftId: 'shift-malam', shiftLabel: 'Hari 2: Malam (23:00)' },
        { dayIndex: 2, shiftId: 'shift-malam', shiftLabel: 'Hari 3: Malam (23:00)' },
        { dayIndex: 3, shiftId: 'shift-malam', shiftLabel: 'Hari 4: Malam (23:00)' },
        { dayIndex: 4, shiftId: 'OFF', shiftLabel: 'Hari 5: Libur (OFF)' },
        { dayIndex: 5, shiftId: 'OFF', shiftLabel: 'Hari 6: Libur (OFF)' },
        { dayIndex: 6, shiftId: 'OFF', shiftLabel: 'Hari 7: Libur (OFF)' },
      ]);
    }
  };

  // Submit recurring pattern form
  const handleSavePatternSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patternFormName.trim()) return;

    const patternPayload: ShiftPattern = {
      id: editingPattern?.id || `pat-${Date.now()}`,
      name: patternFormName,
      description: patternFormDesc,
      cycleDays: patternFormCycleDays,
      patternSchedule: patternFormDays.map((d, idx) => {
        const foundShift = shifts.find((s) => s.id === d.shiftId);
        return {
          dayIndex: idx,
          shiftId: d.shiftId,
          shiftLabel:
            d.shiftId === 'OFF'
              ? `Hari ke-${idx + 1}: Libur (OFF)`
              : foundShift
              ? `Hari ke-${idx + 1}: ${foundShift.name}`
              : `Hari ke-${idx + 1}`,
        };
      }),
    };

    if (editingPattern) {
      onUpdateShiftPattern(patternPayload);
    } else {
      onAddShiftPattern(patternPayload);
    }
    setShowPatternModal(false);
  };

  // Apply pattern submit
  const handleApplyPatternSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmps =
      targetDeptId === 'all'
        ? employees.map((e) => e.id)
        : employees.filter((e) => e.departmentId === targetDeptId).map((e) => e.id);

    onApplyRecurringPattern(targetEmps, selectedPatternId, patternStartDate, patternDays);
    setShowApplyPatternModal(false);
  };

  // Open modal for shift master
  const handleOpenAddShift = () => {
    setEditingShift(null);
    setShiftFormCode('EXTRA');
    setShiftFormName('Shift Khusus / Lembur');
    setShiftFormStartTime('18:00');
    setShiftFormEndTime('02:00');
    setShiftFormEarlyMins(60);
    setShiftFormLateMins(15);
    setShiftFormDesc('Shift khusus event atau operasional darurat');
    setShiftFormIsNight(true);
    setShowShiftModal(true);
  };

  const handleOpenEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setShiftFormCode(shift.code);
    setShiftFormName(shift.name);
    setShiftFormStartTime(shift.startTime);
    setShiftFormEndTime(shift.endTime);
    setShiftFormEarlyMins(shift.earlyCheckInToleranceMinutes);
    setShiftFormLateMins(shift.lateGraceMinutes);
    setShiftFormDesc(shift.description);
    setShiftFormIsNight(!!shift.isNightShift);
    setShowShiftModal(true);
  };

  const handleSaveShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shiftPayload: Shift = {
      id: editingShift?.id || `shift-${shiftFormCode.toLowerCase()}-${Date.now()}`,
      code: shiftFormCode.toUpperCase(),
      name: shiftFormName,
      startTime: shiftFormStartTime,
      endTime: shiftFormEndTime,
      earlyCheckInToleranceMinutes: Number(shiftFormEarlyMins),
      lateGraceMinutes: Number(shiftFormLateMins),
      color: editingShift?.color || (shiftFormIsNight ? 'purple' : 'indigo'),
      description: shiftFormDesc,
      isNightShift: shiftFormIsNight,
    };

    if (editingShift) {
      onUpdateShift(shiftPayload);
    } else {
      onAddShift(shiftPayload);
    }
    setShowShiftModal(false);
  };

  // Calculate daily staffing coverage summary for the 7 days
  const dailyCoverage = daysList.map((day) => {
    const daySchedules = schedules.filter((s) => s.date === day.dateStr);
    const pagiCount = daySchedules.filter((s) => s.shiftCode === 'PAGI').length;
    const siangCount = daySchedules.filter((s) => s.shiftCode === 'SIANG').length;
    const malamCount = daySchedules.filter((s) => s.shiftCode === 'MALAM').length;
    const regCount = daySchedules.filter((s) => s.shiftCode === 'REG').length;
    const offCount = daySchedules.filter((s) => s.isOffDay || s.shiftId === 'OFF').length;

    return {
      dateStr: day.dateStr,
      pagiCount,
      siangCount,
      malamCount,
      regCount,
      offCount,
      totalOnDuty: pagiCount + siangCount + malamCount + regCount,
    };
  });

  // Handling cell shift selection with CONFLICT INTERCEPTION
  const handleSelectShiftForCell = (shiftId: string) => {
    if (!activeCellPop) return;

    // Evaluate prospective conflict using the conflict auditor
    const conflict = checkProspectiveShiftConflict(
      activeCellPop.empId,
      activeCellPop.empName,
      activeCellPop.date,
      shiftId,
      schedules,
      shifts
    );

    if (conflict) {
      const selectedShiftObj = shifts.find((s) => s.id === shiftId);
      // Trigger confirmation modal warning before applying
      setPendingConflictConfirmation({
        empId: activeCellPop.empId,
        date: activeCellPop.date,
        empName: activeCellPop.empName,
        shiftId,
        shiftName: selectedShiftObj?.name || 'Shift Baru',
        conflict,
      });
      setActiveCellPop(null);
      return;
    }

    // No conflict: update directly (triggers automatic audit check across the entire array)
    onUpdateScheduleCell(activeCellPop.empId, activeCellPop.date, shiftId);
    setActiveCellPop(null);
  };

  // Force override confirmation when manager acknowledges the warning
  const handleConfirmConflictOverride = () => {
    if (!pendingConflictConfirmation) return;
    onUpdateScheduleCell(
      pendingConflictConfirmation.empId,
      pendingConflictConfirmation.date,
      pendingConflictConfirmation.shiftId
    );
    setPendingConflictConfirmation(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Shift Scheduling & Integration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              MODUL ROSTER & SISTEM SHIFT TERPADU
            </span>
            <span className="text-xs text-slate-500">Pola Berulang: Pagi · Siang · Malam · Reguler</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Penjadwalan Shift & Deteksi Konflik Pola Otomatis
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Sistem otomatis memindai seluruh jadwal penugasan kerja karyawan setiap kali terjadi perubahan jadwal untuk mendeteksi
            tumpang tindih (*overlap*), jeda istirahat kurang dari 8 jam, dan pola kerja berlebihan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Real-time Health Audit Pill */}
          <div
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-2 cursor-pointer transition-colors ${
              auditReport.hasConflicts
                ? 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-100'
                : 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            }`}
            onClick={() => setActiveSubTab('audit')}
            title="Klik untuk melihat laporan audit lengkap"
          >
            {auditReport.hasConflicts ? (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>{auditReport.totalConflicts} Konflik Terdeteksi ({auditReport.criticalCount} Kritis)</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Bebas Konflik ({auditReport.totalSchedulesScanned} Terverifikasi)</span>
              </>
            )}
          </div>

          {canManage && (
            <>
              <button
                onClick={handleOpenCreatePattern}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Pola Baru</span>
              </button>

              <button
                onClick={() => setShowApplyPatternModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Terapkan Pola Shift Berulang</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Global Conflict Alert Banner */}
      {auditReport.hasConflicts && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Peringatan Sistem: {auditReport.summaryMessage}
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-300">
                  Update Terakhir: {auditReport.auditedAt}
                </span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                Pemeriksaan otomatis mendeteksi jadwal yang bertabrakan atau istirahat kurang dari 8 jam. Klik Audit untuk melihat detail dan opsi pemecahan cepat.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setConflictOnlyFilter(!conflictOnlyFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                conflictOnlyFilter
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:bg-rose-100'
              }`}
            >
              {conflictOnlyFilter ? 'Tampilkan Semua Karyawan' : 'Filter Karyawan Konflik Saja'}
            </button>

            <button
              onClick={() => setActiveSubTab('audit')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Lihat Laporan Audit ({auditReport.totalConflicts})</span>
            </button>
          </div>
        </div>
      )}

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'roster'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Matriks Roster Mingguan</span>
        </button>

        <button
          onClick={() => setActiveSubTab('patterns')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'patterns'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Pola Rotasi Berulang ({patterns.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('master')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'master'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Master Jam Shift ({shifts.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
            activeSubTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-xs'
              : auditReport.hasConflicts
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>
            Laporan Audit Konflik {auditReport.totalConflicts > 0 ? `(${auditReport.totalConflicts})` : ''}
          </span>
        </button>
      </div>

      {/* SUBTAB 1: Roster Matrix Calendar View */}
      {activeSubTab === 'roster' && (
        <div className="space-y-4">
          {/* Controls: Dept filter and date navigator */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-500" />
                Filter Divisi:
              </span>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="all">Semua Departemen ({employees.length} Karyawan)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {auditReport.hasConflicts && (
                <button
                  onClick={() => setConflictOnlyFilter(!conflictOnlyFilter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                    conflictOnlyFilter
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  ⚠️ Filter Konflik ({auditReport.affectedEmployeesCount} Staf)
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-mono text-[11px]">
                {daysList[0].dateStr} s/d {daysList[6].dateStr}
              </span>
              <button
                onClick={() => setStartDateOffset(startDateOffset - 7)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="7 Hari Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setStartDateOffset(-2)}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Hari Ini
              </button>
              <button
                onClick={() => setStartDateOffset(startDateOffset + 7)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="7 Hari Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Daily Shift Staffing Coverage Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2.5">
            {dailyCoverage.map((cov, idx) => {
              const day = daysList[idx];
              const isToday = day.isToday;
              return (
                <div
                  key={cov.dateStr}
                  className={`p-2.5 rounded-xl border text-xs transition-all ${
                    isToday
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800 mb-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {day.dayName}, {day.dayNumber}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-600 text-white">
                        HARI INI
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between items-center text-amber-700 dark:text-amber-400">
                      <span className="flex items-center gap-1">
                        <Sun className="w-2.5 h-2.5" /> Pagi:
                      </span>
                      <span className="font-mono font-bold">{cov.pagiCount} staf</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-700 dark:text-blue-400">
                      <span className="flex items-center gap-1">
                        <Sunset className="w-2.5 h-2.5" /> Siang:
                      </span>
                      <span className="font-mono font-bold">{cov.siangCount} staf</span>
                    </div>
                    <div className="flex justify-between items-center text-purple-700 dark:text-purple-400">
                      <span className="flex items-center gap-1">
                        <Moon className="w-2.5 h-2.5" /> Malam:
                      </span>
                      <span className="font-mono font-bold">{cov.malamCount} staf</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500 pt-0.5 border-t border-slate-100 dark:border-slate-800">
                      <span>Libur (OFF):</span>
                      <span className="font-mono">{cov.offCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Roster Table Matrix */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4 min-w-[200px]">Karyawan & Divisi</th>
                    {daysList.map((day) => (
                      <th
                        key={day.dateStr}
                        className={`py-3 px-2 min-w-[120px] text-center border-l border-slate-200 dark:border-slate-800 ${
                          day.isToday ? 'bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' : ''
                        }`}
                      >
                        <div className="font-bold">{day.dayFullName}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {day.dateStr}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <img
                            src={emp.photo}
                            alt={emp.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span>{emp.name}</span>
                              {auditReport.affectedEmployeeIds.includes(emp.id) && (
                                <span
                                  className="px-1 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 cursor-pointer"
                                  title="Karyawan ini memiliki konflik shift terdeteksi"
                                  onClick={() => setActiveSubTab('audit')}
                                >
                                  ⚠️ Konflik
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono font-normal">
                              {emp.employeeId} · {emp.departmentName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {daysList.map((day) => {
                        const sched = schedules.find(
                          (s) => s.employeeId === emp.id && s.date === day.dateStr
                        );
                        const isOff = sched?.isOffDay || sched?.shiftId === 'OFF';
                        const shiftCode = sched?.shiftCode || (isOff ? 'OFF' : 'REG');
                        const cellConflict = getCellConflict(emp.id, day.dateStr);

                        return (
                          <td
                            key={day.dateStr}
                            className={`py-2 px-1.5 text-center border-l border-slate-100 dark:border-slate-800/60 align-middle ${
                              day.isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                            } ${cellConflict ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}`}
                          >
                            <button
                              type="button"
                              disabled={!canManage}
                              onClick={() => {
                                if (canManage) {
                                  setActiveCellPop({
                                    empId: emp.id,
                                    date: day.dateStr,
                                    empName: emp.name,
                                    currentShiftId: sched?.shiftId || 'shift-reguler',
                                  });
                                }
                              }}
                              className={`w-full py-2 px-1.5 rounded-lg border transition-all text-center flex flex-col items-center justify-center gap-0.5 relative ${getShiftBadge(
                                shiftCode,
                                !!cellConflict
                              )} ${
                                canManage ? 'hover:scale-[1.03] hover:shadow-xs cursor-pointer' : 'cursor-default'
                              }`}
                              title={
                                cellConflict
                                  ? `PERINGATAN KONFLIK: ${cellConflict.message}`
                                  : canManage
                                  ? 'Klik untuk ganti shift'
                                  : `${sched?.shiftName || 'Reguler'}`
                              }
                            >
                              {cellConflict && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 text-white text-[8px] font-bold items-center justify-center">
                                    !
                                  </span>
                                </span>
                              )}

                              <div className="flex items-center justify-center font-bold text-[11px]">
                                {getShiftIcon(shiftCode)}
                                <span>{shiftCode}</span>
                              </div>
                              <div className="text-[9px] font-mono opacity-80">
                                {isOff ? 'LIBUR' : sched ? `${sched.startTime}` : '08:30'}
                              </div>

                              {cellConflict && (
                                <span className="text-[8px] font-bold text-rose-700 dark:text-rose-300 block leading-tight">
                                  {cellConflict.type === 'night_to_morning' ? 'Mlm ➔ Pagi' : 'Konflik'}
                                </span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Matrix Legend Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-slate-700 dark:text-slate-300">Legenda Shift:</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Sun className="w-3 h-3" /> PAGI (07:00 - 15:00)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  <Sunset className="w-3 h-3" /> SIANG (15:00 - 23:00)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                  <Moon className="w-3 h-3" /> MALAM (23:00 - 07:00)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Briefcase className="w-3 h-3" /> REGULER (08:30 - 17:30)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  <Coffee className="w-3 h-3" /> OFF (Libur)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-400 ring-1 ring-rose-400">
                  <AlertOctagon className="w-3 h-3 text-rose-600" /> ⚠️ KONFLIK SHIFT (24 Jam)
                </span>
              </div>

              {canManage && (
                <span className="text-[11px] text-slate-500 italic">
                  💡 Tips: Klik kotak jadwal pada tabel untuk mengubah shift per individu. Sistem otomatis memindai seluruh array jadwal.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Recurring Shift Patterns Library */}
      {activeSubTab === 'patterns' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Daftar Pola Rotasi Shift Berulang
              </h3>
              <p className="text-xs text-slate-500">
                Pola rotasi siklus berulang (misal 7 hari, 8 hari, 14 hari) yang dapat langsung diaplikasikan ke staf atau departemen.
              </p>
            </div>

            {canManage && (
              <button
                onClick={handleOpenCreatePattern}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Pola Baru</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {patterns.map((pat) => (
              <div
                key={pat.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      Siklus {pat.cycleDays} Hari
                    </span>

                    {canManage && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditPattern(pat)}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600"
                          title="Edit Pola"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus pola rotasi "${pat.name}"?`)) {
                              onDeleteShiftPattern(pat.id);
                            }
                          }}
                          className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600"
                          title="Hapus Pola"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {pat.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {pat.description}
                    </p>
                  </div>

                  {/* Day by Day Sequence Visual */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Urutan Rotasi ({pat.cycleDays} Hari):
                    </span>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {pat.patternSchedule.map((item, idx) => {
                        const shiftObj = shifts.find((s) => s.id === item.shiftId);
                        const isOff = item.shiftId === 'OFF';
                        const code = isOff ? 'OFF' : shiftObj?.code || 'REG';

                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px]"
                          >
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              {item.shiftLabel || `Hari ke-${idx + 1}`}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase border ${getShiftBadge(
                                code
                              )}`}
                            >
                              {code}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() => {
                      setSelectedPatternId(pat.id);
                      setShowApplyPatternModal(true);
                    }}
                    className="w-full py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Terapkan Pola Ini ke Karyawan</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: Master Jam Shift */}
      {activeSubTab === 'master' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Master Konfigurasi Jam Shift Kerja
              </h3>
              <p className="text-xs text-slate-500">
                Atur parameter jam masuk, jam pulang, toleransi check-in sebelum shift dibuka, dan grace period keterlambatan.
              </p>
            </div>

            {canManage && (
              <button
                onClick={handleOpenAddShift}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Jam Shift</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getShiftBadge(
                        shift.code
                      )}`}
                    >
                      {getShiftIcon(shift.code)}
                      <span>{shift.code}</span>
                    </span>

                    {canManage && (
                      <button
                        onClick={() => handleOpenEditShift(shift)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Parameter Shift"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {shift.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{shift.description}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jam Masuk:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {shift.startTime} WIB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Jam Pulang:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {shift.endTime} WIB
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                      <span className="text-slate-500">Buka Loket Check-In:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        -{shift.earlyCheckInToleranceMinutes} Menit
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Toleransi Terlambat:</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                        +{shift.lateGraceMinutes} Menit
                      </span>
                    </div>
                  </div>
                </div>

                {shift.isNightShift && (
                  <div className="text-[10px] text-purple-600 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 p-2 rounded-lg text-center">
                    🌙 Shift Lintas Hari (+1 Hari Operasional)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: Dedicated Full Shift Audit Report Tab */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pusat Audit & Laporan Deteksi Konflik Pola Shift
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Auto-Check Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pemeriksaan komprehensif seluruh array jadwal penugasan ({auditReport.totalSchedulesScanned} data) untuk kepatuhan jam istirahat dan anti-overlap.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onRunFullAudit()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Pindai Ulang Seluruh Jadwal</span>
              </button>
            </div>
          </div>

          {/* Audit Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Jadwal Terpindai
              </span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {auditReport.totalSchedulesScanned}
              </div>
              <span className="text-[11px] text-slate-500">Across all employees</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-rose-500 block tracking-wider">
                Konflik Kritis (Overlap / 0 Jam)
              </span>
              <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1">
                {auditReport.criticalCount}
              </div>
              <span className="text-[11px] text-slate-500">Perlu penanganan segera</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-amber-500 block tracking-wider">
                Peringatan Istirahat (&lt; 8 Jam)
              </span>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {auditReport.warningCount}
              </div>
              <span className="text-[11px] text-slate-500">Potensi fatigue / kelelahan</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-indigo-500 block tracking-wider">
                Karyawan Terdampak
              </span>
              <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                {auditReport.affectedEmployeesCount}
              </div>
              <span className="text-[11px] text-slate-500">Dari total {employees.length} staf</span>
            </div>
          </div>

          {/* Audit Results List */}
          {auditReport.conflicts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Seluruh Jadwal Memenuhi Standar & Bebas Konflik
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tidak ditemukan jadwal shift yang bertabrakan, jeda istirahat di bawah 8 jam, atau pola kerja berlebihan tanpa libur mingguan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Daftar Konflik Jadwal Aktif ({auditReport.conflicts.length}):
                </span>
                <span className="text-[11px] text-slate-400">
                  Gunakan tombol tindakan cepat untuk menyelesaikan konflik
                </span>
              </div>

              {auditReport.conflicts.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-4 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 shrink-0">
                        <AlertOctagon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {c.employeeName}
                          </span>
                          <span className="text-xs text-slate-400">({c.departmentName})</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.severity === 'critical'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {c.severity === 'critical' ? 'KRITIS' : 'PERINGATAN'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Rentang: {c.conflictingDate} ➔ {c.date}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Terdeteksi otomatis pukul {c.detectedAt}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-rose-800 dark:text-rose-300 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/60">
                    {c.message}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Rekomendasi Solusi: <strong>{c.recommendation}</strong></span>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            onUpdateScheduleCell(c.employeeId, c.date, 'OFF');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                        >
                          Ubah {c.date} jadi Libur (OFF)
                        </button>
                        <button
                          onClick={() => {
                            onUpdateScheduleCell(c.employeeId, c.date, 'shift-siang');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] transition-colors"
                        >
                          Pindahkan ke Shift Siang
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Create / Edit Recurring Shift Pattern */}
      {showPatternModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingPattern ? 'Edit Pola Shift Berulang' : 'Definisikan Pola Shift Berulang Baru'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tentukan siklus rotasi shift (Pagi, Siang, Malam, OFF) yang dapat diterapkan secara otomatis.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPatternModal(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Template Pola Cepat (Klik untuk Muat):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadPreset('3shift')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 text-left font-semibold text-[11px] transition-colors"
                >
                  3-Shift 7 Hari
                  <span className="block text-[9px] text-slate-400 font-normal">2 Pagi - 2 Siang - 2 Malam - 1 Off</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('4regu')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 text-left font-semibold text-[11px] transition-colors"
                >
                  4-Regu 8 Hari
                  <span className="block text-[9px] text-slate-400 font-normal">2 Pagi - 2 Siang - 2 Malam - 2 Off</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('office')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 text-left font-semibold text-[11px] transition-colors"
                >
                  Kantor Reguler
                  <span className="block text-[9px] text-slate-400 font-normal">5 Kerja - 2 Libur</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadPreset('night_guardian')}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 text-left font-semibold text-[11px] transition-colors"
                >
                  Shift Malam SOC
                  <span className="block text-[9px] text-slate-400 font-normal">4 Malam - 3 Libur</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSavePatternSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Nama Pola Rotasi Shift *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pola Rotasi 3-Shift 2-2-2-1"
                  value={patternFormName}
                  onChange={(e) => setPatternFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Deskripsi Pola
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan alur rotasi dan unit kerja yang menggunakannya..."
                  value={patternFormDesc}
                  onChange={(e) => setPatternFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Panjang Siklus Rotasi (Jumlah Hari) *
                  </label>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {patternFormCycleDays} Hari
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={14}
                  value={patternFormCycleDays}
                  onChange={(e) => handleCycleDaysChange(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>3 Hari</span>
                  <span>7 Hari (1 Mgg)</span>
                  <span>8 Hari (4 Regu)</span>
                  <span>14 Hari (2 Mgg)</span>
                </div>
              </div>

              {/* Day by Day Shift Assignment Selector */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Urutan Shift per Hari Siklus:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {patternFormDays.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                    >
                      <span className="font-semibold text-slate-700 dark:text-slate-200 min-w-[70px]">
                        Hari ke-{idx + 1}:
                      </span>
                      <select
                        value={item.shiftId}
                        onChange={(e) => {
                          const updated = [...patternFormDays];
                          updated[idx] = {
                            ...updated[idx],
                            shiftId: e.target.value,
                          };
                          setPatternFormDays(updated);
                        }}
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs flex-1"
                      >
                        <option value="shift-pagi">Shift Pagi (07:00 - 15:00)</option>
                        <option value="shift-siang">Shift Siang (15:00 - 23:00)</option>
                        <option value="shift-malam">Shift Malam (23:00 - 07:00)</option>
                        <option value="shift-reguler">Reguler Kantor (08:30 - 17:30)</option>
                        <option value="OFF">☕ Libur (OFF DAY)</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPatternModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  {editingPattern ? 'Simpan Perubahan' : 'Buat Pola Rotasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Apply Recurring Pattern to Employees */}
      {showApplyPatternModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Terapkan Pola Shift Berulang
              </h4>
              <button
                onClick={() => setShowApplyPatternModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyPatternSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Pilih Pola Shift *
                </label>
                <select
                  value={selectedPatternId}
                  onChange={(e) => setSelectedPatternId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {patterns.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.cycleDays} Hari Siklus)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Target Departemen / Karyawan *
                </label>
                <select
                  value={targetDeptId}
                  onChange={(e) => setTargetDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">Seluruh Karyawan ({employees.length} Orang)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      Departemen: {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Tanggal Mulai Berlaku
                  </label>
                  <input
                    type="date"
                    value={patternStartDate}
                    onChange={(e) => setPatternStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Durasi Penjadwalan
                  </label>
                  <select
                    value={patternDays}
                    onChange={(e) => setPatternDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value={7}>1 Minggu (7 Hari)</option>
                    <option value={14}>2 Minggu (14 Hari)</option>
                    <option value={30}>1 Bulan (30 Hari)</option>
                    <option value={60}>2 Bulan (60 Hari)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 text-[11px] leading-relaxed">
                ℹ️ Sistem otomatis memindai seluruh array jadwal karyawan dan memastikan pola yang diterapkan
                tidak memicu konflik istirahat dalam jendela 24 jam.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyPatternModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Terapkan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add / Edit Master Shift */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                {editingShift ? 'Edit Parameter Jam Shift' : 'Tambah Master Jam Shift Baru'}
              </h4>
              <button
                onClick={() => setShowShiftModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveShiftSubmit} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Kode Shift *
                  </label>
                  <input
                    type="text"
                    required
                    value={shiftFormCode}
                    onChange={(e) => setShiftFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                    placeholder="PAGI"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Nama Shift *
                  </label>
                  <input
                    type="text"
                    required
                    value={shiftFormName}
                    onChange={(e) => setShiftFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Shift Pagi Operasional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Jam Masuk (HH:mm) *
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftFormStartTime}
                    onChange={(e) => setShiftFormStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Jam Pulang (HH:mm) *
                  </label>
                  <input
                    type="time"
                    required
                    value={shiftFormEndTime}
                    onChange={(e) => setShiftFormEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Buka Check-In (Menit Sebelum)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={shiftFormEarlyMins}
                    onChange={(e) => setShiftFormEarlyMins(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Di luar menit ini, check-in ditandai Invalid.
                  </span>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Toleransi Terlambat (Menit)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={shiftFormLateMins}
                    onChange={(e) => setShiftFormLateMins(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Grace period sebelum status jadi Terlambat.
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Deskripsi Shift
                </label>
                <input
                  type="text"
                  value={shiftFormDesc}
                  onChange={(e) => setShiftFormDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Keterangan singkat jam kerja..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="nightShiftCheck"
                  checked={shiftFormIsNight}
                  onChange={(e) => setShiftFormIsNight(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="nightShiftCheck" className="text-slate-700 dark:text-slate-300 cursor-pointer">
                  Shift Malam Lintas Hari (Jam Pulang di Hari Berikutnya)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Quick Inline Schedule Cell Popover (Direct Shift Assignment with Conflict Live Preview) */}
      {activeCellPop && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-indigo-600" />
                  Ubah Shift Karyawan
                </h4>
                <p className="text-[11px] text-slate-500">
                  {activeCellPop.empName} · Tanggal: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeCellPop.date}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveCellPop(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Pilih Shift untuk Hari Ini (Sistem otomatis memindai konflik 24 jam):
              </span>
              <div className="space-y-1.5">
                {shifts.map((sh) => {
                  const prospectiveConflict = checkProspectiveShiftConflict(
                    activeCellPop.empId,
                    activeCellPop.empName,
                    activeCellPop.date,
                    sh.id,
                    schedules,
                    shifts
                  );
                  const isSelected = activeCellPop.currentShiftId === sh.id;

                  return (
                    <button
                      key={sh.id}
                      onClick={() => handleSelectShiftForCell(sh.id)}
                      className={`w-full p-2.5 rounded-xl border flex flex-col gap-1 transition-colors text-left ${
                        prospectiveConflict
                          ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 hover:bg-rose-100/70'
                          : isSelected
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {getShiftIcon(sh.code)}
                          <div>
                            <span className="font-semibold">{sh.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono ml-2">
                              {sh.startTime} - {sh.endTime} WIB
                            </span>
                          </div>
                        </div>
                        {isSelected && !prospectiveConflict && (
                          <Check className="w-4 h-4 text-indigo-600" />
                        )}
                        {prospectiveConflict && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Konflik 24 Jam
                          </span>
                        )}
                      </div>

                      {prospectiveConflict && (
                        <div className="text-[10px] text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-900/40 p-1.5 rounded-lg flex items-start gap-1">
                          <AlertOctagon className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{prospectiveConflict.message}</span>
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* Option for Libur (OFF) */}
                <button
                  onClick={() => handleSelectShiftForCell('OFF')}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                    activeCellPop.currentShiftId === 'OFF'
                      ? 'border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-slate-500" />
                    <div className="text-left">
                      <div className="font-semibold">Hari Libur (OFF DAY)</div>
                      <div className="text-[10px] text-slate-400">
                        Bebas tugas / Tidak ada konflik jadwal
                      </div>
                    </div>
                  </div>
                  {activeCellPop.currentShiftId === 'OFF' && (
                    <Check className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveCellPop(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Conflicting Shift Warning Confirmation (Intercepts Conflicting Updates) */}
      {pendingConflictConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-rose-100 dark:border-rose-900/60">
              <div className="p-2.5 rounded-xl bg-rose-600 text-white shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  Peringatan Konflik Shift Terdeteksi!
                </h4>
                <p className="text-[11px] text-slate-500">
                  {pendingConflictConfirmation.empName} · Tanggal {pendingConflictConfirmation.date}
                </p>
              </div>
            </div>

            {/* Comparison Details */}
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 space-y-2">
              <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5 text-xs">
                <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Rincian Pelanggaran Jadwal:</span>
              </div>
              <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed font-medium">
                {pendingConflictConfirmation.conflict.message}
              </p>

              <div className="mt-2 pt-2 border-t border-rose-200/70 dark:border-rose-900/70 grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900">
                  <span className="text-slate-400 block">Shift Sebelumnya:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {pendingConflictConfirmation.conflict.conflictingShiftName}
                  </span>
                  <span className="text-slate-500 block font-mono">
                    {pendingConflictConfirmation.conflict.conflictingDate}
                  </span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900">
                  <span className="text-slate-400 block">Shift Baru Dipilih:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {pendingConflictConfirmation.shiftName}
                  </span>
                  <span className="text-slate-500 block font-mono">
                    {pendingConflictConfirmation.date}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Kebijakan HR:</strong> Mempekerjakan karyawan dengan jeda istirahat kurang dari 8 jam berisiko terhadap keselamatan kerja, kelelahan (*burnout*), serta kepatuhan audit Depnaker.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPendingConflictConfirmation(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal / Pilih Shift Lain
              </button>
              <button
                type="button"
                onClick={handleConfirmConflictOverride}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Tetap Simpan (Override Manajer)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
