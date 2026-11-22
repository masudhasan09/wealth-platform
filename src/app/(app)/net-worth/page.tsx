import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getNetWorthAction } from '@/app/actions/net-worth';
import { getSnapshotHistoryAction } from '@/app/actions/net-worth';
import { NetWorthClient } from './NetWorthClient';

export const dynamic = 'force-dynamic';

export default async function NetWorthPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const [netWorthData, snapshots] = await Promise.all([
    getNetWorthAction(),
    getSnapshotHistoryAction(90),
  ]);

  const hasError = 'error' in netWorthData;

  return (
    <NetWorthClient
      netWorth={hasError ? null : netWorthData.result}
      positions={hasError ? [] : netWorthData.positions}
      snapshots={snapshots.map((s) => ({
        ...s,
        snapshotAt: s.snapshotAt.toISOString(),
      }))}
      error={hasError ? netWorthData.error : null}
    />
  );
}

