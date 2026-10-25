/**
 * DB helpers for NetWorthSnapshot.
 */
import { prisma } from './client';
import type { NetWorthResult } from '@/lib/finance/valuation';

export interface SnapshotRow {
  id: string;
  userId: string;
  total: string;
  byAccount: Record<string, string>;
  byAssetClass: Record<string, string>;
  staleCount: number;
  snapshotAt: Date;
}

function parseSnapshot(row: {
  id: string;
  userId: string;
  total: string;
  byAccount: string;
  byAssetClass: string;
  staleCount: number;
  snapshotAt: Date;
}): SnapshotRow {
  return {
    id: row.id,
    userId: row.userId,
    total: row.total,
    byAccount: JSON.parse(row.byAccount) as Record<string, string>,
    byAssetClass: JSON.parse(row.byAssetClass) as Record<string, string>,
    staleCount: row.staleCount,
    snapshotAt: row.snapshotAt,
  };
}

/** Persist a new net worth snapshot for the given user. */
export async function saveSnapshot(
  userId: string,
  result: NetWorthResult,
  staleCount = 0,
): Promise<SnapshotRow> {
  const row = await prisma.netWorthSnapshot.create({
    data: {
      userId,
      total: result.total,
      byAccount: JSON.stringify(result.byAccount),
      byAssetClass: JSON.stringify(result.byAssetClass),
      staleCount,
      snapshotAt: result.calculatedAt,
    },
  });
  return parseSnapshot(row);
}

/** Fetch the N most recent snapshots for a user (for chart). */
export async function getSnapshots(
  userId: string,
  limit = 90,
): Promise<SnapshotRow[]> {
  const rows = await prisma.netWorthSnapshot.findMany({
    where: { userId },
    orderBy: { snapshotAt: 'desc' },
    take: limit,
  });
  return rows.map(parseSnapshot);
}

/** Fetch the most recent snapshot for a user. */
export async function getLatestSnapshot(userId: string): Promise<SnapshotRow | null> {
  const row = await prisma.netWorthSnapshot.findFirst({
    where: { userId },
    orderBy: { snapshotAt: 'desc' },
  });
  return row ? parseSnapshot(row) : null;
}

/** True if no snapshot was taken today for this user. */
export async function needsSnapshot(userId: string): Promise<boolean> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const count = await prisma.netWorthSnapshot.count({
    where: {
      userId,
      snapshotAt: { gte: today },
    },
  });
  return count === 0;
}

