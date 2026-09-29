import {
  EmployeeShiftSchedule,
  Shift,
  Employee,
  ShiftConflictItem,
  ShiftAuditReport,
  ConflictType,
  ConflictSeverity,
} from '../types/hris';

/**
 * Menghitung objek Date untuk waktu mulai dan waktu selesai shift.
 * Menangani shift malam lintas hari (cross-midnight, end time di hari berikutnya).
 */
export function getShiftDateTimeRange(
  dateStr: string,
  shift: Shift
): { start: Date; end: Date } {
  const [startH, startM] = shift.startTime.split(':').map(Number);
  const [endH, endM] = shift.endTime.split(':').map(Number);

  const startDate = new Date(`${dateStr}T00:00:00`);
  startDate.setHours(startH, startM, 0, 0);

  const endDate = new Date(`${dateStr}T00:00:00`);
  if (shift.isNightShift || endH < startH) {
    // Shift malam berakhir di hari kalender berikutnya
    endDate.setDate(endDate.getDate() + 1);
  }
  endDate.setHours(endH, endM, 0, 0);

  return { start: startDate, end: endDate };
}

/**
 * Memindai SELURUH array shiftSchedules untuk mendeteksi dan melaporkan
 * semua pola konflik jadwal (overlap, jeda istirahat kurang dari 8 jam,
 * transisi malam ke pagi, dan kerja lebih dari 6 hari tanpa libur).
 */
