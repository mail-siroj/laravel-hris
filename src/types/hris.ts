export type UserRole = 'super_admin' | 'hr_manager' | 'manager' | 'employee';

export interface RoleInfo {
  id: UserRole;
  name: string;
  badge: string;
  color: string;
  description: string;
  permissions: string[];
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string;
  managerId?: string;
  managerName?: string;
  budget?: number;
  location?: string;
  createdAt: string;
}

export interface Position {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName?: string;
  baseSalaryMin: number;
  baseSalaryMax: number;
  description: string;
  level: 'Staff' | 'Senior' | 'Lead' | 'Manager' | 'Director';
}

export interface Employee {
  id: string;
  employeeId: string; // e.g. EMP-2026-001
  nik: string; // 16 digits
  name: string;
  birthPlace: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan';
  maritalStatus: 'Belum Menikah' | 'Menikah' | 'Cerai Hidup' | 'Cerai Mati';
  email: string;
  phone: string;
  address: string;
  departmentId: string;
  departmentName: string;
  positionId: string;
  positionName: string;
  joinDate: string;
  status: 'Tetap' | 'Kontrak' | 'Probation' | 'Magang';
  baseSalary: number;
  photo: string;
  role: UserRole;
  managerId?: string;
  managerName?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  npwp?: string;
  bpjsKesehatanNo?: string;
  bpjsKetenagakerjaanNo?: string;
  leaveBalance: {
    annual: number; // default 12
    taken: number;
    remaining: number;
  };
}

export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpha';

export interface Shift {
  id: string;
  code: string; // e.g. 'PAGI', 'SIANG', 'MALAM', 'REG'
  name: string; // e.g. 'Shift Pagi (Morning)', 'Shift Siang (Afternoon)', 'Shift Malam (Night)'
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  earlyCheckInToleranceMinutes: number; // e.g. 60 mins before
  lateGraceMinutes: number; // e.g. 15 mins after
  color: string;
  description: string;
  isNightShift?: boolean;
}

export interface ShiftPattern {
  id: string;
  name: string;
  description: string;
  cycleDays: number;
  patternSchedule: { dayIndex: number; shiftId: string | 'OFF'; shiftLabel?: string }[];
}

export interface EmployeeShiftSchedule {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  shiftId: string; // or 'OFF'
  shiftName: string;
  shiftCode: string;
  startTime: string;
  endTime: string;
  isOffDay: boolean;
  notes?: string;
}

export type ConflictSeverity = 'critical' | 'warning';
export type ConflictType = 'overlap' | 'insufficient_rest' | 'night_to_morning' | 'excessive_consecutive_days';

export interface ShiftConflictItem {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  date: string;
  shiftName: string;
  shiftCode: string;
  conflictingDate: string;
  conflictingShiftName: string;
  conflictingShiftCode: string;
  severity: ConflictSeverity;
  type: ConflictType;
  restHours: number;
  message: string;
  recommendation: string;
  detectedAt: string;
}

export interface ShiftAuditReport {
  totalSchedulesScanned: number;
  totalConflicts: number;
  criticalCount: number;
  warningCount: number;
  affectedEmployeesCount: number;
  affectedEmployeeIds: string[];
  conflicts: ShiftConflictItem[];
  auditedAt: string;
  hasConflicts: boolean;
  summaryMessage: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  clockIn: string | null; // HH:mm:ss
  clockOut: string | null; // HH:mm:ss
  status: AttendanceStatus;
  latitude?: number;
  longitude?: number;
  officeVerified: boolean;
  distanceMeters?: number;
  selfieUrl?: string;
  notes?: string;
  workHours?: number;

  // Shift Integration & Validation Fields
  shiftId?: string;
  shiftName?: string;
  shiftCode?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  isOffDayCheckIn?: boolean;
  isInvalidShiftCheckIn?: boolean;
  invalidShiftReason?: string;
  earlyCheckInMinutes?: number;
  lateMinutes?: number;
}

export type LeaveType = 'Cuti Tahunan' | 'Cuti Sakit' | 'Cuti Melahirkan' | 'Cuti Khusus';
export type LeaveStatus = 'pending' | 'manager_approved' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: LeaveStatus;
  managerId?: string;
  managerName?: string;
  managerNote?: string;
  managerActionDate?: string;
  hrId?: string;
  hrName?: string;
  hrNote?: string;
  hrActionDate?: string;
  createdAt: string;
}

export type OvertimeStatus = 'pending' | 'manager_approved' | 'approved' | 'rejected';

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalHours: number;
  reason: string;
  rateMultiplier: number; // standard Indonesian DEPNAKER rule (1.5x first hr, 2x subsequent)
  estimatedPay: number;
  status: OvertimeStatus;
  managerNote?: string;
  hrNote?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  nik: string;
  departmentName: string;
  positionName: string;
  month: number; // 1-12
  year: number; // 2026
  
  // Earnings (Pendapatan)
  baseSalary: number;
  allowanceTransport: number;
  allowanceMeal: number;
  allowancePosition: number;
  overtimePay: number;
  bonus: number;
  totalEarnings: number;

  // Deductions (Potongan)
  bpjsKesehatan: number; // 1% employee
  bpjsKetenagakerjaan: number; // 2% JHT + 1% JP = 3%
  pph21Tax: number;
  unpaidLeaveDeduction: number;
  otherDeductions: number;
  totalDeductions: number;

  // Net Pay
  netSalary: number;

  // Employer Contributions (Informational)
  bpjsKesehatanEmployer: number; // 4%
  bpjsKetenagakerjaanEmployer: number; // 0.24% JKK, 0.3% JKM, 3.7% JHT, 2% JP

  status: 'draft' | 'published' | 'paid';
  paidAt?: string;
  paymentReference?: string;
  notes?: string;
}

export interface PerformanceAppraisal {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  positionName: string;
  evaluatorId: string;
  evaluatorName: string;
  period: string; // e.g. "Q1 2026"
  
  // Criteria (1-100)
  attendanceScore: number; // Weight: 20%
  disciplineScore: number; // Weight: 20%
  teamworkScore: number; // Weight: 20%
  productivityScore: number; // Weight: 25%
  communicationScore: number; // Weight: 15%

  finalScore: number; // Weighted 0-100
  grade: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  strengths: string;
  improvements: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  targetAudience: 'all' | 'ITE' | 'HRD' | 'FIN' | 'MKT' | 'OPS';
  targetAudienceLabel: string;
  priority: 'normal' | 'urgent';
  attachmentName?: string;
  authorName: string;
  authorRole: string;
  isRead?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'leave' | 'attendance' | 'payroll' | 'announcement' | 'system';
  targetRole?: UserRole;
  targetEmployeeId?: string;
  createdAt: string;
  read: boolean;
  linkTab?: string;
}
