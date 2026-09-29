import React, { useState } from 'react';
import {
  Wallet,
  Coins,
  FileText,
  Printer,
  Download,
  Calendar,
  Sparkles,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { PayrollRecord, Employee, OvertimeRequest, UserRole } from '../../types/hris';
import { formatRupiah, downloadCSV, formatDateIndo } from '../../utils/formatters';

interface PayrollViewProps {
  payrolls: PayrollRecord[];
  employees: Employee[];
  overtimes: OvertimeRequest[];
  currentRole: UserRole;
  currentEmployee: Employee;
  onGenerateMonthlyPayroll: (month: number, year: number) => void;
  onMarkPayrollPaid: (payrollId: string) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = ({
  payrolls,
  employees,
  overtimes,
  currentRole,
  currentEmployee,
  onGenerateMonthlyPayroll,
  onMarkPayrollPaid,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);

  const canManagePayroll = currentRole === 'super_admin' || currentRole === 'hr_manager';

  // Filter payrolls for chosen period
  const monthPayrolls = payrolls.filter(
    (p) => p.month === selectedMonth && p.year === selectedYear
  );

  // If role is staff employee, restrict view to only their records
  const visiblePayrolls =
    currentRole === 'employee'
      ? monthPayrolls.filter((p) => p.employeeId === currentEmployee.id)
      : monthPayrolls;

  // Aggregate totals
  const totalEarningsAll = visiblePayrolls.reduce((sum, p) => sum + p.totalEarnings, 0);
  const totalDeductionsAll = visiblePayrolls.reduce((sum, p) => sum + p.totalDeductions, 0);
  const totalNetAll = visiblePayrolls.reduce((sum, p) => sum + p.netSalary, 0);

  // Handle Generate
  const handleGenerate = () => {
    onGenerateMonthlyPayroll(selectedMonth, selectedYear);
  };

  // Export summary to CSV
  const handleExportSummaryCSV = () => {
    const headers = [
      'Bulan/Tahun',
      'Employee ID',
      'NIK',
      'Nama Karyawan',
      'Departemen',
      'Jabatan',
      'Gaji Pokok',
      'Tunjangan',
      'Lembur',
      'Bonus',
      'Total Bruto',
      'BPJS Kes (1%)',
      'BPJS TK (3%)',
      'PPh 21',
      'Total Potongan',
      'Gaji Bersih (THP)',
      'Status',
    ];
    const rows = visiblePayrolls.map((p) => [
      `${p.month}/${p.year}`,
      p.employeeCode,
      p.nik,
      p.employeeName,
      p.departmentName,
      p.positionName,
      p.baseSalary,
      p.allowanceTransport + p.allowanceMeal + p.allowancePosition,
      p.overtimePay,
      p.bonus,
      p.totalEarnings,
      p.bpjsKesehatan,
      p.bpjsKetenagakerjaan,
      p.pph21Tax,
      p.totalDeductions,
      p.netSalary,
      p.status,
    ]);
    downloadCSV(`Payroll_Summary_${selectedMonth}_${selectedYear}`, rows, headers);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Month Picker */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                MODUL PENGGAJIAN TERINTEGRASI
              </span>
              <span className="text-xs text-slate-500">Regulasi PP 58/2023 & BPJS RI</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Buku Besar Payroll & Slip Gaji Karyawan
            </h2>
            <p className="text-xs text-slate-500">
              Otomasi perhitungan gaji pokok, tunjangan jabatan, upah lembur, iuran BPJS Kesehatan (1%),
              BPJS TK (3%), dan tarif efektif rata-rata (TER) PPh 21.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 px-2 py-1 focus:outline-hidden"
              >
                <option value={8}>Agustus 2026</option>
                <option value={9}>September 2026</option>
                <option value={10}>Oktober 2026</option>
                <option value={11}>November 2026</option>
                <option value={12}>Desember 2026</option>
              </select>
            </div>

            {canManagePayroll && (
              <button
                onClick={handleGenerate}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Payroll Bulanan</span>
              </button>
            )}

            <button
              onClick={handleExportSummaryCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Rekap CSV</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards for this Month */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">Total Penghasilan Bruto</span>
            <div className="mt-1 text-xl font-bold font-mono text-slate-900 dark:text-white">
              {formatRupiah(totalEarningsAll)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Gaji Pokok + Tunjangan + Lembur + Bonus
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">Total Iuran & Pajak PPh21</span>
            <div className="mt-1 text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {formatRupiah(totalDeductionsAll)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              BPJS Kesehatan, BPJS TK, dan Pajak Terpotong
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              Total Gaji Bersih (Take Home Pay)
            </span>
            <div className="mt-1 text-xl font-bold font-mono text-indigo-900 dark:text-indigo-200">
              {formatRupiah(totalNetAll)}
            </div>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
              Disalurkan ke rekening bank karyawan
            </p>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Daftar Pembayaran Gaji ({visiblePayrolls.length} Karyawan)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Periode: Bulan {selectedMonth} / {selectedYear}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-3 font-mono">Gaji Pokok</th>
                <th className="py-3 px-3 font-mono">Tunjangan</th>
                <th className="py-3 px-3 font-mono">Lembur</th>
                <th className="py-3 px-3 font-mono">BPJS + Pajak</th>
                <th className="py-3 px-3 font-mono">Gaji Bersih (THP)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Slip Gaji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {visiblePayrolls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Belum ada payroll untuk periode ini. Klik "Generate Payroll Bulanan" untuk menghitung.
                  </td>
                </tr>
              ) : (
                visiblePayrolls.map((pay) => (
                  <tr
                    key={pay.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {pay.employeeName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {pay.employeeCode} · {pay.departmentName}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      {formatRupiah(pay.baseSalary)}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {formatRupiah(
                        pay.allowanceTransport + pay.allowanceMeal + pay.allowancePosition
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(pay.overtimePay)}
                    </td>
                    <td className="py-3 px-3 font-mono text-rose-600 dark:text-rose-400">
                      -{formatRupiah(pay.totalDeductions)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {formatRupiah(pay.netSalary)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          pay.status === 'paid'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {pay.status === 'paid' ? 'Lunas / Paid' : 'Draft / Published'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedSlip(pay)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] border border-indigo-200 dark:border-indigo-800 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Lihat Slip</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Gaji Modal (Full Indonesian Corporate Payslip Layout) */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6 my-8 print-container">
            {/* Header controls (Hidden during print) */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                Pratinjau Slip Gaji Karyawan
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Slip Document Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  PT NUSANTARA SOLUSI DIGITAL
                </h1>
                <p className="text-xs text-slate-600">
                  Wisma HR Pusat, Lt. 5, Jl. Jend. Sudirman Kav. 52, SCBD, Jakarta Selatan
                </p>
                <p className="text-[11px] text-slate-500">
                  NPWP Perusahaan: 01.892.481.2-019.000 · Telp: (021) 5299-8800
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold tracking-wider rounded">
                  SLIP GAJI
                </span>
                <p className="text-xs font-mono text-slate-600 mt-1 font-semibold">
                  Periode: Bulan {selectedSlip.month} / {selectedSlip.year}
                </p>
              </div>
            </div>

            {/* Employee Bio Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Nama:</span>
                  <span className="col-span-2 font-bold text-slate-900">{selectedSlip.employeeName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  <span className="text-slate-500">NIK (KTP):</span>
                  <span className="col-span-2 font-mono text-slate-700">{selectedSlip.nik}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  <span className="text-slate-500">ID Karyawan:</span>
                  <span className="col-span-2 font-mono text-slate-700">{selectedSlip.employeeCode}</span>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-slate-500">Departemen:</span>
                  <span className="col-span-2 font-bold text-slate-900">{selectedSlip.departmentName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  <span className="text-slate-500">Jabatan:</span>
                  <span className="col-span-2 text-slate-700">{selectedSlip.positionName}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  <span className="text-slate-500">Ref. Bayar:</span>
                  <span className="col-span-2 font-mono text-slate-700 text-[11px] truncate">
                    {selectedSlip.paymentReference || 'TRX-PAY-AUTO-OK'}
                  </span>
                </div>
              </div>
            </div>

            {/* Income & Deductions 2 Columns */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              {/* Earnings */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200">
                  A. Penerimaan (Earnings)
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gaji Pokok</span>
                    <span className="font-mono">{formatRupiah(selectedSlip.baseSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tunjangan Transportasi</span>
                    <span className="font-mono">{formatRupiah(selectedSlip.allowanceTransport)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tunjangan Uang Makan</span>
                    <span className="font-mono">{formatRupiah(selectedSlip.allowanceMeal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tunjangan Jabatan</span>
                    <span className="font-mono">{formatRupiah(selectedSlip.allowancePosition)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Upah Lembur Resmi</span>
                    <span className="font-mono text-emerald-700 font-semibold">
                      {formatRupiah(selectedSlip.overtimePay)}
                    </span>
                  </div>
                  {selectedSlip.bonus > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Bonus & Insentif Kinerja</span>
                      <span className="font-mono text-indigo-700 font-semibold">
                        {formatRupiah(selectedSlip.bonus)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                  <span>Total Penerimaan (A):</span>
                  <span className="font-mono">{formatRupiah(selectedSlip.totalEarnings)}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200">
                  B. Potongan (Deductions)
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-600">BPJS Kesehatan (1%)</span>
                    <span className="font-mono">{formatRupiah(selectedSlip.bpjsKesehatan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">BPJS Ketenagakerjaan (3%)</span>
                    <span className="font-mono">{formatRupiah(selectedSlip.bpjsKetenagakerjaan)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pajak PPh 21 TER</span>
                    <span className="font-mono text-rose-700">
                      {formatRupiah(selectedSlip.pph21Tax)}
                    </span>
                  </div>
                  {selectedSlip.unpaidLeaveDeduction > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Potongan Alpha/Cuti</span>
                      <span className="font-mono text-rose-700">
                        {formatRupiah(selectedSlip.unpaidLeaveDeduction)}
                      </span>
                    </div>
                  )}
                  {selectedSlip.otherDeductions > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Potongan Lainnya</span>
                      <span className="font-mono">{formatRupiah(selectedSlip.otherDeductions)}</span>
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-rose-700">
                  <span>Total Potongan (B):</span>
                  <span className="font-mono">-{formatRupiah(selectedSlip.totalDeductions)}</span>
                </div>
              </div>
            </div>

            {/* Total Take Home Pay Banner */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold">
                  GAJI BERSIH YANG DITERIMA (TAKE HOME PAY)
                </span>
                <p className="text-[11px] text-slate-400 italic">Formula: Penerimaan (A) - Potongan (B)</p>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {formatRupiah(selectedSlip.netSalary)}
              </div>
            </div>

            {/* Signatures & Verification */}
            <div className="grid grid-cols-2 gap-8 text-center text-xs pt-4 border-t border-slate-200">
              <div className="space-y-12">
                <p className="text-slate-500 font-medium">Diterima oleh Karyawan,</p>
                <div>
                  <div className="font-bold underline text-slate-900">{selectedSlip.employeeName}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{selectedSlip.employeeCode}</div>
                </div>
              </div>

              <div className="space-y-12">
                <p className="text-slate-500 font-medium">
                  Jakarta, {formatDateIndo(selectedSlip.paidAt || '2026-09-25')}
                  <br />
                  Departemen HR & Finance,
                </p>
                <div>
                  <div className="font-bold underline text-slate-900">Dewi Lestari, S.Psi., M.M.</div>
                  <div className="text-[10px] text-slate-500 font-mono">HR Operations Director</div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-400 italic pt-2">
              Dokumen ini dihasilkan secara otomatis oleh sistem NEXA-HRIS Enterprise v4 dan sah tanpa cap fisik basah.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
