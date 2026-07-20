import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import DriverForm from '../components/forms/DriverForm';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import { createDriver, deleteDriver, getDrivers } from '../services/driverService';

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'driver';

  const load = () => {
    setLoading(true);
    getDrivers().then(setDrivers).catch(() => setError('Failed to load drivers')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const closeForm = () => { setFormError(null); setSearchParams({}); };

  const handleSubmit = async (data) => {
    setSaving(true);
    setFormError(null);
    try {
      await createDriver(data);
      closeForm();
      load();
    } catch (err) {
      setFormError(err?.error?.message || 'Failed to create driver');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (driver) => {
    if (!window.confirm(`Delete ${driver.name}? Their driver record will be hidden and their login disabled.`)) return;
    setDeletingId(driver.id);
    setFormError(null);
    try {
      await deleteDriver(driver.id);
      load();
    } catch (err) {
      setFormError(err?.error?.message || 'Failed to delete driver');
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { key: 'name', header: 'Driver', sortable: true },
    { key: 'licenseNumber', header: 'License', sortable: true },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status', sortable: true, render: (value) => <Badge status={value} /> },
    {
      key: 'actions', header: 'Actions',
      render: (_, driver) => (
        <button
          className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger-light px-2.5 py-1.5 text-[12px] font-medium text-danger transition-colors hover:border-danger/50 hover:bg-danger/15 focus:outline-none focus:ring-2 focus:ring-danger/25 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={deletingId === driver.id}
          title={`Delete ${driver.name} and disable their login`}
          onClick={() => handleDelete(driver)}
        >
          <Trash2 size={13} strokeWidth={2} />
          {deletingId === driver.id ? 'Deleting...' : 'Delete'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium">Driver roster</h2>
        <button className="ops-button" onClick={() => setSearchParams({ new: 'driver' })}>Add driver</button>
      </div>
      {formError && <div className="rounded-md bg-[var(--color-danger-subtle)] px-3 py-2 text-[13px] text-[var(--color-danger)]">{formError}</div>}
      {showingForm && <DriverForm onCancel={closeForm} onSubmit={handleSubmit} saving={saving} />}
      {loading && <div className="ops-card animate-pulse p-8 text-center text-[13px] text-[var(--color-muted)]">Loading drivers...</div>}
      {error && <div className="text-[13px] text-[var(--color-danger)]">{error}</div>}
      {!loading && !error && <DataTable columns={columns} data={drivers} />}
    </div>
  );
}
