/**
 * Portal Document Upload API
 *
 * Allows entrepreneurs to upload documents (PDF, DOCX, XLSX, PPTX) to their project.
 * Files are stored in Supabase Storage and linked to the user's project in DB.
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'DOCUMENT',
  'application/msword': 'DOCUMENT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCUMENT',
  'application/vnd.ms-excel': 'SPREADSHEET',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'SPREADSHEET',
  'application/vnd.ms-powerpoint': 'PRESENTATION',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PRESENTATION',
  'image/jpeg': 'IMAGE',
  'image/png': 'IMAGE',
  'image/webp': 'IMAGE',
  'text/plain': 'DOCUMENT',
  'text/csv': 'SPREADSHEET',
};

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'jpg', 'jpeg', 'png', 'webp', 'txt', 'csv',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = rateLimit(`portal-upload:${ip}`, { limit: 5, windowSeconds: 60 });
    if (!rl.allowed) {
      return NextResponse.json({ error: 'יותר מדי העלאות. נסה שוב בעוד דקה.' }, { status: 429 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'שירות האחסון לא זמין' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'לא נבחר קובץ' }, { status: 400 });
    }

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        { error: 'סוג קובץ לא נתמך. השתמש ב-PDF, Word, Excel, PowerPoint, תמונה או CSV.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'הקובץ גדול מדי. מקסימום 25MB.' },
        { status: 400 }
      );
    }

    const rawExt = (file.name.split('.').pop() || '').toLowerCase();
    const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : 'bin';
    const timestamp = Date.now();
    const safeFileName = `${timestamp}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `documents/${session.user.id}/${safeFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      // Fallback: try 'images' bucket if 'documents' doesn't exist
      const fallbackPath = `documents/${safeFileName}`;
      const { data: fallbackData, error: fallbackError } = await supabase.storage
        .from('images')
        .upload(fallbackPath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (fallbackError) {
        console.error('[Portal Upload] Supabase error:', fallbackError);
        return NextResponse.json({ error: 'העלאה נכשלה. נסה שוב.' }, { status: 500 });
      }

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(fallbackData.path);

      // Save to DB
      const fileRecord = await saveFileToDb(
        session.user.id,
        projectId,
        file.name,
        urlData.publicUrl,
        file.type,
        file.size,
        ALLOWED_TYPES[file.type]
      );

      return NextResponse.json({
        url: urlData.publicUrl,
        file: fileRecord,
      });
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    const fileRecord = await saveFileToDb(
      session.user.id,
      projectId,
      file.name,
      urlData.publicUrl,
      file.type,
      file.size,
      ALLOWED_TYPES[file.type]
    );

    return NextResponse.json({
      url: urlData.publicUrl,
      file: fileRecord,
    });
  } catch (error) {
    console.error('[Portal Upload] Error:', error);
    return NextResponse.json({ error: 'העלאה נכשלה' }, { status: 500 });
  }
}

async function saveFileToDb(
  userId: string,
  projectId: string | null,
  originalName: string,
  url: string,
  mimeType: string,
  size: number,
  fileType: string,
) {
  try {
    const { prisma } = await import('@/lib/db');

    // If no projectId provided, find user's active project
    let targetProjectId = projectId;
    if (!targetProjectId) {
      const project = await prisma.project.findFirst({
        where: { userId, isArchived: false },
        select: { id: true },
      });
      targetProjectId = project?.id || null;
    }

    const file = await prisma.file.create({
      data: {
        name: originalName,
        displayName: originalName.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
        url,
        mimeType,
        size,
        type: fileType as 'DOCUMENT' | 'SPREADSHEET' | 'PRESENTATION' | 'IMAGE' | 'VIDEO' | 'OTHER',
        ...(targetProjectId && { projectId: targetProjectId }),
        uploadedById: userId,
      },
    });

    // Log activity
    if (targetProjectId) {
      await prisma.activityLog.create({
        data: {
          action: 'file.uploaded',
          description: `הועלה קובץ: ${originalName}`,
          userId,
          projectId: targetProjectId,
          metadata: { fileName: originalName, fileType, size },
        },
      });
    }

    return file;
  } catch (err) {
    console.error('[Portal Upload] DB save error:', err);
    return null;
  }
}
