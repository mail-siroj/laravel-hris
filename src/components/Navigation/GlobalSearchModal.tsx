import React, { useState, useEffect } from 'react';
import { Search, User, Building2, Briefcase, FileText, ArrowRight } from 'lucide-react';
import { Employee, Department, Position } from '../../types/hris';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  departments: Department[];
  positions: Position[];
  onSelectResult: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  employees,
  departments,
  positions,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const matchedEmployees = query.trim()
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.employeeId.toLowerCase().includes(query.toLowerCase()) ||
          e.nik.includes(query) ||
          e.email.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchedDepartments = query.trim()
    ? departments.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.code.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchedPositions = query.trim()
    ? positions.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.code.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-2">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Cari cepat karyawan, NIK, divisi, atau jabatan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
          >
            ESC
          </button>
        </div>

        <div className="p-3 max-h-80 overflow-y-auto space-y-4 text-xs">
          {!query.trim() ? (
            <div className="py-8 text-center text-slate-400">
              Ketik nama karyawan, nomor induk, atau departemen untuk mencari...
            </div>
          ) : (
            <>
              {matchedEmployees.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Karyawan ({matchedEmployees.length})
                  </span>
                  <div className="mt-1 space-y-1">
                    {matchedEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          onSelectResult('employees');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <img
                            src={emp.photo}
                            alt={emp.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {emp.name}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {emp.employeeId} · {emp.departmentName}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedDepartments.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Departemen ({matchedDepartments.length})
                  </span>
                  <div className="mt-1 space-y-1">
                    {matchedDepartments.map((dept) => (
                      <button
                        key={dept.id}
                        onClick={() => {
                          onSelectResult('departments');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Building2 className="w-4 h-4 text-indigo-500" />
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {dept.name} ({dept.code})
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedPositions.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Jabatan ({matchedPositions.length})
                  </span>
                  <div className="mt-1 space-y-1">
                    {matchedPositions.map((pos) => (
                      <button
                        key={pos.id}
                        onClick={() => {
                          onSelectResult('positions');
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Briefcase className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold text-slate-900 dark:text-white truncate">
                            {pos.name} ({pos.code})
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {matchedEmployees.length === 0 &&
                matchedDepartments.length === 0 &&
                matchedPositions.length === 0 && (
                  <div className="py-6 text-center text-slate-500">
                    Tidak ditemukan hasil untuk "{query}".
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
