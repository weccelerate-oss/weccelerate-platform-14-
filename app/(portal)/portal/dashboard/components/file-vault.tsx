/**
 * File Vault Component
 *
 * Modern document management with grid/list views, search, and download.
 * Dark premium theme with glass morphism.
 */

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  FileVideo,
  File,
  Download,
  Eye,
  Search,
  Grid,
  List,
  Folder,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { File as FileType, FileType as FileTypeEnum } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

interface FileVaultProps {
  files: FileType[];
}

type ViewMode = 'grid' | 'list';

// =============================================================================
// HELPERS
// =============================================================================

const FILE_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  DOCUMENT: {
    icon: <FileText className="w-5 h-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 group-hover:bg-blue-500/15',
    label: 'מסמך',
  },
  SPREADSHEET: {
    icon: <FileSpreadsheet className="w-5 h-5" />,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 group-hover:bg-emerald-500/15',
    label: 'גיליון',
  },
  PRESENTATION: {
    icon: <FileText className="w-5 h-5" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 group-hover:bg-orange-500/15',
    label: 'מצגת',
  },
  IMAGE: {
    icon: <FileImage className="w-5 h-5" />,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10 group-hover:bg-violet-500/15',
    label: 'תמונה',
  },
  VIDEO: {
    icon: <FileVideo className="w-5 h-5" />,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10 group-hover:bg-pink-500/15',
    label: 'סרטון',
  },
};

