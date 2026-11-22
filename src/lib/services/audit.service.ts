import { prisma } from '@/lib/db/client';

export interface AuditRecordInput {
  actorUserId: string;
  action: string;
  target: string;
  metadata?: Record<string, unknown> | null;
}

export interface AuditEntry {
  id: string;
  actorUserId: string;
  actorEmail?: string;
  action: string;
  target: string;
  createdAt: Date;
  metadata?: string | null;
}

/**
 * Audit Service — records administrative changes with strict security.
 * NEVER records raw or decrypted secrets.
 */
export async function recordAudit(input: AuditRecordInput): Promise<AuditEntry> {
  const metadataString = input.metadata ? JSON.stringify(input.metadata) : null;

  const entry = await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      target: input.target,
      metadata: metadataString,
    },
    include: {
      actorUser: {
        select: { email: true },
      },
    },
  });

  return {
    id: entry.id,
    actorUserId: entry.actorUserId,
    actorEmail: entry.actorUser?.email,
    action: entry.action,
    target: entry.target,
    createdAt: entry.createdAt,
    metadata: entry.metadata,
  };
}

/**
 * Returns recent audit entries for the administrative dashboard.
 */
export async function listRecentAuditLogs(limit: number = 20): Promise<AuditEntry[]> {
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      actorUser: {
        select: { email: true },
      },
    },
  });

  return entries.map((e) => ({
    id: e.id,
    actorUserId: e.actorUserId,
    actorEmail: e.actorUser?.email,
    action: e.action,
    target: e.target,
    createdAt: e.createdAt,
    metadata: e.metadata,
  }));
}

