import React, { useState } from 'react';
import { Award, Plus, Star, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';
import { PerformanceAppraisal, Employee, UserRole } from '../../types/hris';

interface PerformanceViewProps {
  appraisals: PerformanceAppraisal[];
  employees: Employee[];
  currentRole: UserRole;
  currentEmployee: Employee;
  onAddAppraisal: (appraisal: PerformanceAppraisal) => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  appraisals,
  employees,
  currentRole,
  currentEmployee,
  onAddAppraisal,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [targetEmployeeId, setTargetEmployeeId] = useState(employees[0]?.id || '');
  const [period, setPeriod] = useState('Q3 2026');

  // Scores (1-100)
  const [attendanceScore, setAttendanceScore] = useState(90);
  const [disciplineScore, setDisciplineScore] = useState(88);
  const [teamworkScore, setTeamworkScore] = useState(92);
  const [productivityScore, setProductivityScore] = useState(90);
  const [communicationScore, setCommunicationScore] = useState(85);

  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');

  // Weighted formula: Kehadiran 20%, Disiplin 20%, Kerja Sama 20%, Produktivitas 25%, Komunikasi 15%
  const finalScore =
    attendanceScore * 0.2 +
    disciplineScore * 0.2 +
    teamworkScore * 0.2 +
    productivityScore * 0.25 +
    communicationScore * 0.15;

  const getGrade = (score: number): 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang' => {
    if (score >= 85) return 'Sangat Baik';
    if (score >= 75) return 'Baik';
    if (score >= 60) return 'Cukup';
    return 'Kurang';
  };

  const grade = getGrade(finalScore);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === targetEmployeeId);
    if (!emp) return;

    const newAppraisal: PerformanceAppraisal = {
      id: `kpi-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeCode: emp.employeeId,
      departmentName: emp.departmentName,
      positionName: emp.positionName,
      evaluatorId: currentEmployee.id,
      evaluatorName: currentEmployee.name,
      period,
      attendanceScore,
      disciplineScore,
      teamworkScore,
      productivityScore,
      communicationScore,
      finalScore: Math.round(finalScore * 100) / 100,
      grade,
      strengths: strengths || 'Dedikasi kerja sangat tinggi dan proaktif berkontribusi.',
      improvements: improvements || 'Pertahankan ritme kerja dan perluas kolaborasi lintas tim.',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddAppraisal(newAppraisal);
    setShowModal(false);
  };

  const canEvaluate =
    currentRole === 'super_admin' || currentRole === 'hr_manager' || currentRole === 'manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              PENILAIAN KINERJA (KPI 360)
            </span>
            <span className="text-xs text-slate-500">5 Pilar Kompetensi & Pembobotan Resmi</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            Evaluasi Performa & Rapor Karyawan
          </h2>
          <p className="text-xs text-slate-500">
            Kategori: Kehadiran (20%), Disiplin (20%), Kerja Sama (20%), Produktivitas (25%), dan Komunikasi (15%).
          </p>
        </div>

        {canEvaluate && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Input Penilaian Baru</span>
          </button>
        )}
      </div>

      {/* Cards of Appraisals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {appraisals.map((app) => (
          <div
            key={app.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {app.employeeName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {app.employeeCode} · {app.positionName}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    app.grade === 'Sangat Baik'
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                      : app.grade === 'Baik'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : app.grade === 'Cukup'
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {app.grade}
                </span>
              </div>

              {/* Big Score Number */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Nilai Tertimbang Akhir
                  </span>
                  <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                    {app.finalScore}{' '}
                    <span className="text-xs text-slate-400 font-normal">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono">Periode:</span>
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    {app.period}
                  </div>
                </div>
              </div>

              {/* 5 Progress Bars */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-500">Kehadiran (20%)</span>
                    <span className="font-mono font-bold">{app.attendanceScore}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${app.attendanceScore}%` }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-500">Disiplin (20%)</span>
                    <span className="font-mono font-bold">{app.disciplineScore}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${app.disciplineScore}%` }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-500">Kerja Sama Tim (20%)</span>
                    <span className="font-mono font-bold">{app.teamworkScore}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${app.teamworkScore}%` }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-500">Produktivitas (25%)</span>
                    <span className="font-mono font-bold">{app.productivityScore}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${app.productivityScore}%` }}
                      className="h-full bg-purple-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-500">Komunikasi (15%)</span>
                    <span className="font-mono font-bold">{app.communicationScore}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${app.communicationScore}%` }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-1 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-emerald-600">Kelebihan:</span> {app.strengths}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-amber-600">Perbaikan:</span> {app.improvements}
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <span>Penilai: {app.evaluatorName.split(',')[0]}</span>
              <span>{app.createdAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Form Penilaian Kinerja Karyawan (KPI)
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Pilih Karyawan Dinilai *
                  </label>
                  <select
                    value={targetEmployeeId}
                    onChange={(e) => setTargetEmployeeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.positionName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Periode Kuartal
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Q3 2026">Q3 2026</option>
                    <option value="Q4 2026">Q4 2026</option>
                    <option value="Tahunan 2026">Tahunan 2026</option>
                  </select>
                </div>
              </div>

              {/* Sliders for 5 categories */}
              <div className="space-y-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Kehadiran (Bobot: 20%)</span>
                    <span className="font-mono text-indigo-600">{attendanceScore} / 100</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={attendanceScore}
                    onChange={(e) => setAttendanceScore(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Disiplin & Kepatuhan (Bobot: 20%)</span>
                    <span className="font-mono text-indigo-600">{disciplineScore} / 100</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={disciplineScore}
                    onChange={(e) => setDisciplineScore(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Kerja Sama & Soliditas (Bobot: 20%)</span>
                    <span className="font-mono text-indigo-600">{teamworkScore} / 100</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={teamworkScore}
                    onChange={(e) => setTeamworkScore(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Produktivitas & Kualitas Output (Bobot: 25%)</span>
                    <span className="font-mono text-indigo-600">{productivityScore} / 100</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={productivityScore}
                    onChange={(e) => setProductivityScore(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-semibold">
                    <span>Komunikasi & Inisiatif (Bobot: 15%)</span>
                    <span className="font-mono text-indigo-600">{communicationScore} / 100</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={communicationScore}
                    onChange={(e) => setCommunicationScore(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold">
                  <span>Hasil Tertimbang:</span>
                  <div className="text-right">
                    <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400">
                      {Math.round(finalScore * 100) / 100} ({grade})
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Kekuatan / Hal Unggul Karyawan
                </label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Catatan kelebihan dan prestasi karyawan..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Area Pengingkatan / Saran Pengembangan
                </label>
                <textarea
                  rows={2}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="Aspek yang perlu dilatih atau diperbaiki..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Simpan Penilaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
