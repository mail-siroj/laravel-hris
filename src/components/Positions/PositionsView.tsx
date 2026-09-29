import React, { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2, Building2, Layers } from 'lucide-react';
import { Position, Department, UserRole } from '../../types/hris';
import { formatRupiah } from '../../utils/formatters';

interface PositionsViewProps {
  positions: Position[];
  departments: Department[];
  currentRole: UserRole;
  onAddPosition: (pos: Position) => void;
  onUpdatePosition: (pos: Position) => void;
  onDeletePosition: (posId: string) => void;
}

export const PositionsView: React.FC<PositionsViewProps> = ({
  positions,
  departments,
  currentRole,
  onAddPosition,
  onUpdatePosition,
  onDeletePosition,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [level, setLevel] = useState<'Staff' | 'Senior' | 'Lead' | 'Manager' | 'Director'>('Staff');
  const [baseSalaryMin, setBaseSalaryMin] = useState(8000000);
  const [baseSalaryMax, setBaseSalaryMax] = useState(14000000);
  const [description, setDescription] = useState('');

  const canManage = currentRole === 'super_admin' || currentRole === 'hr_manager';

  const handleOpenCreate = () => {
    setEditingPos(null);
    setCode('');
    setName('');
    setDepartmentId(departments[0]?.id || '');
    setLevel('Staff');
    setBaseSalaryMin(8000000);
    setBaseSalaryMax(14000000);
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEdit = (pos: Position) => {
    setEditingPos(pos);
    setCode(pos.code);
    setName(pos.name);
    setDepartmentId(pos.departmentId);
    setLevel(pos.level);
    setBaseSalaryMin(pos.baseSalaryMin);
    setBaseSalaryMax(pos.baseSalaryMax);
    setDescription(pos.description);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === departmentId);

    if (editingPos) {
      onUpdatePosition({
        ...editingPos,
        code,
        name,
        departmentId,
        departmentName: dept?.name,
        level,
        baseSalaryMin,
        baseSalaryMax,
        description,
      });
    } else {
      const newPos: Position = {
        id: `pos-${Date.now()}`,
        code: code.toUpperCase(),
        name,
        departmentId,
        departmentName: dept?.name,
        level,
        baseSalaryMin,
        baseSalaryMax,
        description,
      };
      onAddPosition(newPos);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Master Jabatan & Jenjang Karir
          </h2>
          <p className="text-xs text-slate-500">
            Daftar posisi jabatan, grade level karir, dan rentang kompensasi gaji pokok
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Jabatan</span>
          </button>
        )}
      </div>

      {/* Positions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Nama Jabatan</th>
                <th className="py-3 px-3">Departemen</th>
                <th className="py-3 px-3">Level Grade</th>
                <th className="py-3 px-3">Rentang Gaji Pokok</th>
                <th className="py-3 px-4">Deskripsi Peran</th>
                {canManage && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {positions.map((pos) => (
                <tr
                  key={pos.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {pos.code}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {pos.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {pos.departmentName}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        pos.level === 'Director'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                          : pos.level === 'Manager'
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                          : pos.level === 'Lead'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                          : pos.level === 'Senior'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {pos.level}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-900 dark:text-white font-medium whitespace-nowrap">
                    {formatRupiah(pos.baseSalaryMin)} - {formatRupiah(pos.baseSalaryMax)}
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                    {pos.description}
                  </td>
                  {canManage && (
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(pos)}
                          className="p-1 rounded text-slate-400 hover:text-amber-600"
                          title="Edit Jabatan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus jabatan ${pos.name}?`)) {
                              onDeletePosition(pos.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                          title="Hapus Jabatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingPos ? 'Edit Master Jabatan' : 'Tambah Jabatan Baru'}
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
                    Kode Jabatan *
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="Contoh: FE-ENG"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Level Grade
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Staff">Staff</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Manager">Manager</option>
                    <option value="Director">Director</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Nama Jabatan Resmi *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Senior Frontend Engineer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Departemen Penempatan *
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Rentang Min Gaji (IDR)
                  </label>
                  <input
                    type="number"
                    value={baseSalaryMin}
                    onChange={(e) => setBaseSalaryMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Rentang Max Gaji (IDR)
                  </label>
                  <input
                    type="number"
                    value={baseSalaryMax}
                    onChange={(e) => setBaseSalaryMax(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Uraian Tanggung Jawab
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Ringkasan tugas pokok posisi ini..."
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
                  Simpan Jabatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
