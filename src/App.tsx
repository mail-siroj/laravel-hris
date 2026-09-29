import React, { useState } from 'react';
import { UserRole, Employee, Department, Position, AttendanceRecord, LeaveRequest, OvertimeRequest, PayrollRecord, PerformanceAppraisal, Announcement, AppNotification, Shift, ShiftPattern, EmployeeShiftSchedule, ShiftAuditReport } from './types/hris';
import {
  auditShiftSchedules,
  auditAndReportShiftConflicts,
  ShiftAssignmentUpdateContext,
} from './utils/shiftConflictAuditor';
import {
  INITIAL_EMPLOYEES,
  INITIAL_DEPARTMENTS,
  INITIAL_POSITIONS,
  INITIAL_SHIFTS,
  INITIAL_SHIFT_PATTERNS,
  INITIAL_SHIFT_SCHEDULES,
  INITIAL_ATTENDANCES,
  INITIAL_LEAVES,
  INITIAL_OVERTIMES,
  INITIAL_PAYROLLS,
  INITIAL_APPRAISALS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  ROLES,
} from './data/mockData';
import { Sidebar } from './components/Navigation/Sidebar';
import { Header } from './components/Navigation/Header';
import { GlobalSearchModal } from './components/Navigation/GlobalSearchModal';
import { DashboardView } from './components/Dashboard/DashboardView';
import { EmployeesView } from './components/Employees/EmployeesView';
import { DepartmentsView } from './components/Departments/DepartmentsView';
import { PositionsView } from './components/Positions/PositionsView';
import { ShiftScheduleView } from './components/Shifts/ShiftScheduleView';
import { AttendanceView } from './components/Attendance/AttendanceView';
import { LeavesView } from './components/Leaves/LeavesView';
import { OvertimeView } from './components/Overtime/OvertimeView';
import { PayrollView } from './components/Payroll/PayrollView';
import { PerformanceView } from './components/Performance/PerformanceView';
import { AnnouncementsView } from './components/Announcements/AnnouncementsView';
import { ReportsView } from './components/Reports/ReportsView';
import { LaravelHubModal } from './components/Developer/LaravelHubModal';

