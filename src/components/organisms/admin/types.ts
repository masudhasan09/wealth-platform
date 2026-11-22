export interface ProviderConfigView {
  provider: string;
  name: string;
  kind: 'equity' | 'crypto' | 'yield';
  requiresKey: boolean;
  isConfigured: boolean;
  keyMasked?: string;
  enabled: boolean;
  priority: number;
  lastSuccessAt?: Date | string | null;
  lastError?: string | null;
}

export interface AuditEntry {
  id: string;
  actorUserId: string;
  actorEmail?: string;
  action: string;
  target: string;
  metadata?: string | null;
  createdAt: Date | string;
}
