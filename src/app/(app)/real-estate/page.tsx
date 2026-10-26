import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getAccountsByUserId } from '@/lib/db';
import { getPropertiesByUserId } from '@/lib/db/real-estate';
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
    <div className="space-y-6">
      <RealEstateClient
        properties={properties}
        accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
      />
    </div>
  );
}

