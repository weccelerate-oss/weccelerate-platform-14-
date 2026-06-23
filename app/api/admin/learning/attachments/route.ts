/**
 * Admin: upload a lesson attachment.
 *
 * POST /api/admin/learning/attachments   (multipart/form-data)
 *   Fields: file, lessonId
 *
 * Stores the file in Supabase Storage (same mechanism as the portal vault)
 * and creates a LessonAttachment row. Admin-only.
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'txt', 'csv', 'zip',
];

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'שירות האחסון לא זמין' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const lessonId = formData.get('lessonId') as string | null;

    if (!file) return NextResponse.json({ error: 'לא נבחר קובץ' }, { status: 400 });
    if (!lessonId) return NextResponse.json({ error: 'חסר מזהה שיעור' }, { status: 400 });

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'הקובץ גדול מדי. מקסימום 50MB.' }, { status: 400 });
    }

    const lesson = await prisma.courseLesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });
    if (!lesson) return NextResponse.json({ error: 'שיעור לא נמצא' }, { status: 404 });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const rawExt = (file.name.split('.').pop() || '').toLowerCase();
    const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : 'bin';
    const safeFileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `lessons/${lessonId}/${safeFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Try 'documents' bucket first, fall back to 'images'.
    let publicUrl = '';
    const upload = await supabase.storage
      .from('documents')
      .upload(filePath, buffer, { contentType: file.type || undefined, upsert: false });

    if (upload.error) {
      const fb = await supabase.storage
        .from('images')
        .upload(filePath, buffer, { contentType: file.type || undefined, upsert: false });
      if (fb.error) {
        console.error('[Admin Learning Upload] Supabase error:', fb.error);
        return NextResponse.json({ error: 'העלאה נכשלה. נסה שוב.' }, { status: 500 });
      }
      publicUrl = supabase.storage.from('images').getPublicUrl(fb.data.path).data.publicUrl;
    } else {
      publicUrl = supabase.storage.from('documents').getPublicUrl(upload.data.path).data.publicUrl;
    }

    const count = await prisma.lessonAttachment.count({ where: { lessonId } });
    const attachment = await prisma.lessonAttachment.create({
      data: {
        lessonId,
        name: file.name,
        url: publicUrl,
        mimeType: file.type || null,
        size: file.size,
        displayOrder: count,
      },
    });

    return NextResponse.json({ success: true, attachment });
  } catch (error) {
    console.error('[Admin Learning Upload] Error:', error);
    return NextResponse.json({ error: 'העלאה נכשלה' }, { status: 500 });
  }
}
