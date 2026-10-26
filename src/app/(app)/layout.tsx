import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { logoutAction } from '@/app/actions/auth';
import { DashboardLayout } from '@/components/templates';

export const dynamic = 'force-dynamic';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <DashboardLayout
      user={{
        name: session.user.name || 'User',
        email: session.user.email || '',
      }}
      logoutAction={logoutAction}
    >
      {children}
    </DashboardLayout>
  );
}

