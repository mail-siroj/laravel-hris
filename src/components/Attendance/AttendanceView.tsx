import React, { useState, useRef, useEffect } from 'react';
import {
  Clock,
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Filter,
  Download,
  Plus,
  ShieldCheck,
  Building,
  User,
  Sun,
  Sunset,
  Moon,
  Briefcase,
  AlertOctagon,
  Sparkles,
  Coffee,
  Check,
  FileCheck,
  ShieldAlert,
} from 'lucide-react';
import {
  AttendanceRecord,
  Employee,
  AttendanceStatus,
  UserRole,
  Shift,
  EmployeeShiftSchedule,
} from '../../types/hris';
import { OFFICE_COORDINATES } from '../../data/mockData';
import { calculateDistanceMeters, downloadCSV, formatDateIndo } from '../../utils/formatters';

interface AttendanceViewProps {
  attendances: AttendanceRecord[];
  currentEmployee: Employee;
  allEmployees: Employee[];
  currentRole: UserRole;
  shifts: Shift[];
  schedules: EmployeeShiftSchedule[];
  onRecordAttendance: (record: AttendanceRecord) => void;
  onAcknowledgeInvalidCheckIn?: (attendanceId: string, resolutionNote: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendances,
  currentEmployee,
  allEmployees,
  currentRole,
  shifts,
  schedules,
  onRecordAttendance,
  onAcknowledgeInvalidCheckIn,
}) => {
  // Geolocation & Selfie State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceToOffice, setDistanceToOffice] = useState<number | null>(null);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Camera State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Table filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [validityFilter, setValidityFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Selected Attendance Detail / Dispensation Modal State
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<AttendanceRecord | null>(null);
  const [dispensationNote, setDispensationNote] = useState('');

  // Manual Add Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualEmpId, setManualEmpId] = useState(allEmployees[0]?.id || '');
  const [manualShiftId, setManualShiftId] = useState(shifts[0]?.id || 'shift-reguler');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualClockIn, setManualClockIn] = useState('08:15');
  const [manualClockOut, setManualClockOut] = useState('17:30');
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('Hadir');
  const [manualNotes, setManualNotes] = useState('Entri koreksi manual oleh HR Admin');

  const todayStr = new Date().toISOString().split('T')[0];
  const myTodayRecord = attendances.find(
    (a) => a.employeeId === currentEmployee.id && a.date === todayStr
  );

  // Identify current employee's scheduled shift for today
  const myTodaySchedule = schedules.find(
    (s) => s.employeeId === currentEmployee.id && s.date === todayStr
  );
  const myAssignedShift =
    shifts.find((sh) => sh.id === myTodaySchedule?.shiftId) ||
    shifts.find((sh) => sh.code === 'REG') ||
    shifts[0];
  const isOffDayToday = myTodaySchedule?.isOffDay || myTodaySchedule?.shiftId === 'OFF';

  const canManage = currentRole === 'super_admin' || currentRole === 'hr_manager' || currentRole === 'manager';

  // Fetch or simulate geolocation
  const handleDetectLocation = (simulateHQ = false) => {
    setLocating(true);
    setLocationError(null);

    if (simulateHQ) {
      const mockLat = OFFICE_COORDINATES.latitude + 0.00005;
      const mockLng = OFFICE_COORDINATES.longitude + 0.00003;
      setUserLocation({ lat: mockLat, lng: mockLng });
      const dist = calculateDistanceMeters(
        mockLat,
        mockLng,
        OFFICE_COORDINATES.latitude,
        OFFICE_COORDINATES.longitude
      );
      setDistanceToOffice(dist);
      setLocating(false);
      return;
    }

    if (!navigator.geolocation) {
      setLocationError('Browser tidak mendukung geolokasi GPS.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        const dist = calculateDistanceMeters(
          lat,
          lng,
          OFFICE_COORDINATES.latitude,
          OFFICE_COORDINATES.longitude
        );
        setDistanceToOffice(dist);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        const mockLat = OFFICE_COORDINATES.latitude + 0.00008;
        const mockLng = OFFICE_COORDINATES.longitude + 0.00004;
        setUserLocation({ lat: mockLat, lng: mockLng });
        const dist = calculateDistanceMeters(
          mockLat,
          mockLng,
          OFFICE_COORDINATES.latitude,
          OFFICE_COORDINATES.longitude
        );
        setDistanceToOffice(dist);
        setLocationError('Izin GPS ditolak di iframe, dialihkan ke koordinat Wisma HR untuk pengujian.');
        setLocating(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 400, height: 400, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraActive(false);
      setCapturedSelfie(currentEmployee.photo);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const takePhotoSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedSelfie(dataUrl);
      }
      stopCamera();
    } else {
      setCapturedSelfie(currentEmployee.photo);
      stopCamera();
    }
  };

  useEffect(() => {
    handleDetectLocation(true);
    return () => stopCamera();
  }, []);

  const isInsideOffice =
    distanceToOffice !== null && distanceToOffice <= OFFICE_COORDINATES.radiusMeters;

  // Process Clock In with Shift Integration Validation
  const executeClockIn = (simulatedTimeStr?: string, forceOffDay?: boolean) => {
    const timeStr = simulatedTimeStr || new Date().toTimeString().split(' ')[0];
    const [hours, minutes] = timeStr.split(':').map(Number);
    const checkInMins = hours * 60 + minutes;

    const effectivelyOff = forceOffDay !== undefined ? forceOffDay : isOffDayToday;

    let isInvalidShift = false;
    let invalidReason = '';
    let status: AttendanceStatus = 'Hadir';
    let lateMinutes = 0;

    if (effectivelyOff) {
      isInvalidShift = true;
      invalidReason = 'Presensi di luar jadwal kerja (Hari ini terjadwal LIBUR / OFF DAY)';
      status = 'Alpha';
    } else {
      const [shH, shM] = myAssignedShift.startTime.split(':').map(Number);
      const shiftStartMins = shH * 60 + shM;
      const earliestAllowedMins = shiftStartMins - myAssignedShift.earlyCheckInToleranceMinutes;
      const lateThresholdMins = shiftStartMins + myAssignedShift.lateGraceMinutes;

      const [endH, endM] = myAssignedShift.endTime.split(':').map(Number);
      let shiftEndMins = endH * 60 + endM;
      if (myAssignedShift.isNightShift && shiftEndMins < shiftStartMins) {
        shiftEndMins += 24 * 60; // Cross midnight
      }

      if (checkInMins < earliestAllowedMins) {
        isInvalidShift = true;
        const diffHrs = Math.round(((shiftStartMins - checkInMins) / 60) * 10) / 10;
        invalidReason = `Check-in terlalu awal (${diffHrs} jam sebelum loket ${myAssignedShift.name} dibuka). Jam shift: ${myAssignedShift.startTime} - ${myAssignedShift.endTime} WIB.`;
        status = 'Hadir';
      } else if (checkInMins > lateThresholdMins) {
        status = 'Terlambat';
        lateMinutes = checkInMins - shiftStartMins;
      }
    }

    const noteText = isInvalidShift
      ? `PERINGATAN SHIFT: ${invalidReason}`
      : lateMinutes > 0
      ? `Terlambat ${lateMinutes} menit pada ${myAssignedShift.name}`
      : `Hadir tepat waktu (${myAssignedShift.name})`;

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeCode: currentEmployee.employeeId,
      departmentName: currentEmployee.departmentName,
      date: todayStr,
      clockIn: timeStr,
      clockOut: null,
      status,
      latitude: userLocation?.lat ?? OFFICE_COORDINATES.latitude,
      longitude: userLocation?.lng ?? OFFICE_COORDINATES.longitude,
      distanceMeters: distanceToOffice ?? 12,
      officeVerified: isInsideOffice,
      selfieUrl: capturedSelfie || currentEmployee.photo,
      notes: noteText,
      shiftId: myAssignedShift.id,
      shiftCode: effectivelyOff ? 'OFF' : myAssignedShift.code,
      shiftName: effectivelyOff ? 'Libur (OFF DAY)' : myAssignedShift.name,
      shiftStartTime: myAssignedShift.startTime,
      shiftEndTime: myAssignedShift.endTime,
      isOffDayCheckIn: effectivelyOff,
      isInvalidShiftCheckIn: isInvalidShift,
      invalidShiftReason: invalidReason || undefined,
      lateMinutes: lateMinutes > 0 ? lateMinutes : undefined,
    };

    onRecordAttendance(newRecord);
  };

  const handleClockIn = () => {
    executeClockIn();
  };

  // Process Clock Out
  const handleClockOut = () => {
    if (!myTodayRecord) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const updated: AttendanceRecord = {
      ...myTodayRecord,
      clockOut: timeStr,
      notes: (myTodayRecord.notes ? myTodayRecord.notes + ' · ' : '') + 'Pulang ' + timeStr,
    };

    onRecordAttendance(updated);
  };

  // Handle Manual Entry submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = allEmployees.find((e) => e.id === manualEmpId);
    if (!targetEmp) return;

    const chosenShift = shifts.find((s) => s.id === manualShiftId) || shifts[0];

    const newRec: AttendanceRecord = {
      id: `att-manual-${Date.now()}`,
      employeeId: targetEmp.id,
      employeeName: targetEmp.name,
      employeeCode: targetEmp.employeeId,
      departmentName: targetEmp.departmentName,
      date: manualDate,
      clockIn: manualClockIn ? `${manualClockIn}:00` : null,
      clockOut: manualClockOut ? `${manualClockOut}:00` : null,
      status: manualStatus,
      officeVerified: true,
      distanceMeters: 5,
      notes: manualNotes,
      shiftId: chosenShift.id,
      shiftCode: chosenShift.code,
      shiftName: chosenShift.name,
      shiftStartTime: chosenShift.startTime,
      shiftEndTime: chosenShift.endTime,
      isInvalidShiftCheckIn: false,
    };

    onRecordAttendance(newRec);
    setShowManualModal(false);
  };

  // Handle HR/Manager Dispensation / Override on Invalid Shift
  const handleApplyDispensation = () => {
    if (!selectedRecordForDetail) return;

    const updatedRecord: AttendanceRecord = {
      ...selectedRecordForDetail,
      isInvalidShiftCheckIn: false,
      notes: `${selectedRecordForDetail.notes || ''} [DISPENSASI DISETUJUI OLEH ${currentRole.toUpperCase()}: ${dispensationNote || 'Disetujui manajer shift'}]`,
    };

    if (onAcknowledgeInvalidCheckIn) {
      onAcknowledgeInvalidCheckIn(selectedRecordForDetail.id, dispensationNote);
    } else {
      onRecordAttendance(updatedRecord);
    }
    setSelectedRecordForDetail(null);
    setDispensationNote('');
  };

  // Filter attendances
  const filteredAttendances = attendances.filter((att) => {
    const matchSearch =
      att.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || att.status === statusFilter;
    const matchShift = shiftFilter === 'all' || att.shiftCode === shiftFilter;
    const matchValidity =
      validityFilter === 'all'
        ? true
        : validityFilter === 'invalid_only'
        ? att.isInvalidShiftCheckIn === true
        : att.isInvalidShiftCheckIn !== true;
    const matchDate = !dateFilter || att.date === dateFilter;
    return matchSearch && matchStatus && matchShift && matchValidity && matchDate;
  });

  const invalidCount = attendances.filter((a) => a.isInvalidShiftCheckIn).length;

  const exportCSV = () => {
    const headers = [
      'Tanggal',
      'Employee ID',
      'Nama Karyawan',
      'Departemen',
      'Jadwal Shift',
      'Jam Masuk',
      'Jam Pulang',
      'Status',
      'Validasi Shift',
      'Verifikasi Kantor',
      'Catatan',
    ];
    const rows = filteredAttendances.map((a) => [
      a.date,
      a.employeeCode,
      a.employeeName,
      a.departmentName,
      a.shiftName || 'Reguler',
      a.clockIn || '-',
      a.clockOut || '-',
      a.status,
      a.isInvalidShiftCheckIn ? `TIDAK VALID: ${a.invalidShiftReason}` : 'Valid',
      a.officeVerified ? 'Terverifikasi' : 'Di Luar Area',
      a.notes || '',
    ]);
    downloadCSV(`Rekap_Absensi_Shift_NEXA_${todayStr}`, rows, headers);
  };

  const getShiftIcon = (code?: string) => {
    switch (code) {
      case 'PAGI':
        return <Sun className="w-3.5 h-3.5 text-amber-500 inline mr-1" />;
      case 'SIANG':
        return <Sunset className="w-3.5 h-3.5 text-blue-500 inline mr-1" />;
      case 'MALAM':
        return <Moon className="w-3.5 h-3.5 text-purple-400 inline mr-1" />;
      case 'OFF':
        return <Coffee className="w-3.5 h-3.5 text-slate-400 inline mr-1" />;
      default:
        return <Briefcase className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Geofence & Shift Terminal */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Clock & Employee Status & Shift Tag */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                TERMINAL PRESENSI GEOFENCE GPS & VALIDASI SHIFT
              </span>
              <span className="text-xs text-slate-500">
                Waktu Server: <span className="font-mono font-bold">WIB (UTC+7)</span>
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Halo, {currentEmployee.name}
            </h2>
            <p className="text-xs text-slate-500">
              {currentEmployee.positionName} · {currentEmployee.departmentName} (
              <span className="font-mono">{currentEmployee.employeeId}</span>)
            </p>

            {/* Shift Assignment Bar */}
            <div className="mt-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                  {getShiftIcon(myAssignedShift.code)}
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Jadwal Shift Anda Hari Ini:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {isOffDayToday ? 'Hari Libur (OFF DAY)' : myAssignedShift.name}
                    </span>
                    {!isOffDayToday && (
                      <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-mono font-bold">
                        {myAssignedShift.startTime} - {myAssignedShift.endTime} WIB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isOffDayToday ? (
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800 block">
                      Loket Buka: -{myAssignedShift.earlyCheckInToleranceMinutes} mnt sebelum jam kerja
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Toleransi Keterlambatan: +{myAssignedShift.lateGraceMinutes} menit
                    </span>
                  </div>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono text-[11px] font-bold border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Terjadwal LIBUR (OFF) - Check-in akan ditandai Invalid
                  </span>
                )}
              </div>
            </div>

            {/* Geolocation verification card */}
            <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {OFFICE_COORDINATES.name}
                  </span>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Maks. Radius: {OFFICE_COORDINATES.radiusMeters} meter
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isInsideOffice ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Dalam Jangkauan ({distanceToOffice}m)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    Di Luar Radius ({distanceToOffice ?? '---'}m)
                  </span>
                )}

                <button
                  onClick={() => handleDetectLocation(false)}
                  disabled={locating}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-[11px] hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  {locating ? 'Mendeteksi...' : 'Refresh GPS'}
                </button>

                <button
                  onClick={() => handleDetectLocation(true)}
                  className="px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 text-indigo-700 dark:text-indigo-300 text-[11px] hover:bg-indigo-100 transition-colors"
                  title="Gunakan koordinat resmi Wisma HR SCBD untuk uji coba"
                >
                  Simulasi Di Kantor (HQ)
                </button>
              </div>
            </div>

            {locationError && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                {locationError}
              </p>
            )}
          </div>

          {/* Right: Camera / Selfie capture preview & Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 shrink-0">
            {/* Selfie Preview Frame */}
            <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-slate-900 border-2 border-indigo-500/50 flex items-center justify-center shrink-0">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : capturedSelfie ? (
                <img
                  src={capturedSelfie}
                  alt="Selfie Presensi"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2">
                  <Camera className="w-6 h-6 text-slate-400 mx-auto" />
                  <span className="text-[10px] text-slate-400">Selfie Wajah</span>
                </div>
              )}

              {cameraActive && (
                <button
                  onClick={takePhotoSnapshot}
                  className="absolute bottom-1 bg-white text-slate-900 text-[9px] font-bold px-2 py-0.5 rounded shadow"
                >
                  Snapshot
                </button>
              )}
            </div>

            {/* Camera triggers & Check-In Buttons */}
            <div className="space-y-2 w-full sm:w-auto">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-100 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{capturedSelfie ? 'Foto Ulang' : 'Buka Kamera'}</span>
                </button>
              ) : (
                <button
                  onClick={takePhotoSnapshot}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Ambil Foto</span>
                </button>
              )}

              {/* Clock In / Clock Out Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleClockIn}
                  disabled={!!myTodayRecord?.clockIn}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                    myTodayRecord?.clockIn
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{myTodayRecord?.clockIn ? `Sudah (${myTodayRecord.clockIn})` : 'Check In'}</span>
                </button>

                <button
                  onClick={handleClockOut}
                  disabled={!myTodayRecord?.clockIn || !!myTodayRecord?.clockOut}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                    !myTodayRecord?.clockIn || myTodayRecord?.clockOut
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{myTodayRecord?.clockOut ? `Pulang (${myTodayRecord.clockOut})` : 'Check Out'}</span>
                </button>
              </div>

              {myTodayRecord && (
                <div className="text-[11px] font-mono text-center text-slate-500 space-y-0.5">
                  <div>
                    Status:{' '}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {myTodayRecord.status}
                    </span>
                  </div>
                  {myTodayRecord.isInvalidShiftCheckIn && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                      ⚠️ Di Luar Jadwal Shift
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Simulation Test Bar for Shift Validation */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Panel Uji Simulasi Validasi Shift & Flagging Invalid Check-In:
            </span>
            <span className="text-[10px] text-slate-400">
              Gunakan untuk menguji aturan validasi shift terhadap presensi secara instan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <button
              onClick={() => executeClockIn('06:45:00', false)}
              className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Simulasi Valid (06:45 WIB)
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                Check-in tepat di jendela shift (Lolos validasi)
              </div>
            </button>

            <button
              onClick={() => executeClockIn('07:35:00', false)}
              className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Simulasi Terlambat (07:35 WIB)
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                Lewati batas toleransi (Status: Terlambat)
              </div>
            </button>

            <button
              onClick={() => executeClockIn('04:15:00', false)}
              className="p-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                Simulasi Terlalu Dini (04:15 WIB)
              </div>
              <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">
                Sebelum loket buka (Ditandai INVALID SHIFT)
              </div>
            </button>

            <button
              onClick={() => executeClockIn('08:30:00', true)}
              className="p-2.5 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100 text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-purple-600" />
                Simulasi Saat Libur (OFF DAY)
              </div>
              <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
                Check-in hari libur (Ditandai INVALID SHIFT)
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance History Section with Shift Integration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Log Presensi & Validasi Jadwal Shift
              </h3>
              {invalidCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300">
                  {invalidCount} Presensi Invalid
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Total {filteredAttendances.length} catatan presensi tersimpan (Dilengkapi deteksi otomatis invalid check-in dan dispensasi manajer)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(currentRole === 'super_admin' || currentRole === 'hr_manager') && (
              <button
                onClick={() => setShowManualModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Entri Manual</span>
              </button>
            )}

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Cari nama karyawan, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Semua Status</option>
            <option value="Hadir">Hadir Tepat Waktu</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Izin">Izin</option>
            <option value="Sakit">Sakit</option>
            <option value="Alpha">Alpha</option>
          </select>

          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Semua Shift</option>
            <option value="PAGI">Shift Pagi (07:00)</option>
            <option value="SIANG">Shift Siang (15:00)</option>
            <option value="MALAM">Shift Malam (23:00)</option>
            <option value="REG">Non-Shift Reguler (08:30)</option>
            <option value="OFF">Hari Libur (OFF)</option>
          </select>

          <select
            value={validityFilter}
            onChange={(e) => setValidityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-medium"
          >
            <option value="all">Validitas Jadwal (Semua)</option>
            <option value="invalid_only">⚠️ Hanya Di Luar Shift (Invalid)</option>
            <option value="valid_only">Hanya Sesuai Jadwal (Valid)</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Jadwal Shift</th>
                <th className="py-3 px-3 font-mono">Jam Masuk</th>
                <th className="py-3 px-3 font-mono">Jam Pulang</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Validasi Shift & Geofence</th>
                <th className="py-3 px-4">Catatan / Detail</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data presensi yang sesuai kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((att) => (
                  <tr
                    key={att.id}
                    className={`transition-colors ${
                      att.isInvalidShiftCheckIn
                        ? 'bg-rose-50/60 dark:bg-rose-950/25 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {att.employeeName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {att.employeeCode} · {att.departmentName}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {formatDateIndo(att.date)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                        {getShiftIcon(att.shiftCode)}
                        <span>{att.shiftCode || 'REG'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {att.shiftStartTime ? `${att.shiftStartTime} - ${att.shiftEndTime}` : '08:30 - 17:30'}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {att.clockIn || '-'}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                      {att.clockOut || '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          att.status === 'Hadir'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : att.status === 'Terlambat'
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            : att.status === 'Izin' || att.status === 'Sakit'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {att.isInvalidShiftCheckIn ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                            <AlertOctagon className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                            <span>Di Luar Jadwal Shift</span>
                          </span>
                          {att.invalidShiftReason && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 line-clamp-1">
                              {att.invalidShiftReason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Shift Valid ({att.officeVerified ? 'HQ SCBD' : 'GPS OK'})</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {att.notes || '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedRecordForDetail(att)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 transition-colors"
                      >
                        Detail Audit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Shift Audit & Dispensation Details */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className={`p-2 rounded-xl ${
                    selectedRecordForDetail.isInvalidShiftCheckIn
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                  }`}
                >
                  {selectedRecordForDetail.isInvalidShiftCheckIn ? (
                    <AlertOctagon className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Audit Presensi & Verifikasi Shift
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {selectedRecordForDetail.employeeName} ({selectedRecordForDetail.employeeCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Shift Comparison Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Tanggal Presensi:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatDateIndo(selectedRecordForDetail.date)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Shift Terjadwal:</span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  {getShiftIcon(selectedRecordForDetail.shiftCode)}
                  {selectedRecordForDetail.shiftName || 'Reguler'} ({selectedRecordForDetail.shiftStartTime || '08:30'} - {selectedRecordForDetail.shiftEndTime || '17:30'} WIB)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Jam Check-In Aktual:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedRecordForDetail.clockIn || 'Belum Check-In'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Lokasi / Jarak Geofence:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {selectedRecordForDetail.distanceMeters ?? 10} meter dari kantor ({selectedRecordForDetail.officeVerified ? 'Terverifikasi' : 'Di Luar Radius'})
                </span>
              </div>
            </div>

            {/* Validation Flag Status */}
            {selectedRecordForDetail.isInvalidShiftCheckIn ? (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 space-y-1.5">
                <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  FLAG: Check-In Tidak Sesuai Jadwal Shift!
                </div>
                <p className="text-rose-700 dark:text-rose-300 text-[11px] leading-relaxed">
                  {selectedRecordForDetail.invalidShiftReason}
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Presensi ini sah dan memenuhi semua parameter jadwal shift kerja.</span>
              </div>
            )}

            {/* Manager Dispensation Action Form */}
            {selectedRecordForDetail.isInvalidShiftCheckIn && canManage && (
              <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-indigo-600" />
                  Otorisasi Manajer / Beri Dispensasi Shift:
                </span>
                <input
                  type="text"
                  placeholder="Catatan alasan dispensasi (misal: Perintah lembur darurat dari manager)..."
                  value={dispensationNote}
                  onChange={(e) => setDispensationNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleApplyDispensation}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Validasi & Berikan Dispensasi Khusus</span>
                </button>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Entri Koreksi Presensi & Shift Manual
              </h4>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Pilih Karyawan
                </label>
                <select
                  value={manualEmpId}
                  onChange={(e) => setManualEmpId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                >
                  {allEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.employeeId} - {e.departmentName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Jadwal Shift Penugasan
                </label>
                <select
                  value={manualShiftId}
                  onChange={(e) => setManualShiftId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.startTime} - {s.endTime} WIB)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Tanggal Presensi
                </label>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Jam Masuk (HH:mm)
                  </label>
                  <input
                    type="time"
                    value={manualClockIn}
                    onChange={(e) => setManualClockIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Jam Pulang (HH:mm)
                  </label>
                  <input
                    type="time"
                    value={manualClockOut}
                    onChange={(e) => setManualClockOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Status Presensi
                </label>
                <select
                  value={manualStatus}
                  onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpha">Alpha</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Alasan Koreksi / Catatan HR
                </label>
                <textarea
                  rows={2}
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Contoh: Lupa tapping scanner, dinas luar kantor..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Simpan Koreksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
