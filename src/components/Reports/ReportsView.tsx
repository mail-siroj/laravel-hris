import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  Users,
  Clock,
  CalendarDays,
  Timer,
  Wallet,
} from 'lucide-react';
import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  OvertimeRequest,
  PayrollRecord,
  Department,
} from '../../types/hris';
import { formatRupiah, downloadCSV, formatDateIndo } from '../../utils/formatters';

interface ReportsViewProps {
  employees: Employee[];
  attendances: AttendanceRecord[];
  leaves: LeaveRequest[];
  overtimes: OvertimeRequest[];
  payrolls: PayrollRecord[];
  departments: Department[];
}

type ReportType = 'employees' | 'attendance' | 'leaves' | 'overtime' | 'payroll';

export const ReportsView: React.FC<ReportsViewProps> = ({
  employees,
  attendances,
  leaves,
  overtimes,
  payrolls,
  departments,
}) => {
  const [activeReport, setActiveReport] = useState<ReportType>('employees');
  const [selectedDept, setSelectedDept] = useState('all');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Export to Excel
  const handleExportCSV = () => {
    if (activeReport === 'employees') {
      const headers = ['ID', 'NIK', 'Nama', 'Departemen', 'Jabatan', 'Status', 'Gaji Pokok', 'Email', 'No Telp'];
      const rows = employees
        .filter((e) => selectedDept === 'all' || e.departmentId === selectedDept)
        .map((e) => [
          e.employeeId,
          e.nik,
          e.name,
          e.departmentName,
          e.positionName,
          e.status,
          e.baseSalary,
          e.email,
          e.phone,
        ]);
      downloadCSV(`Laporan_Karyawan_${endDate}`, rows, headers);
    } else if (activeReport === 'attendance') {
      const headers = ['Tanggal', 'ID', 'Nama', 'Departemen', 'Jam Masuk', 'Jam Pulang', 'Status', 'Validasi Kantor', 'Catatan'];
      const rows = attendances
        .filter((a) => !startDate || a.date >= startDate)
        .filter((a) => !endDate || a.date <= endDate)
        .map((a) => [
          a.date,
          a.employeeCode,
          a.employeeName,
          a.departmentName,
          a.clockIn || '-',
          a.clockOut || '-',
          a.status,
          a.officeVerified ? 'Valid HQ' : 'Di Luar Area',
          a.notes || '',
        ]);
      downloadCSV(`Laporan_Absensi_${startDate}_sd_${endDate}`, rows, headers);
    } else if (activeReport === 'leaves') {
      const headers = ['ID', 'Nama', 'Departemen', 'Jenis Cuti', 'Tgl Mulai', 'Tgl Selesai', 'Total Hari', 'Status', 'Alasan'];
      const rows = leaves
        .filter((l) => !startDate || l.startDate >= startDate)
        .map((l) => [
          l.employeeCode,
          l.employeeName,
          l.departmentName,
          l.leaveType,
          l.startDate,
          l.endDate,
          l.totalDays,
          l.status,
          l.reason,
        ]);
      downloadCSV(`Laporan_Cuti_${startDate}_sd_${endDate}`, rows, headers);
    } else if (activeReport === 'overtime') {
      const headers = ['Tanggal', 'ID', 'Nama', 'Departemen', 'Mulai', 'Selesai', 'Total Jam', 'Upah Lembur', 'Status', 'Alasan'];
      const rows = overtimes
        .filter((o) => !startDate || o.date >= startDate)
        .map((o) => [
          o.date,
          o.employeeCode,
          o.employeeName,
          o.departmentName,
          o.startTime,
          o.endTime,
          o.totalHours,
          o.estimatedPay,
          o.status,
          o.reason,
        ]);
      downloadCSV(`Laporan_Lembur_${startDate}_sd_${endDate}`, rows, headers);
    } else if (activeReport === 'payroll') {
      const headers = ['Bulan/Tahun', 'ID', 'Nama', 'Departemen', 'Gaji Pokok', 'Tunjangan', 'Lembur', 'Potongan BPJS', 'PPh 21', 'THP'];
      const rows = payrolls.map((p) => [
        `${p.month}/${p.year}`,
        p.employeeCode,
        p.employeeName,
        p.departmentName,
        p.baseSalary,
        p.allowanceTransport + p.allowanceMeal + p.allowancePosition,
        p.overtimePay,
        p.bpjsKesehatan + p.bpjsKetenagakerjaan,
        p.pph21Tax,
        p.netSalary,
      ]);
      downloadCSV(`Laporan_Payroll_Rekap`, rows, headers);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              PUSAT LAPORAN & EKSPOR
            </span>
            <span className="text-xs text-slate-500">Format Excel (CSV) & Printable PDF</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            Laporan Terpadu SDM & Kepatuhan Audit
          </h2>
          <p className="text-xs text-slate-500">
            Generate dan unduh rekapitulasi data kepegawaian, absensi GPS, cuti, lembur, serta payroll.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'employees', label: '1. Laporan Karyawan', icon: Users },
          { id: 'attendance', label: '2. Laporan Absensi', icon: Clock },
          { id: 'leaves', label: '3. Laporan Cuti', icon: CalendarDays },
          { id: 'overtime', label: '4. Laporan Lembur', icon: Timer },
          { id: 'payroll', label: '5. Laporan Payroll', icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as ReportType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
            Filter Departemen
          </label>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
            Tanggal Dari
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
            Tanggal Sampai
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Preview Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs overflow-hidden print-container">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Pratinjau Data Laporan ({activeReport.toUpperCase()})
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            Rentang Periode: {startDate} s/d {endDate}
          </p>
        </div>

        <div className="overflow-x-auto text-xs">
          {activeReport === 'employees' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">ID Karyawan</th>
                  <th className="py-2.5 px-3">NIK</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">Departemen</th>
                  <th className="py-2.5 px-3">Jabatan</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Gaji Pokok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees
                  .filter((e) => selectedDept === 'all' || e.departmentId === selectedDept)
                  .map((e) => (
                    <tr key={e.id}>
                      <td className="py-2 px-3 font-mono">{e.employeeId}</td>
                      <td className="py-2 px-3 font-mono">{e.nik}</td>
                      <td className="py-2 px-3 font-semibold">{e.name}</td>
                      <td className="py-2 px-3">{e.departmentName}</td>
                      <td className="py-2 px-3">{e.positionName}</td>
                      <td className="py-2 px-3">{e.status}</td>
                      <td className="py-2 px-3 font-mono font-medium">{formatRupiah(e.baseSalary)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeReport === 'attendance' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">ID Karyawan</th>
                  <th className="py-2.5 px-3">Nama Karyawan</th>
                  <th className="py-2.5 px-3">Jam Masuk</th>
                  <th className="py-2.5 px-3">Jam Pulang</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Validasi Kantor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {attendances
                  .filter((a) => !startDate || a.date >= startDate)
                  .filter((a) => !endDate || a.date <= endDate)
                  .map((a) => (
                    <tr key={a.id}>
                      <td className="py-2 px-3 font-mono">{a.date}</td>
                      <td className="py-2 px-3 font-mono">{a.employeeCode}</td>
                      <td className="py-2 px-3 font-semibold">{a.employeeName}</td>
                      <td className="py-2 px-3 font-mono">{a.clockIn || '-'}</td>
                      <td className="py-2 px-3 font-mono">{a.clockOut || '-'}</td>
                      <td className="py-2 px-3">
                        <span className="font-bold">{a.status}</span>
                      </td>
                      <td className="py-2 px-3">{a.officeVerified ? 'HQ Wisma HR' : '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeReport === 'leaves' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Nama Karyawan</th>
                  <th className="py-2.5 px-3">Jenis Cuti</th>
                  <th className="py-2.5 px-3">Mulai</th>
                  <th className="py-2.5 px-3">Selesai</th>
                  <th className="py-2.5 px-3">Durasi</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Alasan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 px-3 font-semibold">{l.employeeName}</td>
                    <td className="py-2 px-3">{l.leaveType}</td>
                    <td className="py-2 px-3 font-mono">{l.startDate}</td>
                    <td className="py-2 px-3 font-mono">{l.endDate}</td>
                    <td className="py-2 px-3 font-mono font-bold">{l.totalDays} Hari</td>
                    <td className="py-2 px-3 font-mono uppercase">{l.status}</td>
                    <td className="py-2 px-3">{l.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'payroll' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Periode</th>
                  <th className="py-2.5 px-3">Nama Karyawan</th>
                  <th className="py-2.5 px-3">Gaji Pokok</th>
                  <th className="py-2.5 px-3">Tunjangan</th>
                  <th className="py-2.5 px-3">Upah Lembur</th>
                  <th className="py-2.5 px-3">Potongan BPJS & Pajak</th>
                  <th className="py-2.5 px-3">Gaji Bersih (THP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payrolls.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 font-mono">
                      {p.month}/{p.year}
                    </td>
                    <td className="py-2 px-3 font-semibold">{p.employeeName}</td>
                    <td className="py-2 px-3 font-mono">{formatRupiah(p.baseSalary)}</td>
                    <td className="py-2 px-3 font-mono">
                      {formatRupiah(p.allowanceTransport + p.allowanceMeal + p.allowancePosition)}
                    </td>
                    <td className="py-2 px-3 font-mono text-emerald-600 font-semibold">
                      {formatRupiah(p.overtimePay)}
                    </td>
                    <td className="py-2 px-3 font-mono text-rose-600 font-semibold">
                      -{formatRupiah(p.totalDeductions)}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {formatRupiah(p.netSalary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
