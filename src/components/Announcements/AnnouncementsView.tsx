import React, { useState } from 'react';
import { Megaphone, Plus, Paperclip, Pin, Calendar, UserCheck } from 'lucide-react';
import { Announcement, UserRole, Employee } from '../../types/hris';
import { formatDateIndo } from '../../utils/formatters';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  currentRole: UserRole;
  currentEmployee: Employee;
  onAddAnnouncement: (ann: Announcement) => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  currentRole,
  currentEmployee,
  onAddAnnouncement,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetAudience, setTargetAudience] = useState<any>('all');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [attachmentName, setAttachmentName] = useState('');

  const canPublish = currentRole === 'super_admin' || currentRole === 'hr_manager';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const labels: Record<string, string> = {
      all: 'Seluruh Karyawan',
      ITE: 'Divisi IT & Engineering',
      HRD: 'Divisi Human Resources',
      FIN: 'Divisi Finance & Accounting',
      MKT: 'Divisi Marketing',
      OPS: 'Divisi Operations',
    };

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title,
      content,
      publishDate: new Date().toISOString().split('T')[0],
      targetAudience,
      targetAudienceLabel: labels[targetAudience] || 'Umum',
      priority,
      attachmentName: attachmentName || undefined,
      authorName: currentEmployee.name,
      authorRole: currentEmployee.positionName,
      isRead: true,
    };

    onAddAnnouncement(newAnn);
    setShowModal(false);
    setTitle('');
    setContent('');
    setAttachmentName('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Papan Pengumuman & Surat Edaran
          </h2>
          <p className="text-xs text-slate-500">
            Publikasi informasi resmi manajemen, edaran libur, regulasi, dan jadwal internal
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Pengumuman Baru</span>
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-xs space-y-3 transition-colors ${
              ann.priority === 'urgent'
                ? 'border-rose-200 dark:border-rose-900/50'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {ann.priority === 'urgent' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                    Penting / Urgent
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Target: {ann.targetAudienceLabel}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Diterbitkan: {formatDateIndo(ann.publishDate)}
              </div>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {ann.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {ann.content}
            </p>

            {ann.attachmentName && (
              <div className="pt-2">
                <a
                  href={`#download-${ann.attachmentName}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Mengunduh berkas lampiran resmi: ${ann.attachmentName}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 text-xs font-medium transition-colors"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Lampiran: {ann.attachmentName}</span>
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>
                Dipublikasikan oleh: <strong className="text-slate-700 dark:text-slate-300">{ann.authorName}</strong> ({ann.authorRole})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Create Announcement */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Buat Pengumuman Korporat Baru
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
                  Judul Pengumuman *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pemberitahuan Libur Bersama Idul Fitri"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Target Audiens
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="all">Seluruh Karyawan</option>
                    <option value="ITE">Divisi IT & Engineering</option>
                    <option value="HRD">Divisi HRD & Legal</option>
                    <option value="FIN">Divisi Finance</option>
                    <option value="MKT">Divisi Marketing</option>
                    <option value="OPS">Divisi Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Tingkat Prioritas
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="normal">Normal / Standar</option>
                    <option value="urgent">Mendesak / Urgent (Merah)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Isi Surat Edaran / Pengumuman *
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan isi pengumuman lengkap..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Nama Lampiran PDF/Dokumen (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: sk_direksi_kebijakan_wfh_2026.pdf"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
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
                  Publikasikan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
