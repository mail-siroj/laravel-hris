import React, { useState } from 'react';
import { Timer, Plus, CheckCircle2, XCircle, Clock, ShieldCheck, DollarSign } from 'lucide-react';
import { OvertimeRequest, Employee, UserRole } from '../../types/hris';
import { formatRupiah } from '../../utils/formatters';

interface OvertimeViewProps {
  overtimes: OvertimeRequest[];
  currentEmployee: Employee;
  allEmployees: Employee[];
  currentRole: UserRole;
  onApplyOvertime: (ot: OvertimeRequest) => void;
  onApproveOvertime: (otId: string, level: 'manager' | 'hr', note?: string) => void;
  onRejectOvertime: (otId: string) => void;
}

export const OvertimeView: React.FC<OvertimeViewProps> = ({
  overtimes,
  currentEmployee,
  allEmployees,
  currentRole,
  onApplyOvertime,
  onApproveOvertime,
  onRejectOvertime,
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:00');
  const [reason, setReason] = useState('');

  // Calculate hours
  const calculateHours = (start: string, end: string): number => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const totalMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
    return Math.max(0.5, Math.round((totalMinutes / 60) * 10) / 10);
  };

  const hours = calculateHours(startTime, endTime);
  const hourlyRate = currentEmployee.baseSalary / 173; // Depnaker formula
  // Depnaker: first hour 1.5x, next hours 2.0x
  const estimatedPay = Math.round(
    ((Math.min(1, hours) * 1.5) + (Math.max(0, hours - 1) * 2.0)) * hourlyRate
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    const newOt: OvertimeRequest = {
      id: `ot-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeCode: currentEmployee.employeeId,
      departmentName: currentEmployee.departmentName,
      date,
      startTime,
      endTime,
      totalHours: hours,
      reason,
      rateMultiplier: hours > 1 ? 2.0 : 1.5,
      estimatedPay,
      status: 'pending',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    onApplyOvertime(newOt);
    setShowApplyModal(false);
    setReason('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Klaim Lembur (Overtime Management)
            </h2>
            <p className="text-xs text-slate-500">
              Perhitungan kompensasi upah lembur resmi: Formula 1/173 × Gaji Pokok (Kepmenakertrans No. 102/2004)
            </p>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajukan Lembur</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3 font-mono">Rentang Jam</th>
                <th className="py-3 px-2 font-mono">Total Jam</th>
                <th className="py-3 px-4">Tugas & Alasan</th>
                <th className="py-3 px-3">Estimasi Upah</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Otorisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {overtimes.map((ot) => {
                const canApproveManager =
                  (currentRole === 'manager' || currentRole === 'super_admin') &&
                  ot.status === 'pending';
                const canApproveHR =
                  (currentRole === 'hr_manager' || currentRole === 'super_admin') &&
                  ot.status === 'manager_approved';
                const canReject =
                  (currentRole === 'manager' || currentRole === 'hr_manager' || currentRole === 'super_admin') &&
                  (ot.status === 'pending' || ot.status === 'manager_approved');

                return (
                  <tr
                    key={ot.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {ot.employeeName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {ot.employeeCode} · {ot.departmentName}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-mono">{ot.date}</td>
                    <td className="py-3 px-3 font-mono">
                      {ot.startTime} - {ot.endTime}
                    </td>
                    <td className="py-3 px-2 font-mono font-bold text-slate-900 dark:text-white">
                      {ot.totalHours} Jam
                    </td>
                    <td className="py-3 px-4 max-w-xs text-slate-600 dark:text-slate-300">
                      {ot.reason}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                      {formatRupiah(ot.estimatedPay)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {ot.status === 'pending' && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Menunggu Manager
                        </span>
                      )}
                      {ot.status === 'manager_approved' && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          Menunggu HR
                        </span>
                      )}
                      {ot.status === 'approved' && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Disetujui
                        </span>
                      )}
                      {ot.status === 'rejected' && (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          Ditolak
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {canApproveManager && (
                          <button
                            onClick={() => onApproveOvertime(ot.id, 'manager')}
                            className="px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px]"
                          >
                            Approve Mgr
                          </button>
                        )}
                        {canApproveHR && (
                          <button
                            onClick={() => onApproveOvertime(ot.id, 'hr')}
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                          >
                            Approve HR
                          </button>
                        )}
                        {canReject && (
                          <button
                            onClick={() => onRejectOvertime(ot.id)}
                            className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 text-[11px] font-semibold"
                          >
                            Tolak
                          </button>
                        )}
                        {!canApproveManager && !canApproveHR && !canReject && (
                          <span className="text-[11px] text-slate-400">Selesai</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Apply Overtime */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Pengajuan Surat Perintah Kerja Lembur (SPKL)
              </h4>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Tanggal Lembur *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Jam Mulai (WIB)
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Jam Selesai (WIB)
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Total Jam Lembur:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {hours} Jam
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span>Estimasi Upah Lembur:</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(estimatedPay)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Basis: Gaji Pokok {formatRupiah(currentEmployee.baseSalary)} / 173 jam
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Uraian Pekerjaan / Alasan Lembur *
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Deskripsikan output pekerjaan darurat/kritis yang diselesaikan..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
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
                  Kirim SPKL Lembur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
