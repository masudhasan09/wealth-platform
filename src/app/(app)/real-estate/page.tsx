import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAccountsByUserId } from '@/lib/db';
import { getPropertiesByUserId } from '@/lib/db/real-estate';
import { DashboardLayout } from '@/components/templates';
import { RealEstateClient } from './RealEstateClient';

export const dynamic = 'force-dynamic';

export default async function RealEstatePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [properties, accounts] = await Promise.all([
    getPropertiesByUserId(session.user.id),
    getAccountsByUserId(session.user.id),
  ]);

  return (
    <DashboardLayout
      currentPath="/real-estate"
      user={{
        name: session.user.name || 'User',
        email: session.user.email || '',
      }}
    >
      <RealEstateClient
        properties={properties}
        accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
      />
    </DashboardLayout>
  );
}

