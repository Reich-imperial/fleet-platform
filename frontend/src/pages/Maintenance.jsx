import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import MaintenanceLogForm from '../components/forms/MaintenanceLogForm';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import { createMaintenanceLog, getMaintenanceLogs } from '../services/maintenanceService';

const columns = [
  { key: 'shortId', header: 'Log ID', sortable: true },
  { key: 'vehicle', header: 'Vehicle', sortable: true },
  { key: 'type', header: 'Type', sortable: true },
  { key: 'provider', header: 'Performed by', sortable: true },
  { key: 'due', header: 'Next service', sortable: true },
  { key: 'status', header: 'Status', render: (value) => <Badge status={value} />, sortable: true },
];

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'maintenance';

  const load = () => {
    setLoading(true);
    getMaintenanceLogs()
      .then((data) => setLogs((data || []).map((log) => ({ ...log, shortId: log.id.slice(0, 8).toUpperCase(), due: log.nextServiceDate || '—' }))))
      .catch(() => setError('Failed to load maintenance logs'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const closeForm = () => { setFormError(null); setSearchParams({}); };
  const handleSubmit = async (data) => {
    setSaving(true);
    setFormError(null);
    try {
      await createMaintenanceLog({ ...data, cost: Number(data.cost) });
      closeForm();
      load();
    } catch (requestError) {
      setFormError(requestError?.error?.message || 'Failed to create maintenance log');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h2 className="text-[16px] font-medium">Maintenance register</h2><button className="ops-button" onClick={() => setSearchParams({ new: 'maintenance' })}>Add service log</button></div>
      {showingForm && <div>{formError && <div className="mb-2 rounded-md bg-[var(--color-danger-subtle)] px-3 py-2 text-[13px] text-[var(--color-danger)]">{formError}</div>}<MaintenanceLogForm onCancel={closeForm} onSubmit={handleSubmit} saving={saving} /></div>}
      {loading && <div className="ops-card animate-pulse p-8 text-center text-[13px] text-[var(--color-muted)]">Loading maintenance logs...</div>}
      {error && <div className="text-[13px] text-[var(--color-danger)]">{error}</div>}
      {!loading && !error && <DataTable columns={columns} data={logs} />}
    </div>
  );
}
