/**
 * Documents Page Content
 *
 * Full-page file vault with upload capability.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FolderOpen, Plus, X } from 'lucide-react';
import { FileVault } from '../dashboard/components/file-vault';
import { cn } from '@/lib/utils';
import type { File as FileType } from '@prisma/client';

interface Props {
  files: FileType[];
  projectId?: string;
  projectName?: string;
}

export function DocumentsPageContent({ files, projectId, projectName }: Props) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (projectId) formData.append('projectId', projectId);

      const response = await fetch('/api/portal/upload', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Upload failed');

      setUploadMessage({ type: 'success', text: `הקובץ "${file.name}" הועלה בהצלחה!` });
      setTimeout(() => {
        setShowUploadDialog(false);
        setUploadMessage(null);
        window.location.reload();
      }, 1500);
    } catch (err) {
      setUploadMessage({ type: 'error', text: err instanceof Error ? err.message : 'העלאה נכשלה' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-[#0a0e27]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <a
            href="/portal/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/70 mb-4 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה ללוח הבקרה
          </a>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">מסמכים</h1>
              {projectName && (
                <p className="text-sm text-white/50 mt-1">{files.length} קבצים | {projectName}</p>
              )}
            </div>
            <button
              onClick={() => setShowUploadDialog(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#c8a951] to-[#e8d48b] hover:from-[#d4af37] hover:to-[#e8d48b] text-[#070b1e] text-sm font-bold rounded-sm transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">העלאת קובץ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Files */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {files.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] p-12 text-center"
          >
            <FolderOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">אין מסמכים עדיין</h2>
            <p className="text-white/50 text-sm mb-6">העלה קבצים לפרויקט שלך כדי לראות אותם כאן.</p>
            <button
              onClick={() => setShowUploadDialog(true)}
              className="px-4 py-2 bg-[#c8a951] text-[#070b1e] font-semibold rounded-lg text-sm hover:bg-[#d4af37] transition-colors"
            >
              העלאת קובץ ראשון
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden"
          >
            <div className="p-5">
              <FileVault files={files} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => !isUploading && setShowUploadDialog(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir="rtl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900">העלאת קובץ</h3>
                <button
                  onClick={() => !isUploading && setShowUploadDialog(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {uploadMessage && (
                <div className={cn(
                  'p-3 rounded-xl text-sm mb-4',
                  uploadMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                )}>
                  {uploadMessage.text}
                </div>
              )}

              <label className={cn(
                'flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
                isUploading ? 'border-slate-200 bg-slate-50' : 'border-slate-300 hover:border-[#c8a951] hover:bg-[#c8a951]/5'
              )}>
                {isUploading ? (
                  <>
                    <div className="w-10 h-10 border-3 border-[#c8a951] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-slate-500">מעלה...</span>
                  </>
                ) : (
                  <>
                    <FolderOpen className="w-10 h-10 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">לחץ לבחירת קובץ</span>
                    <span className="text-xs text-slate-400">PDF, Word, Excel, PowerPoint, תמונה (עד 25MB)</span>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  disabled={isUploading}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.txt,.csv"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