export function auditShiftSchedules(
  schedules: EmployeeShiftSchedule[],
  shifts: Shift[],
  employees?: Employee[]
): ShiftAuditReport {
  const conflicts: ShiftConflictItem[] = [];
  const affectedEmployeeIdsSet = new Set<string>();

  // Dapatkan daftar ID karyawan unik
  const employeeIds = Array.from(new Set(schedules.map((s) => s.employeeId)));

  employeeIds.forEach((empId) => {
    // Ambil semua jadwal karyawan ini dan urutkan berdasarkan tanggal
    const empSchedules = schedules
      .filter((s) => s.employeeId === empId)
      .sort((a, b) => a.date.localeCompare(b.date));

    const empObj = employees?.find((e) => e.id === empId);
    const empName = empObj?.name || empSchedules[0]?.employeeName || 'Karyawan';
    const deptName = empObj?.departmentName || empSchedules[0]?.departmentName || 'Divisi';

    // 1. Audit Konflik Antara Shift Berurutan (Overlap & Jeda Istirahat < 8 Jam)
    const activeWorkingSchedules = empSchedules.filter(
      (s) => !s.isOffDay && s.shiftId !== 'OFF'
    );

    for (let i = 0; i < activeWorkingSchedules.length - 1; i++) {
      const current = activeWorkingSchedules[i];
      const next = activeWorkingSchedules[i + 1];

      const currentD = new Date(`${current.date}T00:00:00`);
      const nextD = new Date(`${next.date}T00:00:00`);
      const diffDays = Math.round(
        (nextD.getTime() - currentD.getTime()) / (1000 * 60 * 60 * 24)
      );

      // 1. Audit Konflik: Tanggal yang sama (Double Booking / 2 Shift di hari yang sama)
      if (diffDays === 0) {
        affectedEmployeeIdsSet.add(empId);
        conflicts.push({
          id: `cnf-${empId}-${current.date}-dup`,
          employeeId: empId,
          employeeName: empName,
          departmentName: deptName,
          date: next.date,
          shiftName: next.shiftName,
          shiftCode: next.shiftCode,
          conflictingDate: current.date,
          conflictingShiftName: current.shiftName,
          conflictingShiftCode: current.shiftCode,
          severity: 'critical',
          type: 'overlap',
          restHours: 0,
          message: `Penugasan Ganda (Same-Day Double Booking): Karyawan ditugaskan 2 shift kerja berbeda pada tanggal yang sama (${current.date}): Shift ${current.shiftCode} dan Shift ${next.shiftCode}.`,
          recommendation: `Hapus salah satu jadwal agar penugasan shift tidak bentrok ganda.`,
          detectedAt: new Date().toLocaleTimeString('id-ID'),
        });
        continue;
      }

      // Hanya periksa jika kedua shift berdekatan dalam rentang 1 hari (24-36 jam)
      if (diffDays === 1) {
        const shift1 = shifts.find((s) => s.id === current.shiftId);
        const shift2 = shifts.find((s) => s.id === next.shiftId);

        if (shift1 && shift2) {
          const range1 = getShiftDateTimeRange(current.date, shift1);
          const range2 = getShiftDateTimeRange(next.date, shift2);

          // Cek Overlap langsung
          if (range2.start.getTime() < range1.end.getTime()) {
            affectedEmployeeIdsSet.add(empId);
            conflicts.push({
              id: `cnf-${empId}-${current.date}-${next.date}-ovl`,
              employeeId: empId,
              employeeName: empName,
              departmentName: deptName,
              date: next.date,
              shiftName: shift2.name,
              shiftCode: shift2.code,
              conflictingDate: current.date,
              conflictingShiftName: shift1.name,
              conflictingShiftCode: shift1.code,
              severity: 'critical',
              type: 'overlap',
              restHours: 0,
              message: `Tumpang-tindih (Overlap): Shift ${shift2.code} (${shift2.startTime}-${shift2.endTime}) bertabrakan langsung dengan shift ${shift1.code} (${shift1.startTime}-${shift1.endTime}) dalam rentang 24 jam.`,
              recommendation: `Geser shift ${next.date} ke shift berikutnya atau berikan Libur (OFF).`,
              detectedAt: new Date().toLocaleTimeString('id-ID'),
            });
            continue;
          }

          // Cek jeda istirahat antar shift
          const restMillis = range2.start.getTime() - range1.end.getTime();
          const restHours = Math.round((restMillis / (1000 * 60 * 60)) * 10) / 10;

          // Kasus Kritis: Shift Malam langsung diikuti Shift Pagi (0-1 jam istirahat)
          if (shift1.isNightShift && shift2.code === 'PAGI' && restHours <= 1) {
            affectedEmployeeIdsSet.add(empId);
            conflicts.push({
              id: `cnf-${empId}-${current.date}-${next.date}-n2m`,
              employeeId: empId,
              employeeName: empName,
              departmentName: deptName,
              date: next.date,
              shiftName: shift2.name,
              shiftCode: shift2.code,
              conflictingDate: current.date,
              conflictingShiftName: shift1.name,
              conflictingShiftCode: shift1.code,
              severity: 'critical',
              type: 'night_to_morning',
              restHours,
              message: `Konflik Berbahaya (Malam ke Pagi): Karyawan selesai Shift Malam pukul ${shift1.endTime} WIB pada ${current.date}, langsung dijadwalkan Shift Pagi pukul ${shift2.startTime} WIB pada ${next.date} (Jeda istirahat hanya ${restHours} jam).`,
              recommendation: `Ubah shift tanggal ${next.date} menjadi Libur (OFF) atau geser ke Shift Siang/Malam.`,
              detectedAt: new Date().toLocaleTimeString('id-ID'),
            });
          } else if (restHours < 8 && range2.start.getTime() - range1.start.getTime() <= 24 * 60 * 60 * 1000) {
            // Jeda istirahat di bawah batas minimum UU Ketenagakerjaan (8-11 jam)
            affectedEmployeeIdsSet.add(empId);
            conflicts.push({
              id: `cnf-${empId}-${current.date}-${next.date}-rest`,
              employeeId: empId,
              employeeName: empName,
              departmentName: deptName,
              date: next.date,
              shiftName: shift2.name,
              shiftCode: shift2.code,
              conflictingDate: current.date,
              conflictingShiftName: shift1.name,
              conflictingShiftCode: shift1.code,
              severity: 'warning',
              type: 'insufficient_rest',
              restHours,
              message: `Jeda Istirahat Kurang: Jeda antar shift hanya ${restHours} jam (Standar keselamatan K3 & UU Ketenagakerjaan: minimal 8-11 jam istirahat).`,
              recommendation: `Tingkatkan jeda antar shift agar karyawan mendapatkan istirahat yang cukup.`,
              detectedAt: new Date().toLocaleTimeString('id-ID'),
            });
          }
        }
      }
    }

    // 2. Audit Kerja Beruntun Tanpa Libur (> 6 Hari Kerja Berturut-turut)
    let consecutiveWorkDays = 0;
    let consecutiveStartDate = '';

    empSchedules.forEach((s) => {
      if (!s.isOffDay && s.shiftId !== 'OFF') {
        consecutiveWorkDays++;
        if (consecutiveWorkDays === 1) {
          consecutiveStartDate = s.date;
        }

        if (consecutiveWorkDays >= 7) {
          affectedEmployeeIdsSet.add(empId);
          conflicts.push({
            id: `cnf-${empId}-${s.date}-overwork`,
            employeeId: empId,
            employeeName: empName,
            departmentName: deptName,
            date: s.date,
            shiftName: s.shiftName,
            shiftCode: s.shiftCode,
            conflictingDate: consecutiveStartDate,
            conflictingShiftName: 'Hari Kerja Berturut-turut',
            conflictingShiftCode: `${consecutiveWorkDays} Hari`,
            severity: 'warning',
            type: 'excessive_consecutive_days',
            restHours: 0,
            message: `Kelebihan Hari Kerja: ${empName} telah dijadwalkan bekerja ${consecutiveWorkDays} hari berturut-turut sejak ${consecutiveStartDate} tanpa hari libur (OFF).`,
            recommendation: `Beri hak libur mingguan (OFF DAY) setelah maksimal 6 hari kerja sesuai Pasal 79 UU Ketenagakerjaan.`,
            detectedAt: new Date().toLocaleTimeString('id-ID'),
          });
        }
      } else {
        consecutiveWorkDays = 0;
      }
    });
  });

  const criticalCount = conflicts.filter((c) => c.severity === 'critical').length;
  const warningCount = conflicts.filter((c) => c.severity === 'warning').length;
  const affectedEmployeeIds = Array.from(affectedEmployeeIdsSet);

  let summaryMessage = 'Semua jadwal shift terverifikasi aman dan tidak ada konflik.';
  if (conflicts.length > 0) {
    summaryMessage = `Audit mendeteksi ${conflicts.length} konflik jadwal (${criticalCount} kritis, ${warningCount} peringatan) mempengaruhi ${affectedEmployeeIds.length} karyawan.`;
  }

  return {
    totalSchedulesScanned: schedules.length,
    totalConflicts: conflicts.length,
    criticalCount,
    warningCount,
    affectedEmployeesCount: affectedEmployeeIds.length,
    affectedEmployeeIds,
    conflicts,
    auditedAt: new Date().toLocaleTimeString('id-ID'),
    hasConflicts: conflicts.length > 0,
    summaryMessage,
  };
}

