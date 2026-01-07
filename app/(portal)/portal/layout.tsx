import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/portal');
  }
  
  return <>{children}</>;
}