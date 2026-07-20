import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PencilLine } from 'lucide-react';
import VehicleForm from '../components/forms/VehicleForm';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import { createVehicle, getVehicles, updateVehicle } from '../services/vehicleService';

const statusOptions = ['available', 'in_transit', 'maintenance', 'decommissioned'];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'vehicle';

  const load = () => {
    setLoading(true);
    getVehicles().then(setVehicles).catch(() => setError('Failed to load vehicles')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const closeForm = () => {
    setFormError(null);
    setSearchParams({});
  };

  const handleSubmit = async (data) => {
    setSaving(true);
    setFormError(null);
    try {
      await createVehicle({ ...data, year: Number(data.year), capacityLitres: Number(data.capacityLitres) });
      closeForm();
      load();
    } catch (err) {
      setFormError(err?.error?.message || 'Failed to create vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (event) => {
    event.preventDefault();
    const status = new FormData(event.currentTarget).get('status');
    setSaving(true);
    setFormError(null);
    try {
      await updateVehicle(editingVehicle.id, { status });
      setEditingVehicle(null);
      load();
    } catch (err) {
      setFormError(err?.error?.message || 'Failed to update vehicle status');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'registrationNumber', header: 'Registration', sortable: true },
    { key: 'make', header: 'Make', sortable: true },
    { key: 'model', header: 'Model', sortable: true },
    { key: 'year', header: 'Year', sortable: true },
    { key: 'type', header: 'Type' },
    { key: 'capacityLitres', header: 'Capacity', render: (value) => value ? `${Number(value).toLocaleString()} L` : '—' },
    { key: 'status', header: 'Status', sortable: true, render: (value) => <Badge status={value} /> },
    {
      key: 'actions', header: 'Actions',
      render: (_, vehicle) => (
        <button
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/5 px-2.5 py-1.5 text-[12px] font-medium text-primary transition-colors hover:border-primary/45 hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/25"
          title={`Edit status for ${vehicle.registrationNumber}`}
          onClick={() => { setFormError(null); setEditingVehicle(vehicle); }}
        >
          <PencilLine size={13} strokeWidth={2} />
          Edit status
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium">Fleet registry</h2>
        <button className="ops-button" onClick={() => setSearchParams({ new: 'vehicle' })}>Add vehicle</button>
      </div>

      {formError && <div className="rounded-md bg-[var(--color-danger-subtle)] px-3 py-2 text-[13px] text-[var(--color-danger)]">{formError}</div>}

      {showingForm && <VehicleForm onCancel={closeForm} onSubmit={handleSubmit} saving={saving} />}

      {editingVehicle && (
        <form className="rounded-card border border-primary/20 bg-primary/5 p-4 shadow-sm" onSubmit={handleStatusUpdate}>
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary"><PencilLine size={14} /></span>
            <div>
              <div className="text-[13px] font-medium">Update vehicle status</div>
              <div className="text-[11px] text-[var(--color-muted)]">{editingVehicle.registrationNumber}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--color-muted)]">Status</div>
            <select className="ops-input w-full" name="status" defaultValue={editingVehicle.status}>
              {statusOptions.map((status) => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
            </select>
          </div>
          <button className="ops-button-secondary" type="button" onClick={() => { setEditingVehicle(null); setFormError(null); }}>Cancel</button>
          <button className="ops-button" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save status'}</button>
          </div>
        </form>
      )}

      {loading && <div className="ops-card animate-pulse p-8 text-center text-[13px] text-[var(--color-muted)]">Loading vehicles...</div>}
      {error && <div className="text-[13px] text-[var(--color-danger)]">{error}</div>}
      {!loading && !error && <DataTable columns={columns} data={vehicles} />}
    </div>
  );
}
