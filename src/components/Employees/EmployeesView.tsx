import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  Eye,
  Edit2,
  Trash2,
  Building2,
  Briefcase,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle,
} from 'lucide-react';
import { Employee, Department, Position, UserRole } from '../../types/hris';
import { formatRupiah, formatDateIndo, downloadCSV } from '../../utils/formatters';

interface EmployeesViewProps {
  employees: Employee[];
  departments: Department[];
  positions: Position[];
  currentRole: UserRole;
  onAddEmployee: (emp: Employee) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  departments,
  positions,
  currentRole,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedDetailEmployee, setSelectedDetailEmployee] = useState<Employee | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Form State
  const initialFormState: Partial<Employee> = {
    nik: '',
    name: '',
    birthPlace: 'Jakarta',
    birthDate: '1995-05-15',
    gender: 'Laki-laki',
    maritalStatus: 'Belum Menikah',
    email: '',
    phone: '',
    address: '',
    departmentId: departments[0]?.id || '',
    positionId: positions[0]?.id || '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'Tetap',
    baseSalary: 12000000,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'employee',
  };
  const [formData, setFormData] = useState<Partial<Employee>>(initialFormState);

  // Open Create Modal with Auto ID
  const handleOpenCreate = () => {
    setEditingEmployee(null);
    const year = new Date().getFullYear();
    const count = employees.length + 1;
    const autoId = `EMP-${year}-${String(count).padStart(3, '0')}`;
    setFormData({
      ...initialFormState,
      employeeId: autoId,
      departmentId: departments[0]?.id,
      positionId: positions[0]?.id,
    });
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({ ...emp });
    setShowAddEditModal(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.nik) return;

    const selectedDept = departments.find((d) => d.id === formData.departmentId);
    const selectedPos = positions.find((p) => p.id === formData.positionId);

    if (editingEmployee) {
      const updated: Employee = {
        ...(editingEmployee as Employee),
        ...(formData as Employee),
        departmentName: selectedDept?.name || editingEmployee.departmentName,
        positionName: selectedPos?.name || editingEmployee.positionName,
      };
      onUpdateEmployee(updated);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        employeeId: formData.employeeId || `EMP-2026-${String(employees.length + 1).padStart(3, '0')}`,
        nik: formData.nik || '3171000000000000',
        name: formData.name || '',
        birthPlace: formData.birthPlace || 'Jakarta',
        birthDate: formData.birthDate || '1995-01-01',
        gender: formData.gender as any || 'Laki-laki',
        maritalStatus: formData.maritalStatus as any || 'Belum Menikah',
        email: formData.email || '',
        phone: formData.phone || '',
        address: formData.address || '',
        departmentId: formData.departmentId || departments[0]?.id,
        departmentName: selectedDept?.name || 'Umum',
        positionId: formData.positionId || positions[0]?.id,
        positionName: selectedPos?.name || 'Staff',
        joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
        status: formData.status as any || 'Tetap',
        baseSalary: Number(formData.baseSalary) || 10000000,
        photo:
          formData.photo ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        role: formData.role || 'employee',
        leaveBalance: { annual: 12, taken: 0, remaining: 12 },
      };
      onAddEmployee(newEmp);
    }

    setShowAddEditModal(false);
  };

  // Export to Excel (CSV)
  const handleExportCSV = () => {
    const headers = [
      'Employee ID',
      'NIK',
      'Nama Lengkap',
      'Departemen',
      'Jabatan',
      'Status Karyawan',
      'Tanggal Masuk',
      'Gaji Pokok (IDR)',
      'Email',
      'Nomor Telepon',
      'Alamat',
    ];
    const rows = filteredEmployees.map((e) => [
      e.employeeId,
      e.nik,
      e.name,
      e.departmentName,
      e.positionName,
      e.status,
      e.joinDate,
      e.baseSalary,
      e.email,
      e.phone,
      e.address,
    ]);
    downloadCSV(`Master_Data_Karyawan_${new Date().toISOString().split('T')[0]}`, rows, headers);
  };

  // Export to Printable PDF
  const handleExportPDF = () => {
    window.print();
  };

  // Mock Import Excel
  const handleSimulateImport = () => {
    const year = new Date().getFullYear();
    const mockImported: Employee = {
      id: `emp-imp-${Date.now()}`,
      employeeId: `EMP-${year}-${String(employees.length + 1).padStart(3, '0')}`,
      nik: '3174092109960009',
      name: 'Ir. Hendra Gunawan, M.T. (Imported)',
      birthPlace: 'Semarang',
      birthDate: '1993-02-18',
      gender: 'Laki-laki',
      maritalStatus: 'Menikah',
      email: 'hendra.gunawan@nexahris.co.id',
      phone: '0812-3344-5566',
      address: 'Jl. Fatmawati Raya No. 44, Cilandak, Jakarta Selatan',
      departmentId: departments[0]?.id || 'dept-1',
      departmentName: departments[0]?.name || 'IT & Engineering',
      positionId: positions[0]?.id || 'pos-1',
      positionName: 'DevOps & Cloud Engineer',
      joinDate: '2026-09-01',
      status: 'Tetap',
      baseSalary: 18000000,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      role: 'employee',
      leaveBalance: { annual: 12, taken: 0, remaining: 12 },
    };
    onAddEmployee(mockImported);
    setShowImportModal(false);
    setImportNotification('Berhasil mengimpor 1 data karyawan dari berkas Excel XLSX.');
    setTimeout(() => setImportNotification(null), 4000);
  };

  // Filter
  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nik.includes(searchTerm) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter === 'all' || emp.departmentId === deptFilter;
    const matchStatus = statusFilter === 'all' || emp.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {importNotification && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{importNotification}</span>
          </div>
          <button onClick={() => setImportNotification(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Database Karyawan Perusahaan
            </h2>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredEmployees.length} dari total {employees.length} karyawan terdaftar
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(currentRole === 'super_admin' || currentRole === 'hr_manager') && (
              <>
                <button
                  onClick={handleOpenCreate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Karyawan</span>
                </button>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Import Excel</span>
                </button>
              </>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-rose-500" />
              <span>Export PDF / Cetak</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, NIK, ID, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Semua Departemen</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Semua Status Karyawan</option>
            <option value="Tetap">Karyawan Tetap</option>
            <option value="Kontrak">PKWT (Kontrak)</option>
            <option value="Probation">Probation</option>
            <option value="Magang">Magang</option>
          </select>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-3">NIK</th>
                <th className="py-3 px-3">Departemen & Jabatan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Tgl Masuk</th>
                <th className="py-3 px-3">Gaji Pokok</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data karyawan yang memenuhi kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.photo}
                          alt={emp.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <button
                            onClick={() => setSelectedDetailEmployee(emp)}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left truncate block"
                          >
                            {emp.name}
                          </button>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {emp.employeeId} · {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      {emp.nik}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-[200px]">
                        {emp.positionName}
                      </div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400">
                        {emp.departmentName}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          emp.status === 'Tetap'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            : emp.status === 'Kontrak'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono">
                      {emp.joinDate}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                      {formatRupiah(emp.baseSalary)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedDetailEmployee(emp)}
                          title="Lihat Detail Profil"
                          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {(currentRole === 'super_admin' || currentRole === 'hr_manager') && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              title="Edit Karyawan"
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-amber-600"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Apakah Anda yakin ingin menghapus data karyawan ${emp.name}?`
                                  )
                                ) {
                                  onDeleteEmployee(emp.id);
                                }
                              }}
                              title="Hapus Karyawan"
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Employee ID (Otomatis)
                  </label>
                  <input
                    type="text"
                    value={formData.employeeId}
                    disabled
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    NIK (16 Digit KTP) *
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Status Pernikahan
                  </label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) =>
                      setFormData({ ...formData, maritalStatus: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Belum Menikah">Belum Menikah</option>
                    <option value="Menikah">Menikah</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Email Korporat *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Alamat Lengkap Domisili
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Departemen
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Jabatan
                  </label>
                  <select
                    value={formData.positionId}
                    onChange={(e) => setFormData({ ...formData, positionId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Status Kontrak
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Tetap">Tetap</option>
                    <option value="Kontrak">Kontrak</option>
                    <option value="Probation">Probation</option>
                    <option value="Magang">Magang</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Gaji Pokok Bulanan (IDR)
                  </label>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, baseSalary: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    URL Foto Profil
                  </label>
                  <input
                    type="text"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  {editingEmployee ? 'Simpan Perubahan' : 'Daftarkan Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Detail Drawer / Modal */}
      {selectedDetailEmployee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDetailEmployee.photo}
                  alt={selectedDetailEmployee.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/40"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedDetailEmployee.name}
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {selectedDetailEmployee.positionName} · {selectedDetailEmployee.departmentName}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400">
                    ID: {selectedDetailEmployee.employeeId} · NIK: {selectedDetailEmployee.nik}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailEmployee(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">Status Kepegawaian</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedDetailEmployee.status}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">Tanggal Masuk</span>
                <p className="font-bold font-mono text-slate-900 dark:text-white">
                  {selectedDetailEmployee.joinDate}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">Gaji Pokok</span>
                <p className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {formatRupiah(selectedDetailEmployee.baseSalary)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">Sisa Kuota Cuti</span>
                <p className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedDetailEmployee.leaveBalance?.remaining ?? 12} Hari (dari 12)
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">Status Pernikahan</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedDetailEmployee.maritalStatus}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">BPJS Ketenagakerjaan</span>
                <p className="font-bold font-mono text-slate-900 dark:text-white text-[11px] truncate">
                  {selectedDetailEmployee.bpjsKetenagakerjaanNo || 'Aktif'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedDetailEmployee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedDetailEmployee.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{selectedDetailEmployee.address}</span>
              </div>
              {selectedDetailEmployee.bankAccount && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {selectedDetailEmployee.bankAccount.bankName} -{' '}
                    <span className="font-mono">
                      {selectedDetailEmployee.bankAccount.accountNumber}
                    </span>{' '}
                    (a.n. {selectedDetailEmployee.bankAccount.accountHolder})
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedDetailEmployee(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Import Data Karyawan (Excel)
              </h4>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-500">
              Unggah file spreadsheet format <code>.xlsx</code> atau <code>.csv</code> sesuai template
              standar NEXA-HRIS (Kolom: NIK, Nama, Email, Gaji, dll).
            </p>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center space-y-2">
              <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                Pilih atau seret file Excel ke sini
              </p>
              <p className="text-[11px] text-slate-400">Template_Karyawan_NEXA_v4.xlsx (Max 5MB)</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSimulateImport}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                Proses Import (Simulasi)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
