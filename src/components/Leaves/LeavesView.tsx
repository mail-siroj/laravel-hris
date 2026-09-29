import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Paperclip,
  ShieldCheck,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { LeaveRequest, Employee, LeaveType, UserRole } from '../../types/hris';
import { formatDateIndo } from '../../utils/formatters';

interface LeavesViewProps {
  leaves: LeaveRequest[];
  currentEmployee: Employee;
  allEmployees: Employee[];
  currentRole: UserRole;
  onApplyLeave: (leave: LeaveRequest) => void;
  onApproveLeave: (leaveId: string, level: 'manager' | 'hr', note?: string) => void;
  onRejectLeave: (leaveId: string, note?: string) => void;
}

export const LeavesView: React.FC<LeavesViewProps> = ({
  leaves,
  currentEmployee,
  allEmployees,
  currentRole,
  onApplyLeave,
  onApproveLeave,
  onRejectLeave,
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('Cuti Tahunan');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // Action Note Modal
  const [selectedActionLeave, setSelectedActionLeave] = useState<{
    leave: LeaveRequest;
    action: 'approve_manager' | 'approve_hr' | 'reject';
  } | null>(null);
  const [actionNote, setActionNote] = useState('');

  // Calculate days difference
  const calculateDays = (start: string, end: string): number => {
    try {
      const d1 = new Date(start);
      const d2 = new Date(end);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) ? 1 : Math.max(1, diffDays);
    } catch {
      return 1;
    }
  };

  const currentDuration = calculateDays(startDate, endDate);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeCode: currentEmployee.employeeId,
      departmentName: currentEmployee.departmentName,
      leaveType,
      startDate,
      endDate,
      totalDays: currentDuration,
      reason,
      attachmentName: attachmentName || (leaveType === 'Cuti Sakit' ? 'surat_keterangan_dokter.pdf' : undefined),
      status: 'pending',
      managerId: currentEmployee.managerId,
      managerName: currentEmployee.managerName,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    onApplyLeave(newLeave);
    setShowApplyModal(false);
    setReason('');
    setAttachmentName('');
  };

  const handleConfirmAction = () => {
    if (!selectedActionLeave) return;
    const { leave, action } = selectedActionLeave;

    if (action === 'approve_manager') {
      onApproveLeave(leave.id, 'manager', actionNote || 'Disetujui di tingkat Departemen');
    } else if (action === 'approve_hr') {
      onApproveLeave(leave.id, 'hr', actionNote || 'Persetujuan Final HR disetujui');
    } else if (action === 'reject') {
      onRejectLeave(leave.id, actionNote || 'Permohonan cuti tidak dapat disetujui');
    }

    setSelectedActionLeave(null);
    setActionNote('');
  };

  // Filter leaves
  const filteredLeaves = leaves.filter((l) => {
    // If staff employee, view only self
    if (currentRole === 'employee') {
      if (l.employeeId !== currentEmployee.id) return false;
    }
    const matchType = filterType === 'all' || l.leaveType === filterType;
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Quota Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Hak Cuti Tahunan</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {currentEmployee.leaveBalance?.remaining ?? 10}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              / {currentEmployee.leaveBalance?.annual ?? 12} Hari
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Terpakai: {currentEmployee.leaveBalance?.taken ?? 2} hari tahun 2026
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Cuti Sakit</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              Sesuai SKD
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Wajib melampirkan surat keterangan dokter
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Cuti Melahirkan</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              3 Bulan
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            UU Ketenagakerjaan No. 13/2003
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Cuti Khusus</span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              2 - 3 Hari
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Pernikahan, khitanan, musibah keluarga
          </p>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Alur Persetujuan Cuti Karyawan
            </h2>
            <p className="text-xs text-slate-500">
              Sistem persetujuan berjenjang: Pengajuan &rarr; Approval Manager &rarr; Approval HRD Final
            </p>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajukan Cuti Baru</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">Semua Jenis Cuti</option>
            <option value="Cuti Tahunan">Cuti Tahunan</option>
            <option value="Cuti Sakit">Cuti Sakit</option>
            <option value="Cuti Melahirkan">Cuti Melahirkan</option>
            <option value="Cuti Khusus">Cuti Khusus</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">Semua Status Persetujuan</option>
            <option value="pending">Menunggu Approval Manager (Tingkat 1)</option>
            <option value="manager_approved">Menunggu Approval HR (Tingkat 2)</option>
            <option value="approved">Disetujui Final (Approved)</option>
            <option value="rejected">Ditolak (Rejected)</option>
          </select>
        </div>

        {/* Leaves Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-3">Jenis Cuti</th>
                <th className="py-3 px-3">Periode Cuti</th>
                <th className="py-3 px-2 font-mono">Durasi</th>
                <th className="py-3 px-4">Alasan & Lampiran</th>
                <th className="py-3 px-3">Status Alur Kerja</th>
                <th className="py-3 px-4 text-right">Tindakan Otorisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ada permohonan cuti dalam daftar ini.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => {
                  const canApproveManager =
                    (currentRole === 'manager' || currentRole === 'super_admin') &&
                    leave.status === 'pending';
                  const canApproveHR =
                    (currentRole === 'hr_manager' || currentRole === 'super_admin') &&
                    leave.status === 'manager_approved';
                  const canReject =
                    (currentRole === 'manager' || currentRole === 'hr_manager' || currentRole === 'super_admin') &&
                    (leave.status === 'pending' || leave.status === 'manager_approved');

                  return (
                    <tr
                      key={leave.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {leave.employeeName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {leave.employeeCode} · {leave.departmentName}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium">
                        <span className="text-indigo-600 dark:text-indigo-400">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono whitespace-nowrap">
                        {leave.startDate} s/d {leave.endDate}
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-slate-900 dark:text-white">
                        {leave.totalDays} Hari
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-600 dark:text-slate-300">
                          {leave.reason}
                        </p>
                        {leave.attachmentName && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-indigo-500 font-mono">
                            <Paperclip className="w-3 h-3" />
                            <span>{leave.attachmentName}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {leave.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                            <Clock className="w-3 h-3" />
                            Menunggu Manager
                          </span>
                        )}
                        {leave.status === 'manager_approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                            <ShieldCheck className="w-3 h-3" />
                            Menunggu HR
                          </span>
                        )}
                        {leave.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Disetujui Final
                          </span>
                        )}
                        {leave.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                            <XCircle className="w-3 h-3" />
                            Ditolak
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {canApproveManager && (
                            <button
                              onClick={() =>
                                setSelectedActionLeave({
                                  leave,
                                  action: 'approve_manager',
                                })
                              }
                              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-2xs"
                            >
                              Approve Manager
                            </button>
                          )}

                          {canApproveHR && (
                            <button
                              onClick={() =>
                                setSelectedActionLeave({
                                  leave,
                                  action: 'approve_hr',
                                })
                              }
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-2xs"
                            >
                              Approve HR Final
                            </button>
                          )}

                          {canReject && (
                            <button
                              onClick={() =>
                                setSelectedActionLeave({
                                  leave,
                                  action: 'reject',
                                })
                              }
                              className="px-2.5 py-1 rounded bg-rose-100 dark:bg-rose-950 hover:bg-rose-200 text-rose-700 dark:text-rose-300 font-semibold text-[11px]"
                            >
                              Tolak
                            </button>
                          )}

                          {!canApproveManager && !canApproveHR && !canReject && (
                            <span className="text-[11px] text-slate-400">
                              {leave.status === 'approved' ? 'Telah Selesai' : 'Diproses'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Pengajuan Permohonan Cuti
              </h4>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Pemohon
                </label>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium">
                  {currentEmployee.name} ({currentEmployee.employeeId}) · Sisa Cuti:{' '}
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {currentEmployee.leaveBalance?.remaining ?? 10} Hari
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Jenis Cuti *
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Cuti Tahunan">Cuti Tahunan (Potong Kuota)</option>
                  <option value="Cuti Sakit">Cuti Sakit (Lampiran Surat Dokter)</option>
                  <option value="Cuti Melahirkan">Cuti Melahirkan (3 Bulan)</option>
                  <option value="Cuti Khusus">Cuti Khusus (Pernikahan, Duka Cita, dll)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Tanggal Selesai *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 flex items-center justify-between font-mono">
                <span>Total Durasi Cuti:</span>
                <span className="font-bold text-sm">{currentDuration} Hari Kerja</span>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Alasan Pengajuan Cuti *
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan keperluan cuti..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Nama Berkas Lampiran (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: surat_dokter_klinik_medika.pdf"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Kirim Pengajuan Cuti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Approval / Reject Confirmation Modal */}
      {selectedActionLeave && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedActionLeave.action === 'reject'
                  ? 'Konfirmasi Penolakan Cuti'
                  : selectedActionLeave.action === 'approve_manager'
                  ? 'Approval Cuti Tingkat 1 (Manager)'
                  : 'Approval Cuti Tingkat 2 (HR Director Final)'}
              </h4>
              <button
                onClick={() => setSelectedActionLeave(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                {selectedActionLeave.leave.employeeName}
              </div>
              <div className="text-[11px] text-slate-500">
                {selectedActionLeave.leave.leaveType} · {selectedActionLeave.leave.totalDays} Hari (
                {selectedActionLeave.leave.startDate} s/d {selectedActionLeave.leave.endDate})
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1">
                "{selectedActionLeave.leave.reason}"
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Catatan Otorisator (Opsional)
              </label>
              <textarea
                rows={2}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Tuliskan catatan verifikasi..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedActionLeave(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-1.5 rounded-lg text-white font-semibold ${
                  selectedActionLeave.action === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {selectedActionLeave.action === 'reject' ? 'Tolak Pengajuan' : 'Setujui Permohonan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
