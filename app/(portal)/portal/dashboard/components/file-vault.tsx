/**
 * File Vault Component
 * 
 * Grid display of downloadable project documents.
 * Features file type icons, download functionality, and preview capability.
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
  MoreVertical,
  Search,
  Filter,
  Grid,
  List,
  Folder,
  Clock,
  CheckCircle2,
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

function getFileIcon(type: FileTypeEnum) {
  switch (type) {
    case 'DOCUMENT':
      return <FileText className="w-6 h-6" />;
    case 'SPREADSHEET':
      return <FileSpreadsheet className="w-6 h-6" />;
    case 'PRESENTATION':
      return <FileText className="w-6 h-6" />;
    case 'IMAGE':
      return <FileImage className="w-6 h-6" />;
    case 'VIDEO':
      return <FileVideo className="w-6 h-6" />;
    default:
      return <File className="w-6 h-6" />;
  }
}

function getFileColor(type: FileTypeEnum) {
  switch (type) {
    case 'DOCUMENT':
      return 'bg-blue-100 text-blue-600';
    case 'SPREADSHEET':
      return 'bg-emerald-100 text-emerald-600';
    case 'PRESENTATION':
      return 'bg-orange-100 text-orange-600';
    case 'IMAGE':
      return 'bg-purple-100 text-purple-600';
    case 'VIDEO':
      return 'bg-pink-100 text-pink-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
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

  // Filter files
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || file.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Handle download
  const handleDownload = async (file: FileType) => {
    setDownloadingId(file.id);
    
    try {
      // In production, this would be a presigned URL from S3/R2
      const response = await fetch(file.url);
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
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  // Empty state
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <Folder className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          אין מסמכים עדיין
        </h3>
        <p className="text-slate-500 mb-4">
          המסמכים שלך יופיעו כאן לאחר העלאה
        </p>
        <button className="px-4 py-2 bg-royal-600 text-white rounded-lg hover:bg-royal-700 transition-colors">
          העלאת מסמך ראשון
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="חיפוש מסמכים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-500"
          />
        </div>

        {/* Filters & View */}
        <div className="flex items-center gap-3">
          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as FileTypeEnum | 'ALL')}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20"
          >
            <option value="ALL">כל הסוגים</option>
            <option value="DOCUMENT">מסמכים</option>
            <option value="SPREADSHEET">גיליונות</option>
            <option value="PRESENTATION">מצגות</option>
            <option value="IMAGE">תמונות</option>
            <option value="VIDEO">סרטונים</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* No results */}
      {filteredFiles.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-slate-500">לא נמצאו מסמכים מתאימים</p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {/* File icon */}
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                  getFileColor(file.type)
                )}>
                  {getFileIcon(file.type)}
                </div>

                {/* File info */}
                <h4 className="font-medium text-sm text-slate-900 truncate mb-1">
                  {file.displayName || file.name}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{formatDate(file.uploadedAt)}</span>
                </p>

                {/* Actions overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={downloadingId === file.id}
                    className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                    title="הורדה"
                  >
                    {downloadingId === file.id ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Download className="w-5 h-5 text-slate-700" />
                    )}
                  </button>
                  <button
                    className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors"
                    title="תצוגה מקדימה"
                  >
                    <Eye className="w-5 h-5 text-slate-700" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && filteredFiles.length > 0 && (
        <div className="divide-y divide-slate-100">
          <AnimatePresence>
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-4 py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors group"
              >
                {/* File icon */}
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  getFileColor(file.type)
                )}>
                  {getFileIcon(file.type)}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-slate-900 truncate">
                    {file.displayName || file.name}
                  </h4>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(file.uploadedAt)}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDownload(file)}
                    disabled={downloadingId === file.id}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title="הורדה"
                  >
                    {downloadingId === file.id ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Download className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                  <button
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title="תצוגה מקדימה"
                  >
                    <Eye className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title="עוד אפשרויות"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* File count */}
      <p className="text-xs text-slate-400 text-center pt-2">
        מציג {filteredFiles.length} מתוך {files.length} מסמכים
      </p>
    </div>
  );
}

export default FileVault;
