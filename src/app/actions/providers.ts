'use server';

import { requireAdmin } from '@/lib/security';
import {
  getAllProviderConfigs,
  saveProviderKey,
  removeProviderKey,
  setProviderEnabled,
  setProviderPriority,
  getDecryptedProviderKey,
  recordProviderResult,
  ProviderConfigView,
} from '@/lib/services/provider-config.service';
import { recordAudit, listRecentAuditLogs, AuditEntry } from '@/lib/services/audit.service';
import { FinnhubPriceProvider } from '@/lib/providers/finnhub.provider';
import { TwelveDataPriceProvider } from '@/lib/providers/twelvedata.provider';
import { CoinGeckoPriceProvider } from '@/lib/providers/coingecko.provider';
import { TreasuryYieldProvider } from '@/lib/providers/treasury.provider';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const saveKeySchema = z.object({
  provider: z.string().min(1),
  key: z.string().min(1, 'Key cannot be empty'),
});

// Simple in-memory rate limiter: max 5 tests per minute per admin user
const testRateLimits = new Map<string, number[]>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const timestamps = (testRateLimits.get(userId) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= 5) {
    return false;
  }

  timestamps.push(now);
  testRateLimits.set(userId, timestamps);
  return true;
}

export async function getAdminDataSourcesAction(): Promise<
  { providers: ProviderConfigView[]; auditLogs: AuditEntry[] } | { error: string }
> {
  try {
    await requireAdmin();
    const [providers, auditLogs] = await Promise.all([
      getAllProviderConfigs(),
      listRecentAuditLogs(20),
    ]);
    return { providers, auditLogs };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Access denied.' };
  }
}

export async function saveProviderKeyAction(
  provider: string,
  key: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const admin = await requireAdmin();
    const validated = saveKeySchema.safeParse({ provider, key });
    if (!validated.success) {
      return { ok: false, message: validated.error.issues[0]?.message || 'Invalid key' };
    }

    await saveProviderKey(provider, key, admin.id);
    await recordAudit({
      actorUserId: admin.id,
      action: 'save_key',
      target: `provider:${provider}`,
      metadata: { last4: key.trim().slice(-4) },
    });

    revalidatePath('/admin/data-sources');
    return { ok: true, message: `Key for ${provider} encrypted and saved.` };
  } catch (err: unknown) {
    return { ok: false, message: err instanceof Error ? err.message : 'Failed to save key' };
  }
}

export async function removeProviderKeyAction(
  provider: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const admin = await requireAdmin();
    await removeProviderKey(provider, admin.id);
    await recordAudit({
      actorUserId: admin.id,
      action: 'remove_key',
      target: `provider:${provider}`,
    });

    revalidatePath('/admin/data-sources');
    return { ok: true, message: `Key for ${provider} removed.` };
  } catch (err: unknown) {
    return { ok: false, message: err instanceof Error ? err.message : 'Failed to remove key' };
  }
}

export async function setProviderEnabledAction(
  provider: string,
  enabled: boolean
): Promise<{ ok: boolean; message: string }> {
  try {
    const admin = await requireAdmin();
    await setProviderEnabled(provider, enabled, admin.id);
    await recordAudit({
      actorUserId: admin.id,
      action: enabled ? 'enable' : 'disable',
      target: `provider:${provider}`,
    });

    revalidatePath('/admin/data-sources');
    return { ok: true, message: `${provider} has been ${enabled ? 'enabled' : 'disabled'}.` };
  } catch (err: unknown) {
    return { ok: false, message: err instanceof Error ? err.message : 'Failed to update provider' };
  }
}

export async function setProviderPriorityAction(
  provider: string,
  priority: number
): Promise<{ ok: boolean; message: string }> {
  try {
    const admin = await requireAdmin();
    await setProviderPriority(provider, priority, admin.id);
    await recordAudit({
      actorUserId: admin.id,
      action: 'set_priority',
      target: `provider:${provider}`,
      metadata: { priority },
    });

    revalidatePath('/admin/data-sources');
    return { ok: true, message: `Priority for ${provider} updated to ${priority}.` };
  } catch (err: unknown) {
    return { ok: false, message: err instanceof Error ? err.message : 'Failed to set priority' };
  }
}

export async function testProviderConnectionAction(
  provider: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const admin = await requireAdmin();

    if (!checkRateLimit(admin.id)) {
      return {
        ok: false,
        message: 'Rate limit exceeded: maximum 5 test connections per minute.',
      };
    }

    let result: { ok: boolean; message: string };
    const dbKey = (await getDecryptedProviderKey(provider)) || undefined;

    switch (provider) {
      case 'finnhub': {
        const p = new FinnhubPriceProvider(dbKey);
        result = await p.testConnection();
        break;
      }
      case 'twelvedata': {
        const p = new TwelveDataPriceProvider(dbKey);
        result = await p.testConnection();
        break;
      }
      case 'coingecko': {
        const p = new CoinGeckoPriceProvider(dbKey);
        result = await p.testConnection();
        break;
      }
      case 'treasury': {
        const p = new TreasuryYieldProvider(dbKey);
        result = await p.testConnection();
        break;
      }
      default:
        result = { ok: false, message: `Unknown provider ${provider}` };
    }

    await recordProviderResult(
      provider,
      result.ok,
      result.ok ? undefined : result.message
    );

    await recordAudit({
      actorUserId: admin.id,
      action: 'test_connection',
      target: `provider:${provider}`,
      metadata: { success: result.ok, sanitizedMessage: result.message },
    });

    revalidatePath('/admin/data-sources');
    return result;
  } catch (err: unknown) {
    const cleanMsg = err instanceof Error ? err.message : 'Connection test failed';
    const sanitized = cleanMsg.replace(/(token|key|auth)=[^& ]+/gi, '$1=***');
    try {
      await recordProviderResult(provider, false, sanitized);
    } catch {
      // Ignore background write failures on error return
    }
    revalidatePath('/admin/data-sources');
    return { ok: false, message: sanitized };
  }
}

