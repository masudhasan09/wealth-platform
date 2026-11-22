'use server';

import { auth } from '@/auth';
import { getUserTaxLotsAndGains, UserTaxLotsResult } from '@/lib/db/tax-lots';

export async function getTaxLotsAction(taxYear?: number): Promise<UserTaxLotsResult | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be signed in to view tax lots and capital gains.' };
  }

  try {
    return await getUserTaxLotsAndGains(session.user.id, taxYear);
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Failed to compute tax lots.' };
  }
}

