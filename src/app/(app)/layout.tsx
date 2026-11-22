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

  const role = (session.user as unknown as { role?: string })?.role;
  if (role === 'admin') {
    redirect('/admin/data-sources');
  }

  return (
    <DashboardLayout
      user={{
        name: session.user.name || 'User',
        email: session.user.email || '',
      }}
      logoutAction={logoutAction}
      isAdmin={false}
    >
      {children}
    </DashboardLayout>
  );
}

