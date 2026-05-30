import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DriverForm from '../components/forms/DriverForm';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import { createDriver, getDrivers } from '../services/driverService';

const columns = [
  { key: 'name',          header: 'Driver',  sortable: true },
  { key: 'licenseNumber', header: 'License', sortable: true },
  { key: 'phone',         header: 'Phone' },
  {
    key: 'status', header: 'Status', sortable: true,
    render: (v) => <Badge status={v} />,
  },
];

export default function Drivers() {
  const [drivers,  setDrivers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [formError, setFormError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'driver';

  const load = () => {
    setLoading(true);
    getDrivers()
      .then(setDrivers)
      .catch(() => setError('Failed to load drivers'))
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
      await createDriver(data);
      closeForm();
      load();
    } catch (err) {
      setFormError(err?.error?.message || 'Failed to create driver');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium">Driver roster</h2>
        <button
          className="ops-button"
          onClick={() => setSearchParams({ new: 'driver' })}
        >
          Add driver
        </button>
      </div>

      {showingForm && (
        <div>
          {formError && (
            <div className="mb-2 rounded-md bg-[var(--color-danger-subtle)] px-3 py-2 text-[13px] text-[var(--color-danger)]">
              {formError}
            </div>
          )}
          <DriverForm
            onCancel={closeForm}
            onSubmit={handleSubmit}
            saving={saving}
          />
        </div>
      )}

      {loading && (
        <div className="ops-card animate-pulse p-8 text-center text-[13px] text-[var(--color-muted)]">
          Loading drivers...
        </div>
      )}

      {error && (
        <div className="text-[13px] text-[var(--color-danger)]">{error}</div>
      )}

      {!loading && !error && (
        <DataTable columns={columns} data={drivers} />
      )}
    </div>
  );
}
