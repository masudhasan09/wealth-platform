import { prisma } from '@/lib/db/client';
import { encryptSecret, decryptSecret, maskKey } from '@/lib/security/crypto';

export type ProviderKindType = 'equity' | 'crypto' | 'yield';

export interface ProviderConfigView {
  provider: string; // "finnhub" | "twelvedata" | "coingecko" | "treasury"
  name: string;
  kind: ProviderKindType;
  requiresKey: boolean;
  isConfigured: boolean;
  keyMasked?: string;
  enabled: boolean;
  priority: number;
  lastSuccessAt?: Date | null;
  lastError?: string | null;
  updatedAt?: Date | null;
}

const KNOWN_PROVIDERS: {
  provider: string;
  name: string;
  kind: ProviderKindType;
  requiresKey: boolean;
  defaultPriority: number;
}[] = [
  { provider: 'finnhub', name: 'Finnhub Stock API', kind: 'equity', requiresKey: true, defaultPriority: 1 },
  { provider: 'twelvedata', name: 'Twelve Data Market API', kind: 'equity', requiresKey: true, defaultPriority: 2 },
  { provider: 'coingecko', name: 'CoinGecko Digital Assets API', kind: 'crypto', requiresKey: false, defaultPriority: 1 },
  { provider: 'treasury', name: 'US Treasury FiscalData / FRED', kind: 'yield', requiresKey: false, defaultPriority: 1 },
];

/**
 * Lists all provider configurations with sanitized values (masked keys only).
 * Decrypted secrets are NEVER returned here.
 */
export async function getAllProviderConfigs(): Promise<ProviderConfigView[]> {
  const dbConfigs = await prisma.providerConfig.findMany();
  const configMap = new Map(dbConfigs.map((c) => [c.provider, c]));

  return KNOWN_PROVIDERS.map((kp) => {
    const existing = configMap.get(kp.provider);

    return {
      provider: kp.provider,
      name: kp.name,
      kind: kp.kind,
      requiresKey: kp.requiresKey,
      isConfigured: !kp.requiresKey || !!existing?.encryptedKey,
      keyMasked: existing?.keyLast4 ? maskKey(existing.keyLast4) : undefined,
      enabled: existing ? existing.enabled : true,
      priority: existing?.priority ?? kp.defaultPriority,
      lastSuccessAt: existing?.lastSuccessAt ?? null,
      lastError: existing?.lastError ?? null,
      updatedAt: existing?.updatedAt ?? null,
    };
  });
}

/**
 * Saves or updates a provider's API key.
 * Stores AES-256-GCM encrypted blob and last 4 characters for masking.
 */
export async function saveProviderKey(
  provider: string,
  plainKey: string,
  userId: string
): Promise<void> {
  const kp = KNOWN_PROVIDERS.find((p) => p.provider === provider);
  if (!kp) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const cleanKey = plainKey.trim();
  const encryptedKey = encryptSecret(cleanKey);
  const keyLast4 = cleanKey.slice(-4);

  await prisma.providerConfig.upsert({
    where: { provider },
    create: {
      provider,
      kind: kp.kind,
      encryptedKey,
      keyLast4,
      enabled: true,
      priority: kp.defaultPriority,
      updatedByUserId: userId,
    },
    update: {
      encryptedKey,
      keyLast4,
      lastError: null,
      updatedByUserId: userId,
    },
  });
}

/**
 * Removes a provider's key from the database.
 */
export async function removeProviderKey(provider: string, userId: string): Promise<void> {
  const existing = await prisma.providerConfig.findUnique({
    where: { provider },
  });

  if (existing) {
    await prisma.providerConfig.update({
      where: { provider },
      data: {
        encryptedKey: null,
        keyLast4: null,
        updatedByUserId: userId,
      },
    });
  }
}

/**
 * Toggles provider enabled status.
 */
export async function setProviderEnabled(
  provider: string,
  enabled: boolean,
  userId: string
): Promise<void> {
  const kp = KNOWN_PROVIDERS.find((p) => p.provider === provider);
  if (!kp) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  await prisma.providerConfig.upsert({
    where: { provider },
    create: {
      provider,
      kind: kp.kind,
      enabled,
      priority: kp.defaultPriority,
      updatedByUserId: userId,
    },
    update: {
      enabled,
      updatedByUserId: userId,
    },
  });
}

/**
 * Updates provider resolution priority.
 */
export async function setProviderPriority(
  provider: string,
  priority: number,
  userId: string
): Promise<void> {
  const kp = KNOWN_PROVIDERS.find((p) => p.provider === provider);
  if (!kp) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  await prisma.providerConfig.upsert({
    where: { provider },
    create: {
      provider,
      kind: kp.kind,
      priority,
      updatedByUserId: userId,
    },
    update: {
      priority,
      updatedByUserId: userId,
    },
  });
}

/**
 * Retrieves decrypted key for internal provider fetch use ONLY.
 * NEVER return this to callers outside the provider/service layer.
 */
export async function getDecryptedProviderKey(provider: string): Promise<string | null> {
  const cfg = await prisma.providerConfig.findUnique({
    where: { provider },
  });

  if (!cfg?.enabled || !cfg.encryptedKey) {
    return null;
  }

  try {
    return decryptSecret(cfg.encryptedKey);
  } catch {
    return null;
  }
}

/**
 * Records execution result (success or sanitized error) for a provider.
 */
export async function recordProviderResult(
  provider: string,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  const cleanError = errorMessage
    ? errorMessage.replace(/(key|token|auth)=[^& ]+/gi, '$1=***').slice(0, 250)
    : null;

  await prisma.providerConfig.updateMany({
    where: { provider },
    data: {
      lastSuccessAt: success ? new Date() : undefined,
      lastError: success ? null : cleanError,
    },
  });
}