/**
 * Pengecekan cepat calon penugasan baru (sebelum disimpan) untuk mengetahui
 * apakah perubahan tersebut memicu konflik dengan jadwal kemarin atau besok.
 */
export function checkProspectiveShiftConflict(
  employeeId: string,
  employeeName: string,
  targetDate: string,
  newShiftId: string,
  schedules: EmployeeShiftSchedule[],
  shifts: Shift[]
): ShiftConflictItem | null {
  if (newShiftId === 'OFF') return null;
  const prospectiveShift = shifts.find((s) => s.id === newShiftId);
  if (!prospectiveShift) return null;

  const targetD = new Date(`${targetDate}T00:00:00`);

  const prevD = new Date(targetD);
  prevD.setDate(prevD.getDate() - 1);
  const prevDateStr = prevD.toISOString().split('T')[0];

  const nextD = new Date(targetD);
  nextD.setDate(nextD.getDate() + 1);
  const nextDateStr = nextD.toISOString().split('T')[0];

  // 1. Cek terhadap hari sebelumnya
  const prevSched = schedules.find(
    (s) => s.employeeId === employeeId && s.date === prevDateStr
  );
  if (prevSched && !prevSched.isOffDay && prevSched.shiftId !== 'OFF') {
    const prevShift = shifts.find((s) => s.id === prevSched.shiftId);
    if (prevShift) {
      const range1 = getShiftDateTimeRange(prevDateStr, prevShift);
      const range2 = getShiftDateTimeRange(targetDate, prospectiveShift);

      if (range2.start.getTime() < range1.end.getTime()) {
        return {
          id: `preview-ovl-${employeeId}`,
          employeeId,
          employeeName,
          date: targetDate,
          shiftName: prospectiveShift.name,
          shiftCode: prospectiveShift.code,
          conflictingDate: prevDateStr,
          conflictingShiftName: prevShift.name,
          conflictingShiftCode: prevShift.code,
          severity: 'critical',
          type: 'overlap',
          restHours: 0,
          message: `Tumpang-tindih (Overlap): Jam shift baru ${prospectiveShift.code} (${prospectiveShift.startTime}-${prospectiveShift.endTime}) bertabrakan langsung dengan shift ${prevShift.code} (${prevShift.startTime}-${prevShift.endTime}) tanggal ${prevDateStr}.`,
          recommendation: `Pilih shift lain atau atur hari sebelumnya sebagai Libur.`,
          detectedAt: new Date().toLocaleTimeString('id-ID'),
        };
      }

      const restMillis = range2.start.getTime() - range1.end.getTime();
      const restHours = Math.round((restMillis / (1000 * 60 * 60)) * 10) / 10;

      if (prevShift.isNightShift && prospectiveShift.code === 'PAGI' && restHours <= 1) {
        return {
          id: `preview-n2m-${employeeId}`,
          employeeId,
          employeeName,
          date: targetDate,
          shiftName: prospectiveShift.name,
          shiftCode: prospectiveShift.code,
          conflictingDate: prevDateStr,
          conflictingShiftName: prevShift.name,
          conflictingShiftCode: prevShift.code,
          severity: 'critical',
          type: 'night_to_morning',
          restHours,
          message: `Konflik Berbahaya (Malam ke Pagi): Karyawan baru selesai Shift Malam pukul ${prevShift.endTime} WIB pada ${prevDateStr}, langsung dijadwalkan Shift Pagi pukul ${prospectiveShift.startTime} WIB pada ${targetDate} (Jeda istirahat ${restHours} jam).`,
          recommendation: `Beri jeda istirahat minimal 8-11 jam atau ubah ke Shift Siang/Libur.`,
          detectedAt: new Date().toLocaleTimeString('id-ID'),
        };
      }

      if (restHours < 8) {
        return {
          id: `preview-rest-${employeeId}`,
          employeeId,
          employeeName,
          date: targetDate,
          shiftName: prospectiveShift.name,
          shiftCode: prospectiveShift.code,
          conflictingDate: prevDateStr,
          conflictingShiftName: prevShift.name,
          conflictingShiftCode: prevShift.code,
          severity: 'warning',
          type: 'insufficient_rest',
          restHours,
          message: `Jeda Istirahat Kurang: Jeda dari shift kemarin (${prevShift.name}) hanya ${restHours} jam (Minimal aman: 8 jam).`,
          recommendation: `Disarankan memilih shift yang memberikan istirahat memadai.`,
          detectedAt: new Date().toLocaleTimeString('id-ID'),
        };
      }
    }
  }

  // 2. Cek terhadap hari berikutnya
  const nextSched = schedules.find(
    (s) => s.employeeId === employeeId && s.date === nextDateStr
  );
  if (nextSched && !nextSched.isOffDay && nextSched.shiftId !== 'OFF') {
    const nextShift = shifts.find((s) => s.id === nextSched.shiftId);
    if (nextShift) {
      const range1 = getShiftDateTimeRange(targetDate, prospectiveShift);
      const range2 = getShiftDateTimeRange(nextDateStr, nextShift);

      if (range2.start.getTime() < range1.end.getTime()) {
        return {
          id: `preview-ovl-next-${employeeId}`,
          employeeId,
          employeeName,
          date: targetDate,
          shiftName: prospectiveShift.name,
          shiftCode: prospectiveShift.code,
          conflictingDate: nextDateStr,
          conflictingShiftName: nextShift.name,
          conflictingShiftCode: nextShift.code,
          severity: 'critical',
          type: 'overlap',
          restHours: 0,
          message: `Tumpang-tindih (Overlap): Jam selesai shift baru ini melampaui jam mulai shift besok (${nextShift.name}) pada ${nextDateStr}.`,
          recommendation: `Pilih shift yang selesai sebelum shift berikutnya dimulai.`,
          detectedAt: new Date().toLocaleTimeString('id-ID'),
        };
      }

      const restMillis = range2.start.getTime() - range1.end.getTime();
      const restHours = Math.round((restMillis / (1000 * 60 * 60)) * 10) / 10;

      if (prospectiveShift.isNightShift && nextShift.code === 'PAGI' && restHours <= 1) {
        return {
          id: `preview-n2m-next-${employeeId}`,
          employeeId,
          employeeName,
          date: targetDate,
          shiftName: prospectiveShift.name,
          shiftCode: prospectiveShift.code,
          conflictingDate: nextDateStr,
          conflictingShiftName: nextShift.name,
          conflictingShiftCode: nextShift.code,
          severity: 'critical',
          type: 'night_to_morning',
          restHours,
          message: `Konflik Berbahaya (Malam ke Pagi): Jika memilih Shift Malam pada ${targetDate}, karyawan akan selesai pukul ${prospectiveShift.endTime} WIB dan langsung dinas Shift Pagi pada ${nextDateStr} (Jeda 0 jam).`,
          recommendation: `Ubah shift besok atau jangan berikan shift malam hari ini.`,
          detectedAt: new Date().toLocaleTimeString('id-ID'),
        };
      }

      if (restHours < 8) {
        return {
          id: `preview-rest-next-${employeeId}`,
          employeeId,
          employeeName,
          date: targetDate,
          shiftName: prospectiveShift.name,
          shiftCode: prospectiveShift.code,
          conflictingDate: nextDateStr,
          conflictingShiftName: nextShift.name,
          conflictingShiftCode: nextShift.code,
          severity: 'warning',
          type: 'insufficient_rest',
          restHours,
          message: `Jeda Istirahat Kurang: Jeda ke shift besok (${nextShift.name}) hanya ${restHours} jam (Minimal aman: 8 jam).`,
          recommendation: `Pilih shift yang memberikan jeda istirahat minimal 8 jam.`,
          detectedAt: new Date().toLocaleTimeString('id-ID'),
        };
      }
    }
  }

  return null;
}

