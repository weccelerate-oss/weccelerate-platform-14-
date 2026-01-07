import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
// ... שאר הייבואים שלך (S3, Prisma וכו')

// השורה הכי חשובה - מונעת מ-Next.js לקרוס בזמן ה-Build
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // שאר הלוגיקה שלך כאן...
  return NextResponse.json({ message: "Success" });
}

// אם יש לך גם פונקציית POST, וודא שהיא מיוצאת באותו אופן