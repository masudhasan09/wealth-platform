import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getUserTaxLotsAndGains } from '@/lib/db/tax-lots';
import { GainsClient } from './GainsClient';

export const dynamic = 'force-dynamic';

export default async function GainsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { openLots, realizedReport, availableYears } = await getUserTaxLotsAndGains(session.user.id);

  return (
    <GainsClient
      openLots={openLots}
      allRealizedLots={realizedReport.lots}
      availableYears={availableYears}
      initialYear={realizedReport.taxYear}
    />
  );
}

