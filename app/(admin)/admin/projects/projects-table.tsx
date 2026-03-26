'use client';

import { useState } from 'react';
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Upload,
  FileText,
  StickyNote,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  updateProjectAction,
  deleteProjectAction,
  addProjectNoteAction,
  uploadProjectFileAction,
  deleteProjectFileAction,
} from '../actions';
import type { ProjectStatus } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  website: string | null;
  pipedriveId: string | null;
  status: ProjectStatus;
  stage: number;
  targetFunding: unknown;
  fundingRaised: unknown;
  fundingCurrency: string;
  teamSize: number | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string | null; email: string; company: string | null; phone: string | null };
  files: Array<{ id: string; name: string; displayName: string | null; type: string; size: number | null; uploadedAt: Date }>;
  notes: Array<{ id: string; content: string; isPrivate: boolean; authorName: string | null; createdAt: Date }>;
  _count: { files: number; notes: number };
}

interface ProjectsTableProps {
  projects: ProjectItem[];
}

// =============================================================================
// STATUS CONFIG
// =============================================================================

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'טיוטה', color: 'bg-slate-100 text-slate-700' },
  CHARACTERIZATION: { label: 'אפיון', color: 'bg-blue-100 text-blue-700' },
  MARKET_RESEARCH: { label: 'מחקר שוק', color: 'bg-cyan-100 text-cyan-700' },
  BUSINESS_MODEL: { label: 'מודל עסקי', color: 'bg-violet-100 text-violet-700' },
  DEVELOPMENT: { label: 'פיתוח', color: 'bg-amber-100 text-amber-700' },
  FUNDING_PREP: { label: 'הכנה לגיוס', color: 'bg-orange-100 text-orange-700' },
  ACTIVE_FUNDING: { label: 'גיוס פעיל', color: 'bg-pink-100 text-pink-700' },
  POST_FUNDING: { label: 'לאחר גיוס', color: 'bg-emerald-100 text-emerald-700' },
  SCALING: { label: 'סקיילינג', color: 'bg-teal-100 text-teal-700' },
  GRADUATED: { label: 'בוגר', color: 'bg-green-100 text-green-700' },
  ON_HOLD: { label: 'מושהה', color: 'bg-yellow-100 text-yellow-700' },
  CANCELLED: { label: 'בוטל', color: 'bg-red-100 text-red-700' },
};

const STATUS_ORDER: ProjectStatus[] = [
  'DRAFT', 'CHARACTERIZATION', 'MARKET_RESEARCH', 'BUSINESS_MODEL',
  'DEVELOPMENT', 'FUNDING_PREP', 'ACTIVE_FUNDING', 'POST_FUNDING',
  'SCALING', 'GRADUATED',
];

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '-';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: ProjectStatus) => {
    setActionLoading(id);
    setError(null);
    const stageIndex = STATUS_ORDER.indexOf(status);
    const result = await updateProjectAction(id, { status, stage: stageIndex >= 0 ? stageIndex + 1 : undefined });
    if (!result.success) setError(result.error || 'שגיאה');
    setActionLoading(null);
  };

  const handleArchive = async (id: string, archive: boolean) => {
    setActionLoading(id);
    const result = await updateProjectAction(id, { isArchived: archive });
    if (!result.success) setError(result.error || 'שגיאה');
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם למחוק את הפרויקט לצמיתות? כל הקבצים וההערות יימחקו.')) return;
    setActionLoading(id);
    const result = await deleteProjectAction(id);
    if (!result.success) setError(result.error || 'שגיאה');
    setActionLoading(null);
  };

  const handleAddNote = async (projectId: string) => {
    if (!noteText.trim()) return;
    setActionLoading(projectId);
    const result = await addProjectNoteAction(projectId, noteText.trim(), false);
    if (result.success) setNoteText('');
    else setError(result.error || 'שגיאה');
    setActionLoading(null);
  };

  const handleFileUpload = async (projectId: string, fileInput: HTMLInputElement) => {
    const file = fileInput.files?.[0];
    if (!file) return;
    setActionLoading(projectId);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('displayName', file.name);
    const result = await uploadProjectFileAction(formData);
    if (!result.success) setError(result.error || 'שגיאה בהעלאה');
    fileInput.value = '';
    setActionLoading(null);
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('למחוק את הקובץ?')) return;
    const result = await deleteProjectFileAction(fileId);
    if (!result.success) setError(result.error || 'שגיאה');
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חיפוש לפי שם פרויקט או יזם..."
            className="w-full pr-10 pl-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-royal-500/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
        >
          <option value="ALL">כל הסטטוסים</option>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}
          <button onClick={() => setError(null)} className="mr-2 underline">סגור</button>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-500">אין פרויקטים להצגה</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filtered.map((project) => {
            const isExpanded = expandedId === project.id;
            const statusCfg = STATUS_CONFIG[project.status] || { label: project.status, color: 'bg-slate-100 text-slate-700' };
            const isLoading = actionLoading === project.id;

            return (
              <div key={project.id} className={cn('transition-colors', isExpanded && 'bg-slate-50/50', isLoading && 'opacity-60')}>
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpandedId(isExpanded ? null : project.id)}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-slate-900">{project.name}</h3>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusCfg.color)}>
                        {statusCfg.label}
                      </span>
                      {project.isArchived && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">ארכיון</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {project.user.name || project.user.email}
                      </span>
                      {project.user.company && <span>| {project.user.company}</span>}
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {project._count.files} קבצים
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        שלב {project.stage}/10
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {project.pipedriveId && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium">PD</span>
                    )}
                  </div>
                </div>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
                    {/* Status Control */}
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">שנה סטטוס:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_ORDER.map((s) => {
                          const cfg = STATUS_CONFIG[s];
                          return (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(project.id, s)}
                              disabled={isLoading}
                              className={cn(
                                'px-2.5 py-1 rounded-lg text-xs font-medium transition-all border',
                                project.status === s
                                  ? 'ring-2 ring-royal-500/30 border-royal-500 ' + cfg.color
                                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
                              )}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Files */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-medium text-slate-500">קבצים ({project._count.files})</h4>
                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-royal-600 hover:bg-royal-700 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>העלאת קובץ</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(project.id, e.target)}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.mp4"
                          />
                        </label>
                      </div>
                      {project.files.length > 0 ? (
                        <div className="space-y-1">
                          {project.files.map((f) => (
                            <div key={f.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <span className="text-sm text-slate-700 truncate">{f.displayName || f.name}</span>
                                <span className="text-xs text-slate-400">{formatFileSize(f.size)}</span>
                              </div>
                              <button
                                onClick={() => handleDeleteFile(f.id)}
                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 text-center py-3">אין קבצים</p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <h4 className="text-xs font-medium text-slate-500 mb-2">הערות ({project._count.notes})</h4>
                      {project.notes.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {project.notes.map((n) => (
                            <div key={n.id} className="p-2 bg-white rounded-lg border border-slate-100">
                              <p className="text-sm text-slate-700">{n.content}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{n.authorName} | {new Date(n.createdAt).toLocaleDateString('he-IL')}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={expandedId === project.id ? noteText : ''}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="הוסף הערה..."
                          className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddNote(project.id)}
                        />
                        <button
                          onClick={() => handleAddNote(project.id)}
                          disabled={!noteText.trim() || isLoading}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          הוסף
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleArchive(project.id, !project.isArchived)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        {project.isArchived ? 'שחזר מארכיון' : 'ארכב'}
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        מחק
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
