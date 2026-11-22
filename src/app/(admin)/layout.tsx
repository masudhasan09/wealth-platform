import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/security/roles';
import { logoutAction } from '@/app/actions/auth';
import { AdminLayout } from '@/components/templates';

export const dynamic = 'force-dynamic';

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let admin;
  try {
    admin = await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <AdminLayout
      user={{
        name: admin.name || 'Admin',
        email: admin.email || '',
      }}
      logoutAction={logoutAction}
    >
      {children}
    </AdminLayout>
  );
}