export default function App() {
  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('super_admin');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLaravelHubOpen, setIsLaravelHubOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Core Data States
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [shiftPatterns, setShiftPatterns] = useState<ShiftPattern[]>(INITIAL_SHIFT_PATTERNS);
  const [shiftSchedules, setShiftSchedules] = useState<EmployeeShiftSchedule[]>(INITIAL_SHIFT_SCHEDULES);
  const [auditReport, setAuditReport] = useState<ShiftAuditReport>(() =>
    auditShiftSchedules(INITIAL_SHIFT_SCHEDULES, INITIAL_SHIFTS, INITIAL_EMPLOYEES)
  );
  const [attendances, setAttendances] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCES);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES);
  const [overtimes, setOvertimes] = useState<OvertimeRequest[]>(INITIAL_OVERTIMES);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(INITIAL_PAYROLLS);
  const [appraisals, setAppraisals] = useState<PerformanceAppraisal[]>(INITIAL_APPRAISALS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Current logged in user (defaults to Super Admin Pratama Ardiansyah)
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(INITIAL_EMPLOYEES[0]);

  // Sync role switch with appropriate representative user
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'super_admin') {
      setCurrentEmployee(employees.find((e) => e.role === 'super_admin') || employees[0]);
    } else if (role === 'hr_manager') {
      setCurrentEmployee(employees.find((e) => e.role === 'hr_manager') || employees[1]);
    } else if (role === 'manager') {
      setCurrentEmployee(employees.find((e) => e.role === 'manager') || employees[2]);
    } else if (role === 'employee') {
      setCurrentEmployee(employees.find((e) => e.role === 'employee') || employees[3]);
    }
  };

  // Pending counts
  const pendingLeavesCount = leaves.filter((l) => l.status === 'pending' || l.status === 'manager_approved').length;
  const pendingOvertimesCount = overtimes.filter((o) => o.status === 'pending').length;
  const unreadAnnouncementsCount = announcements.filter((a) => !a.isRead).length;

  // Handlers for Employees
  const handleAddEmployee = (emp: Employee) => {
    setEmployees([emp, ...employees]);
    // Send notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Karyawan Baru Terdaftar',
      message: `${emp.name} (${emp.employeeId}) berhasil didaftarkan ke divisi ${emp.departmentName}.`,
      type: 'system',
      createdAt: 'Baru saja',
      read: false,
    };
    setNotifications([notif, ...notifications]);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees(employees.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
    if (currentEmployee.id === updatedEmp.id) {
      setCurrentEmployee(updatedEmp);
    }
  };

  const handleDeleteEmployee = (empId: string) => {
    setEmployees(employees.filter((e) => e.id !== empId));
  };

  // Handlers for Departments
  const handleAddDepartment = (dept: Department) => {
    setDepartments([...departments, dept]);
  };

  const handleUpdateDepartment = (updatedDept: Department) => {
    setDepartments(departments.map((d) => (d.id === updatedDept.id ? updatedDept : d)));
  };

  const handleDeleteDepartment = (deptId: string) => {
    setDepartments(departments.filter((d) => d.id !== deptId));
  };

  // Handlers for Positions
  const handleAddPosition = (pos: Position) => {
    setPositions([...positions, pos]);
  };

  const handleUpdatePosition = (updatedPos: Position) => {
    setPositions(positions.map((p) => (p.id === updatedPos.id ? updatedPos : p)));
  };

  const handleDeletePosition = (posId: string) => {
    setPositions(positions.filter((p) => p.id !== posId));
  };

  // Handlers for Shifts
  const handleAddShift = (shift: Shift) => {
    setShifts([...shifts, shift]);
  };

  const handleUpdateShift = (updatedShift: Shift) => {
    setShifts(shifts.map((s) => (s.id === updatedShift.id ? updatedShift : s)));
  };

  const handleAddShiftPattern = (pattern: ShiftPattern) => {
    setShiftPatterns([pattern, ...shiftPatterns]);
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Pola Rotasi Shift Ditambahkan',
      message: `Pola "${pattern.name}" (${pattern.cycleDays} hari siklus) berhasil disimpan ke pustaka pola.`,
      type: 'system',
      createdAt: 'Baru saja',
      read: false,
      linkTab: 'shifts',
    };
    setNotifications([notif, ...notifications]);
  };

  const handleUpdateShiftPattern = (updatedPattern: ShiftPattern) => {
    setShiftPatterns(shiftPatterns.map((p) => (p.id === updatedPattern.id ? updatedPattern : p)));
  };

  const handleDeleteShiftPattern = (patternId: string) => {
    setShiftPatterns(shiftPatterns.filter((p) => p.id !== patternId));
  };

  const handleAcknowledgeInvalidAttendance = (attendanceId: string, resolutionNote: string) => {
    setAttendances(
      attendances.map((a) => {
        if (a.id === attendanceId) {
          return {
            ...a,
            isInvalidShiftCheckIn: false,
            notes: (a.notes ? a.notes + ' · ' : '') + `[DISPENSASI: ${resolutionNote || 'Divalidasi Manajer'}]`,
          };
        }
        return a;
      })
    );
  };

  /**
   * Automatically runs a comprehensive check across the entire shiftSchedules array
   * to identify and report conflicting patterns whenever a manager updates an employee's shift assignment.
   */
  const runAutoScheduleAuditAndReport = (
    targetSchedules: EmployeeShiftSchedule[],
    updateContext?: ShiftAssignmentUpdateContext
  ): ShiftAuditReport => {
    const result = auditAndReportShiftConflicts(
      targetSchedules,
      shifts,
      employees,
      updateContext
    );

    // Synchronize central audit report state
    setAuditReport(result.auditReport);

    // Automatically send notification reporting conflict status to manager and HR feeds
    if (updateContext) {
      const auditNotif: AppNotification = {
        id: `audit-notif-${Date.now()}`,
        title: result.reportNotification.title,
        message: result.reportNotification.message,
        type: 'system',
        createdAt: 'Baru saja',
        read: false,
        linkTab: 'shifts',
      };
      setNotifications((prev) => [auditNotif, ...prev]);
    }

    return result.auditReport;
  };

  const handleApplyRecurringPattern = (
    employeeIds: string[],
    patternId: string,
    startDateStr: string,
    days: number
  ) => {
    const pattern = shiftPatterns.find((p) => p.id === patternId);
    if (!pattern) return;

    const newSchedules: EmployeeShiftSchedule[] = [];
    const start = new Date(startDateStr);

    employeeIds.forEach((empId) => {
      const emp = employees.find((e) => e.id === empId);
      if (!emp) return;

      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const curDateStr = d.toISOString().split('T')[0];

        const dayPatternIndex = i % pattern.cycleDays;
        const patItem = pattern.patternSchedule[dayPatternIndex] || pattern.patternSchedule[0];
        const isOff = patItem.shiftId === 'OFF';
        const shiftObj = shifts.find((s) => s.id === patItem.shiftId);

        newSchedules.push({
          id: `sch-${empId}-${curDateStr}`,
          employeeId: empId,
          employeeName: emp.name,
          departmentName: emp.departmentName,
          date: curDateStr,
          shiftId: isOff ? 'OFF' : shiftObj?.id || 'shift-reguler',
          shiftName: isOff ? 'Libur (OFF)' : shiftObj?.name || 'Reguler',
          shiftCode: isOff ? 'OFF' : shiftObj?.code || 'REG',
          startTime: isOff ? '-' : shiftObj?.startTime || '08:30',
          endTime: isOff ? '-' : shiftObj?.endTime || '17:30',
          isOffDay: isOff,
          notes: `Pola rotasi: ${pattern.name}`,
        });
      }
    });

    const filteredExisting = shiftSchedules.filter(
      (s) => !newSchedules.some((ns) => ns.employeeId === s.employeeId && ns.date === s.date)
    );
    const nextSchedules = [...newSchedules, ...filteredExisting];
    setShiftSchedules(nextSchedules);

    // Automatically runs a check across the entire shiftSchedules array to identify and report conflicting patterns
    runAutoScheduleAuditAndReport(nextSchedules, {
      employeeId: employeeIds[0] || 'batch',
      employeeName: `${employeeIds.length} Karyawan (Pola: ${pattern.name})`,
      date: startDateStr,
      shiftId: pattern.id,
      shiftName: pattern.name,
      source: 'pattern_applied',
    });
  };

  const handleUpdateScheduleCell = (employeeId: string, date: string, shiftId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    const isOff = shiftId === 'OFF';
    const shiftObj = shifts.find((s) => s.id === shiftId);

    const updatedCell: EmployeeShiftSchedule = {
      id: `sch-${employeeId}-${date}`,
      employeeId,
      employeeName: emp.name,
      departmentName: emp.departmentName,
      date,
      shiftId: isOff ? 'OFF' : shiftObj?.id || 'shift-reguler',
      shiftName: isOff ? 'Libur (OFF)' : shiftObj?.name || 'Reguler',
      shiftCode: isOff ? 'OFF' : shiftObj?.code || 'REG',
      startTime: isOff ? '-' : shiftObj?.startTime || '08:30',
      endTime: isOff ? '-' : shiftObj?.endTime || '17:30',
      isOffDay: isOff,
      notes: 'Penyesuaian manual manajer',
    };

    let nextSchedules: EmployeeShiftSchedule[];
    const existingIndex = shiftSchedules.findIndex(
      (s) => s.employeeId === employeeId && s.date === date
    );
    if (existingIndex >= 0) {
      nextSchedules = [...shiftSchedules];
      nextSchedules[existingIndex] = updatedCell;
    } else {
      nextSchedules = [updatedCell, ...shiftSchedules];
    }
    setShiftSchedules(nextSchedules);

    // Automatically runs a check across the entire shiftSchedules array to identify and report conflicting patterns
    runAutoScheduleAuditAndReport(nextSchedules, {
      employeeId,
      employeeName: emp.name,
      date,
      shiftId,
      shiftName: updatedCell.shiftName,
      source: 'cell_update',
    });
  };

  // Handlers for Attendance
  const handleRecordAttendance = (record: AttendanceRecord) => {
    const existingIndex = attendances.findIndex((a) => a.id === record.id);
    if (existingIndex >= 0) {
      const updated = [...attendances];
      updated[existingIndex] = record;
      setAttendances(updated);
    } else {
      setAttendances([record, ...attendances]);
    }

    if (record.status === 'Terlambat') {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: 'Presensi Terlambat Terdeteksi',
        message: `${record.employeeName} tercatat check-in pukul ${record.clockIn} WIB.`,
        type: 'attendance',
        createdAt: 'Baru saja',
        read: false,
        linkTab: 'attendance',
      };
      setNotifications([notif, ...notifications]);
    }
  };

  // Handlers for Leaves
  const handleApplyLeave = (leave: LeaveRequest) => {
    setLeaves([leave, ...leaves]);
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Pengajuan Cuti Baru',
      message: `${leave.employeeName} mengajukan ${leave.leaveType} (${leave.totalDays} hari) menunggu persetujuan Manager.`,
      type: 'leave',
      createdAt: 'Baru saja',
      read: false,
      linkTab: 'leaves',
    };
    setNotifications([notif, ...notifications]);
  };

  const handleApproveLeave = (leaveId: string, level: 'manager' | 'hr', note?: string) => {
    const updated = leaves.map((l) => {
      if (l.id !== leaveId) return l;
      if (level === 'manager') {
        return {
          ...l,
          status: 'manager_approved' as const,
          managerNote: note || 'Disetujui oleh Manager',
          managerActionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
      } else {
        // Final HR Approval: deduct leave quota if annual leave
        if (l.leaveType === 'Cuti Tahunan') {
          setEmployees(
            employees.map((emp) => {
              if (emp.id === l.employeeId) {
                const used = (emp.leaveBalance?.taken ?? 0) + l.totalDays;
                const quota = emp.leaveBalance?.annual ?? 12;
                return {
                  ...emp,
                  leaveBalance: {
                    annual: quota,
                    taken: used,
                    remaining: Math.max(0, quota - used),
                  },
                };
              }
              return emp;
            })
          );
        }

        return {
          ...l,
          status: 'approved' as const,
          hrNote: note || 'Disetujui final oleh HR Director',
          hrActionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };
      }
    });

    setLeaves(updated);

    const targetLeave = leaves.find((l) => l.id === leaveId);
    if (targetLeave) {
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        title: level === 'manager' ? 'Cuti Disetujui Manager' : 'Cuti Disetujui Final HR',
        message: `Pengajuan cuti ${targetLeave.employeeName} telah ${
          level === 'manager' ? 'disetujui tingkat Manager (menuju HR Final)' : 'disetujui sepenuhnya.'
        }`,
        type: 'leave',
        createdAt: 'Baru saja',
        read: false,
        linkTab: 'leaves',
      };
      setNotifications([notif, ...notifications]);
    }
  };

  const handleRejectLeave = (leaveId: string, note?: string) => {
    const updated = leaves.map((l) => {
      if (l.id === leaveId) {
        return {
          ...l,
          status: 'rejected' as const,
          managerNote: note || 'Permohonan cuti ditolak',
        };
      }
      return l;
    });
    setLeaves(updated);
  };

  // Handlers for Overtime
  const handleApplyOvertime = (ot: OvertimeRequest) => {
    setOvertimes([ot, ...overtimes]);
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Pengajuan Lembur Baru',
      message: `${ot.employeeName} mengajukan lembur ${ot.totalHours} jam (${ot.date}).`,
      type: 'leave',
      createdAt: 'Baru saja',
      read: false,
      linkTab: 'overtime',
    };
    setNotifications([notif, ...notifications]);
  };

  const handleApproveOvertime = (otId: string, level: 'manager' | 'hr', note?: string) => {
    const updated = overtimes.map((o) => {
      if (o.id !== otId) return o;
      if (level === 'manager') {
        return { ...o, status: 'manager_approved' as const, managerNote: note || 'Disetujui' };
      }
      return { ...o, status: 'approved' as const, hrNote: note || 'Disetujui' };
    });
    setOvertimes(updated);
  };

  const handleRejectOvertime = (otId: string) => {
    setOvertimes(overtimes.map((o) => (o.id === otId ? { ...o, status: 'rejected' as const } : o)));
  };

  // Handlers for Payroll Generation (Indonesian Labor & Tax Law PP 58/2023)
  const handleGenerateMonthlyPayroll = (month: number, year: number) => {
    const generated: PayrollRecord[] = employees.map((emp) => {
      const baseSalary = emp.baseSalary;
      const allowanceTransport = 1000000;
      const allowanceMeal = 800000;
      const allowancePosition =
        emp.positionName.includes('Director') || emp.positionName.includes('Manager')
          ? 3000000
          : emp.positionName.includes('Lead') || emp.positionName.includes('Architect')
          ? 2000000
          : 800000;

      // Calculate approved overtime
      const empOvertimes = overtimes.filter(
        (o) => o.employeeId === emp.id && o.status === 'approved'
      );
      const overtimePay = empOvertimes.reduce((sum, o) => sum + o.estimatedPay, 0);

      const bonus = emp.role === 'super_admin' ? 2500000 : 0;
      const totalEarnings = baseSalary + allowanceTransport + allowanceMeal + allowancePosition + overtimePay + bonus;

      // BPJS Kesehatan 1% Employee (Max Cap 12.000.000)
      const bpjsKesBasis = Math.min(baseSalary, 12000000);
      const bpjsKesehatan = Math.round(bpjsKesBasis * 0.01);
      const bpjsKesehatanEmployer = Math.round(bpjsKesBasis * 0.04);

      // BPJS Ketenagakerjaan (JHT 2% + JP 1% capped at 10.042.300)
      const bpjsTkJht = Math.round(baseSalary * 0.02);
      const jpBasis = Math.min(baseSalary, 10042300);
      const bpjsTkJp = Math.round(jpBasis * 0.01);
      const bpjsKetenagakerjaan = bpjsTkJht + bpjsTkJp;
      const bpjsKetenagakerjaanEmployer = Math.round(
        baseSalary * 0.037 + jpBasis * 0.02 + baseSalary * 0.0054
      );

      // Tax PPh 21 TER estimation
      let taxRate = 0.05;
      if (totalEarnings > 30000000) taxRate = 0.09;
      else if (totalEarnings > 20000000) taxRate = 0.07;
      else if (totalEarnings > 14000000) taxRate = 0.05;
      else if (totalEarnings > 8000000) taxRate = 0.02;
      else taxRate = 0.005;

      const pph21Tax = Math.round(totalEarnings * taxRate);
      const totalDeductions = bpjsKesehatan + bpjsKetenagakerjaan + pph21Tax;
      const netSalary = Math.max(0, totalEarnings - totalDeductions);

      return {
        id: `pay-${year}-${month}-${emp.id}`,
        employeeId: emp.id,
        employeeName: emp.name,
        employeeCode: emp.employeeId,
        nik: emp.nik,
        departmentName: emp.departmentName,
        positionName: emp.positionName,
        month,
        year,
        baseSalary,
        allowanceTransport,
        allowanceMeal,
        allowancePosition,
        overtimePay,
        bonus,
        totalEarnings,
        bpjsKesehatan,
        bpjsKetenagakerjaan,
        pph21Tax,
        unpaidLeaveDeduction: 0,
        otherDeductions: 0,
        totalDeductions,
        netSalary,
        bpjsKesehatanEmployer,
        bpjsKetenagakerjaanEmployer,
        status: 'published',
        paidAt: `${year}-${String(month).padStart(2, '0')}-25 10:00:00`,
        paymentReference: `TRX-PAY-${year}${String(month).padStart(2, '0')}25-${emp.id}`,
        notes: `Payroll otomatis periode ${month}/${year}`,
      };
    });

    // Replace or add to payrolls
    const otherPayrolls = payrolls.filter((p) => !(p.month === month && p.year === year));
    setPayrolls([...generated, ...otherPayrolls]);

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Payroll Bulanan Diterbitkan',
      message: `Payroll bulan ${month}/${year} (${generated.length} karyawan) berhasil dihitung dan siap dibayarkan.`,
      type: 'payroll',
      createdAt: 'Baru saja',
      read: false,
      linkTab: 'payroll',
    };
    setNotifications([notif, ...notifications]);
  };

  const handleMarkPayrollPaid = (payrollId: string) => {
    setPayrolls(
      payrolls.map((p) =>
        p.id === payrollId
          ? {
              ...p,
              status: 'paid' as const,
              paidAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : p
      )
    );
  };

  // Handlers for Appraisals
  const handleAddAppraisal = (app: PerformanceAppraisal) => {
    setAppraisals([app, ...appraisals]);
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Penilaian Kinerja Terbit',
      message: `Evaluasi kinerja ${app.employeeName} periode ${app.period} telah selesai dinilai (${app.grade}).`,
      type: 'system',
      createdAt: 'Baru saja',
      read: false,
      linkTab: 'performance',
    };
    setNotifications([notif, ...notifications]);
  };

  // Handlers for Announcements
  const handleAddAnnouncement = (ann: Announcement) => {
    setAnnouncements([ann, ...announcements]);
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Pengumuman Baru',
      message: ann.title,
      type: 'announcement',
      createdAt: 'Baru saja',
      read: false,
      linkTab: 'announcements',
    };
    setNotifications([notif, ...notifications]);
  };

  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications(
      notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentRole={currentRole}
        pendingLeavesCount={pendingLeavesCount}
        pendingOvertimesCount={pendingOvertimesCount}
        unreadAnnouncementsCount={unreadAnnouncementsCount}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenLaravelHub={() => setIsLaravelHubOpen(true)}
      />

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col transition-all duration-200 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <Header
          currentTab={currentTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onOpenLaravelHub={() => setIsLaravelHubOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          currentEmployee={currentEmployee}
          allEmployees={employees}
          onSelectEmployeeAsCurrent={setCurrentEmployee}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              employees={employees}
              attendances={attendances}
              leaves={leaves}
              overtimes={overtimes}
              payrolls={payrolls}
              announcements={announcements}
              currentRole={currentRole}
              currentEmployee={currentEmployee}
              onNavigateTab={setCurrentTab}
              onApproveLeave={(id, type) => handleApproveLeave(id, type)}
              onRejectLeave={handleRejectLeave}
              onOpenLaravelHub={() => setIsLaravelHubOpen(true)}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeesView
              employees={employees}
              departments={departments}
              positions={positions}
              currentRole={currentRole}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {currentTab === 'departments' && (
            <DepartmentsView
              departments={departments}
              employees={employees}
              currentRole={currentRole}
              onAddDepartment={handleAddDepartment}
              onUpdateDepartment={handleUpdateDepartment}
              onDeleteDepartment={handleDeleteDepartment}
            />
          )}

          {currentTab === 'positions' && (
            <PositionsView
              positions={positions}
              departments={departments}
              currentRole={currentRole}
              onAddPosition={handleAddPosition}
              onUpdatePosition={handleUpdatePosition}
              onDeletePosition={handleDeletePosition}
            />
          )}

          {currentTab === 'shifts' && (
            <ShiftScheduleView
              shifts={shifts}
              patterns={shiftPatterns}
              schedules={shiftSchedules}
              employees={employees}
              departments={departments}
              currentRole={currentRole}
              auditReport={auditReport}
              onRunFullAudit={() =>
                runAutoScheduleAuditAndReport(shiftSchedules, {
                  employeeId: 'all',
                  employeeName: 'Audit Manual Sistem',
                  date: new Date().toISOString().split('T')[0],
                  shiftId: 'audit',
                  source: 'manual_audit',
                })
              }
              onAddShift={handleAddShift}
              onUpdateShift={handleUpdateShift}
              onAddShiftPattern={handleAddShiftPattern}
              onUpdateShiftPattern={handleUpdateShiftPattern}
              onDeleteShiftPattern={handleDeleteShiftPattern}
              onApplyRecurringPattern={handleApplyRecurringPattern}
              onUpdateScheduleCell={handleUpdateScheduleCell}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceView
              attendances={attendances}
              currentEmployee={currentEmployee}
              allEmployees={employees}
              currentRole={currentRole}
              shifts={shifts}
              schedules={shiftSchedules}
              onRecordAttendance={handleRecordAttendance}
              onAcknowledgeInvalidCheckIn={handleAcknowledgeInvalidAttendance}
            />
          )}

          {currentTab === 'leaves' && (
            <LeavesView
              leaves={leaves}
              currentEmployee={currentEmployee}
              allEmployees={employees}
              currentRole={currentRole}
              onApplyLeave={handleApplyLeave}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
            />
          )}

          {currentTab === 'overtime' && (
            <OvertimeView
              overtimes={overtimes}
              currentEmployee={currentEmployee}
              allEmployees={employees}
              currentRole={currentRole}
              onApplyOvertime={handleApplyOvertime}
              onApproveOvertime={handleApproveOvertime}
              onRejectOvertime={handleRejectOvertime}
            />
          )}

          {currentTab === 'payroll' && (
            <PayrollView
              payrolls={payrolls}
              employees={employees}
              overtimes={overtimes}
              currentRole={currentRole}
              currentEmployee={currentEmployee}
              onGenerateMonthlyPayroll={handleGenerateMonthlyPayroll}
              onMarkPayrollPaid={handleMarkPayrollPaid}
            />
          )}

          {currentTab === 'performance' && (
            <PerformanceView
              appraisals={appraisals}
              employees={employees}
              currentRole={currentRole}
              currentEmployee={currentEmployee}
              onAddAppraisal={handleAddAppraisal}
            />
          )}

          {currentTab === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              currentRole={currentRole}
              currentEmployee={currentEmployee}
              onAddAnnouncement={handleAddAnnouncement}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              employees={employees}
              attendances={attendances}
              leaves={leaves}
              overtimes={overtimes}
              payrolls={payrolls}
              departments={departments}
            />
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        employees={employees}
        departments={departments}
        positions={positions}
        onSelectResult={(tab) => setCurrentTab(tab)}
      />

      {/* Laravel 12 & Filament v4 Architecture Hub Modal */}
      <LaravelHubModal
        isOpen={isLaravelHubOpen}
        onClose={() => setIsLaravelHubOpen(false)}
      />
    </div>
  );
}
