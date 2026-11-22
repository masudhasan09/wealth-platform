import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/security/roles';
import { getAdminDataSourcesAction } from '@/app/actions/providers';
import { DataSourcesClient } from './DataSourcesClient';

export const dynamic = 'force-dynamic';

export default async function AdminDataSourcesPage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const result = await getAdminDataSourcesAction();

  if ('error' in result) {
    return (
      <div className="p-8 text-center text-danger">
        <p className="font-semibold">Failed to load administrative data sources.</p>
        <p className="text-sm text-text-muted mt-1">{result.error}</p>
      </div>
    );
  }

  return (
    <DataSourcesClient
      initialProviders={result.providers}
      initialAuditLogs={result.auditLogs}
    />
  );
}