export interface ShiftAssignmentUpdateContext {
  employeeId: string;
  employeeName?: string;
  date: string;
  shiftId: string;
  shiftName?: string;
  source?: 'cell_update' | 'pattern_applied' | 'conflict_resolved' | 'manual_audit';
}

export interface ShiftAuditNotificationPayload {
  title: string;
  message: string;
  type: 'system';
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

export interface AuditAndReportResult {
  auditReport: ShiftAuditReport;
  assignmentConflicts: ShiftConflictItem[];
  reportNotification: ShiftAuditNotificationPayload;
  summaryText: string;
  hasConflicts: boolean;
}

/**
 * Automatically runs a comprehensive check across the entire shiftSchedules array
 * to identify and report conflicting patterns whenever a manager updates an employee's shift assignment.
 *
 * @param schedules The entire updated array of employee shift schedules
 * @param shifts Master shift definitions
 * @param employees Employee records for department and naming context
 * @param updateContext Optional details of the specific assignment updated by the manager
 */
export function auditAndReportShiftConflicts(
  schedules: EmployeeShiftSchedule[],
  shifts: Shift[],
  employees?: Employee[],
  updateContext?: ShiftAssignmentUpdateContext
): AuditAndReportResult {
  // 1. Run complete audit across the entire shiftSchedules array
  const auditReport = auditShiftSchedules(schedules, shifts, employees);

  // 2. Identify if this specific update caused or intersects with any conflicts
  let assignmentConflicts: ShiftConflictItem[] = [];
  if (updateContext && updateContext.employeeId) {
    assignmentConflicts = auditReport.conflicts.filter(
      (c) =>
        c.employeeId === updateContext.employeeId &&
        (c.date === updateContext.date || c.conflictingDate === updateContext.date)
    );
  }

  // 3. Formulate structured reporting details for the manager / HR notification feed
  const empName = updateContext?.employeeName || 'Karyawan';
  const targetDate = updateContext?.date || 'jadwal';
  const nowTime = new Date().toLocaleTimeString('id-ID');

  let title = 'Laporan Audit Jadwal Shift';
  let message = '';
  let severity: 'critical' | 'warning' | 'info' = 'info';

  if (assignmentConflicts.length > 0) {
    const topConflict = assignmentConflicts[0];
    severity = topConflict.severity;
    title = `⚠️ Peringatan Konflik Pola Shift (${topConflict.severity === 'critical' ? 'KRITIS' : 'PERINGATAN'})`;
    message = `[Pemeriksaan Otomatis] Pembaruan shift ${empName} (${targetDate}) memicu konflik: ${topConflict.message} (Total ${auditReport.totalConflicts} konflik terdeteksi pada seluruh sistem).`;
  } else if (auditReport.hasConflicts) {
    title = `⚠️ Audit Sistem: ${auditReport.totalConflicts} Konflik Shift Terdeteksi`;
    message = `[Pemeriksaan Otomatis] Pembaruan shift ${empName} pada ${targetDate} berhasil disimpan. Sistem mendeteksi total ${auditReport.totalConflicts} konflik jadwal aktif (${auditReport.criticalCount} kritis, ${auditReport.warningCount} peringatan) pada ${auditReport.affectedEmployeesCount} karyawan.`;
    severity = auditReport.criticalCount > 0 ? 'critical' : 'warning';
  } else {
    title = `✓ Jadwal Terverifikasi Aman (${auditReport.totalSchedulesScanned} Penugasan)`;
    message = `[Pemeriksaan Otomatis] Pembaruan shift ${empName} pada ${targetDate} sukses. Seluruh ${auditReport.totalSchedulesScanned} jadwal penugasan karyawan terverifikasi bebas konflik dan memenuhi standar istirahat kerja (K3 & Depnaker).`;
    severity = 'info';
  }

  // 4. Traceable audit logging
  if (typeof console !== 'undefined' && console.info) {
    console.info(
      `[ShiftScheduleAuditor] Scanned ${schedules.length} schedules across ${employees?.length || 0} employees. Conflicts identified: ${auditReport.totalConflicts} (Critical: ${auditReport.criticalCount}, Warning: ${auditReport.warningCount}). Action by manager for: ${empName} on ${targetDate}.`
    );
  }

  return {
    auditReport,
    assignmentConflicts,
    reportNotification: {
      title,
      message,
      type: 'system',
      severity,
      timestamp: nowTime,
    },
    summaryText: auditReport.summaryMessage,
    hasConflicts: auditReport.hasConflicts,
  };
}
