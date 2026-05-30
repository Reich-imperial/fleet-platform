import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import VehicleForm from '../components/forms/VehicleForm';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import { createVehicle, getVehicles } from '../services/vehicleService';

const columns = [
  { key: 'registrationNumber', header: 'Registration', sortable: true },
  { key: 'make',  header: 'Make',  sortable: true },
  { key: 'model', header: 'Model', sortable: true },
  { key: 'year',  header: 'Year',  sortable: true },
  { key: 'type',  header: 'Type' },
  {
    key: 'capacityLitres', header: 'Capacity',
    render: (v) => v ? `${Number(v).toLocaleString()} L` : '—',
  },
  {
    key: 'status', header: 'Status', sortable: true,
    render: (v) => <Badge status={v} />,
  },
];

export default function Vehicles() {
  const [vehicles, setVehicles]       = useState([]);
  const [loading,  setLoading]        = useState(true);
  const [error,    setError]          = useState(null);
  const [saving,   setSaving]         = useState(false);
  const [formError, setFormError]     = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'vehicle';

  const load = () => {
    setLoading(true);
    getVehicles()
      .then(setVehicles)
      .catch(() => setError('Failed to load vehicles'))
      .finally(() => setLoading(false));
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
      await createVehicle({
        ...data,
        year:          Number(data.year),
        capacityLitres: Number(data.capacityLitres),
      });
      closeForm();
      load(); // refresh table
    } catch (err) {
      setFormError(err?.error?.message || 'Failed to create vehicle');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium">Fleet registry</h2>
        <button
          className="ops-button"
          onClick={() => setSearchParams({ new: 'vehicle' })}
        >
          Add vehicle
        </button>
      </div>

      {showingForm && (
        <div>
          {formError && (
            <div className="mb-2 rounded-md bg-[var(--color-danger-subtle)] px-3 py-2 text-[13px] text-[var(--color-danger)]">
              {formError}
            </div>
          )}
          <VehicleForm
            onCancel={closeForm}
            onSubmit={handleSubmit}
            saving={saving}
          />
        </div>
      )}

      {loading && (
        <div className="ops-card animate-pulse p-8 text-center text-[13px] text-[var(--color-muted)]">
          Loading vehicles...
        </div>
      )}

      {error && (
        <div className="text-[13px] text-[var(--color-danger)]">{error}</div>
      )}

      {!loading && !error && (
        <DataTable columns={columns} data={vehicles} />
      )}
    </div>
  );
}
