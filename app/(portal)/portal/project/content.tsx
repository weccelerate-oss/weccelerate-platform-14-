/**
 * Project Page Content
 *
 * Full project details with timeline, services, activities, and notes.
 */

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Target, Building2, Globe, Calendar, Users } from 'lucide-react';
import { ProjectTimeline } from '../dashboard/components/project-timeline';
import { PurchasedServices } from '../dashboard/components/purchased-services';
import { DealActivities } from '../dashboard/components/deal-activities';
import type { DealProductDisplay } from '../dashboard/components/purchased-services';
import type { DealActivityDisplay } from '../dashboard/components/deal-activities';
import type { Project, File, ProjectNote } from '@prisma/client';

interface ProjectWithRelations extends Project {
  files: File[];
  notes: ProjectNote[];
  user: { name: string; email: string; phone: string | null; company: string | null };
}

interface Props {
  project: ProjectWithRelations | null;
  dealProducts: DealProductDisplay[];
  dealActivities: DealActivityDisplay[];
  pipedriveStages: { id: number; name: string; orderNr: number }[];
  currentStageId?: number;
  dealStatus?: string;
}

export function ProjectPageContent({
  project,
  dealProducts,
  dealActivities,
  pipedriveStages,
  currentStageId,
  dealStatus,
}: Props) {
  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Target className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">אין פרויקט פעיל</h2>
          <p className="text-white/50 text-sm mb-6">לא נמצא פרויקט פעיל עבורך.</p>
          <a href="/portal/dashboard" className="text-[#c8a951] hover:underline text-sm">
            חזרה ללוח הבקרה
          </a>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">הפרויקט שלי</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Project Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] p-5 sm:p-6"
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c8a951] to-[#e8d48b] flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-white">{project.name}</h2>
              {project.description && (
                <p className="text-sm text-white/50 mt-1">{project.description}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {project.industry && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">תעשייה</p>
                  <p className="text-sm text-white/80">{project.industry}</p>
                </div>
              </div>
            )}
            {project.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">אתר</p>
                  <a href={project.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#c8a951] hover:underline truncate block">
                    {project.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              </div>
            )}
            {project.foundingDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">הקמה</p>
                  <p className="text-sm text-white/80">{new Date(project.foundingDate).toLocaleDateString('he-IL')}</p>
                </div>
              </div>
            )}
            {project.teamSize && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-white/30" />
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">גודל צוות</p>
                  <p className="text-sm text-white/80">{project.teamSize} אנשים</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-[15px] font-semibold text-white/90">מה עשינו ומה נשאר</h2>
          </div>
          <div className="p-5">
            <ProjectTimeline
              dealActivities={dealActivities}
              dealStatus={dealStatus}
            />
          </div>
        </motion.div>

        {/* Services + Activities */}
        {(dealProducts.length > 0 || dealActivities.length > 0) && (
          <div className="grid lg:grid-cols-2 gap-6">
            {dealProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <PurchasedServices products={dealProducts} />
              </motion.div>
            )}
            {dealActivities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <DealActivities activities={dealActivities} />
              </motion.div>
            )}
          </div>
        )}

        {/* Notes */}
        {project.notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-[15px] font-semibold text-white/90">הערות פרויקט</h2>
            </div>
            <div className="p-5 space-y-3">
              {project.notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]"
                >
                  <p className="text-sm text-white/70 leading-relaxed">{note.content}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-white/30">
                    {note.authorName && <span>{note.authorName}</span>}
                    <span>{new Date(note.createdAt).toLocaleDateString('he-IL')}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