function getTypeConfig(type: FileTypeEnum) {
  return FILE_TYPE_CONFIG[type] || {
    icon: <File className="w-5 h-5" />,
    color: 'text-white/50',
    bgColor: 'bg-white/[0.04]',
    label: 'קובץ',
  };
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FileVault({ files }: FileVaultProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<FileTypeEnum | 'ALL'>('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || file.type === selectedType;
    return matchesSearch && matchesType;
  });

  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async (file: FileType) => {
    setDownloadingId(file.id);
    setDownloadError(null);
    try {
      const response = await fetch(file.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError('שגיאה בהורדת הקובץ. נסה שוב.');
      setTimeout(() => setDownloadError(null), 3000);
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  // Empty state
  if (files.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.04] flex items-center justify-center">
          <Folder className="w-7 h-7 text-white/20" />
        </div>
        <h3 className="text-sm font-semibold text-white/70 mb-1">אין מסמכים עדיין</h3>
        <p className="text-xs text-white/40">המסמכים שלך יופיעו כאן כשהצוות יעלה אותם</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Download Error */}
      {downloadError && (
        <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-sm flex items-center justify-between border border-red-500/20">
          <span>{downloadError}</span>
          <button onClick={() => setDownloadError(null)} className="text-red-400 hover:text-red-300 text-xs underline mr-2">סגור</button>
        </div>
      )}
      {/* Toolbar */}
      <div className="space-y-3">
        {/* Search row */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="חיפוש מסמכים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 sm:py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#c8a951]/20 focus:border-[#c8a951]/40 transition-all"
            />
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'sm:hidden p-2.5 rounded-xl border transition-colors',
              showFilters ? 'bg-[#c8a951]/10 border-[#c8a951]/20 text-[#c8a951]' : 'bg-white/[0.04] border-white/[0.08] text-white/50'
            )}
          >
            <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-white/[0.04] rounded-xl p-1 border border-white/[0.08]">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                viewMode === 'grid' ? 'bg-white/[0.08] shadow-sm text-white' : 'text-white/40 hover:text-white/60'
              )}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-lg transition-all',
                viewMode === 'list' ? 'bg-white/[0.08] shadow-sm text-white' : 'text-white/40 hover:text-white/60'
              )}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Type filter pills */}
        <div className={cn(
          'sm:flex items-center gap-1 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06]',
          showFilters ? 'flex flex-wrap' : 'hidden'
        )}>
          {['ALL', 'DOCUMENT', 'SPREADSHEET', 'PRESENTATION', 'IMAGE', 'VIDEO'].map((type) => {
            const labels: Record<string, string> = {
              ALL: 'הכל', DOCUMENT: 'מסמכים', SPREADSHEET: 'גיליונות',
              PRESENTATION: 'מצגות', IMAGE: 'תמונות', VIDEO: 'סרטונים',
            };
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type as FileTypeEnum | 'ALL')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                  selectedType === type
                    ? 'bg-white/[0.08] text-white shadow-sm'
                    : 'text-white/40 hover:text-white/60 active:bg-white/[0.04]'
                )}
              >
                {labels[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* No results */}
      {filteredFiles.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-6 h-6 mx-auto text-white/20 mb-2" />
          <p className="text-sm text-white/40">לא נמצאו מסמכים מתאימים</p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <AnimatePresence>
            {filteredFiles.map((file, index) => {
              const config = getTypeConfig(file.type);
              const isDownloading = downloadingId === file.id;

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="group relative bg-white/[0.03] rounded-xl p-3 sm:p-4 hover:bg-white/[0.06] hover:border-[#c8a951]/20 border border-white/[0.06] transition-all duration-200 cursor-pointer"
                >
                  {/* File icon */}
                  <div className={cn(
                    'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-2 sm:mb-3 transition-colors',
                    config.bgColor,
                    config.color
                  )}>
                    {config.icon}
                  </div>

                  {/* File info */}
                  <h4 className="font-medium text-xs sm:text-sm text-white/90 truncate mb-0.5">
                    {file.displayName || file.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-white/40 flex items-center gap-1">
                    <span>{formatFileSize(file.size)}</span>
                    <span className="text-white/20 hidden sm:inline">·</span>
                    <span className="hidden sm:inline">{formatDate(file.uploadedAt)}</span>
                  </p>

                  {/* Download button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                    disabled={isDownloading}
                    className={cn(
                      'absolute top-2 left-2 sm:top-3 sm:left-3 p-1.5 sm:p-2 rounded-lg transition-all border',
                      'sm:opacity-0 sm:group-hover:opacity-100',
                      isDownloading
                        ? 'bg-emerald-500/10 border-emerald-500/20'
                        : 'bg-white/[0.06] border-white/[0.08] hover:bg-white/[0.1] active:bg-white/[0.04]'
                    )}
                    title="הורדה"
                  >
                    {isDownloading ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-white/60" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredFiles.length > 0 && (
        <div className="space-y-0.5">
          <AnimatePresence>
            {filteredFiles.map((file, index) => {
              const config = getTypeConfig(file.type);
              const isDownloading = downloadingId === file.id;

              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center gap-3 py-2.5 px-2 sm:px-3 rounded-xl hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors group cursor-pointer"
                >
                  {/* Icon */}
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                    config.bgColor,
                    config.color
                  )}>
                    {config.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-white/90 truncate">
                      {file.displayName || file.name}
                    </h4>
                    <p className="text-[11px] text-white/40 flex items-center gap-1.5">
                      <span>{formatFileSize(file.size)}</span>
                      <span className="text-white/20">·</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(file)}
                      disabled={isDownloading}
                      className="p-2 hover:bg-white/[0.06] active:bg-white/[0.08] rounded-lg transition-colors"
                      title="הורדה"
                    >
                      {isDownloading ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Download className="w-4 h-4 text-white/50" />
                      )}
                    </button>
                    <button
                      className="p-2 hover:bg-white/[0.06] active:bg-white/[0.08] rounded-lg transition-colors hidden sm:block"
                      title="תצוגה מקדימה"
                    >
                      <Eye className="w-4 h-4 text-white/50" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Count */}
      <p className="text-[11px] text-white/30 text-center pt-1">
        {filteredFiles.length} מתוך {files.length} מסמכים
      </p>
    </div>
  );
}

export default FileVault;
