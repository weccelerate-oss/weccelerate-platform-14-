import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// חובה: מונע מ-Next.js לנסות לרנדר את הקובץ בזמן ה-Build
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // הלוגיקה של חתימת הקבצים שלך כאן...
    return NextResponse.json({ url: "your-signed-url-here" });
    
  } catch (error) {
    console.error('Auth error in signed-url:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

