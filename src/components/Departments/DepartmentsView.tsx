import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, Users, Wallet } from 'lucide-react';
import { Department, Employee, UserRole } from '../../types/hris';
import { formatRupiah } from '../../utils/formatters';

interface DepartmentsViewProps {
  departments: Department[];
  employees: Employee[];
  currentRole: UserRole;
  onAddDepartment: (dept: Department) => void;
  onUpdateDepartment: (dept: Department) => void;
  onDeleteDepartment: (deptId: string) => void;
}

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
  employees,
  currentRole,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [budget, setBudget] = useState<number>(500000000);

  const canManage = currentRole === 'super_admin' || currentRole === 'hr_manager';

  const handleOpenCreate = () => {
    setEditingDept(null);
    setCode('');
    setName('');
    setDescription('');
    setManagerId(employees[0]?.id || '');
    setBudget(500000000);
    setShowModal(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setCode(dept.code);
    setName(dept.name);
    setDescription(dept.description);
    setManagerId(dept.managerId || '');
    setBudget(dept.budget || 500000000);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mgr = employees.find((e) => e.id === managerId);

    if (editingDept) {
      onUpdateDepartment({
        ...editingDept,
        code,
        name,
        description,
        managerId: mgr?.id,
        managerName: mgr?.name,
        budget,
      });
    } else {
      const newDept: Department = {
        id: `dept-${Date.now()}`,
        code: code.toUpperCase(),
        name,
        description,
        managerId: mgr?.id,
        managerName: mgr?.name,
        budget,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddDepartment(newDept);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Modul Departemen & Struktur Organisasi
          </h2>
          <p className="text-xs text-slate-500">
            Daftar departemen operasional, pimpinan divisi, dan alokasi anggaran
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Departemen</span>
          </button>
        )}
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const members = employees.filter((e) => e.departmentId === dept.id);

          return (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {dept.code}
                      </span>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1 rounded text-slate-400 hover:text-amber-600"
                        title="Edit Departemen"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(`Hapus departemen ${dept.name}?`)
                          ) {
                            onDeleteDepartment(dept.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                        title="Hapus Departemen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {dept.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-3.5 h-3.5" /> Jumlah Anggota:
                  </span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {members.length} Karyawan
                  </span>
                </div>

                {dept.budget && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Wallet className="w-3.5 h-3.5" /> Anggaran:
                    </span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      {formatRupiah(dept.budget)}
                    </span>
                  </div>
                )}

                {dept.managerName && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    Kepala Divisi: <span className="font-medium text-slate-800 dark:text-slate-200">{dept.managerName}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {editingDept ? 'Edit Departemen' : 'Tambah Departemen'}
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Kode Departemen (Singkatan) *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="Contoh: ITE, HRD, FIN"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Nama Departemen Resmi *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Human Resources & Talent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Pimpinan / Kepala Departemen
                </label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Pilih Manager...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.positionName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Alokasi Anggaran (IDR)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Deskripsi Tanggung Jawab
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Uraian tugas fungsi departemen..."
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
                  Simpan Departemen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
