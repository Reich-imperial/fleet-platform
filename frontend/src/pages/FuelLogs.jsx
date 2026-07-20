import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FuelLogForm from '../components/forms/FuelLogForm';
import DataTable from '../components/ui/DataTable';
import { createFuelLog, getFuelLogs } from '../services/fuelService';
import { getVehicles } from '../services/vehicleService';

const columns = [
  { key: 'shortId', header: 'Log ID', sortable: true },
  { key: 'fuelledAt', header: 'Date', sortable: true },
  { key: 'vehicle', header: 'Vehicle', sortable: true },
  { key: 'litresPurchased', header: 'Litres', sortable: true },
  { key: 'costPerLitre', header: 'Cost / L', render: (value) => `NGN ${Number(value).toLocaleString()}`, sortable: true },
  { key: 'totalCost', header: 'Total', render: (value) => `NGN ${Number(value).toLocaleString()}`, sortable: true },
  { key: 'location', header: 'Location', sortable: true },
];

export default function FuelLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'fuel';

  const load = (selectedVehicleId = vehicleId) => {
    setLoading(true);
    getFuelLogs(selectedVehicleId)
      .then((data) => setLogs((data || []).map((log) => ({ ...log, shortId: log.id.slice(0, 8).toUpperCase() }))))
      .catch(() => setError('Failed to load fuel logs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { getVehicles().then(setVehicles).catch(() => {}); }, []);
  useEffect(() => { load(vehicleId); }, [vehicleId]);

  const closeForm = () => { setFormError(null); setSearchParams({}); };
  const handleSubmit = async (data) => {
    setSaving(true);
    setFormError(null);
    try {
      await createFuelLog({ ...data, litresPurchased: Number(data.litresPurchased), costPerLitre: Number(data.costPerLitre), odometerReading: Number(data.odometerReading) });
      closeForm();
      load();
    } catch (requestError) {
      setFormError(requestError?.error?.message || 'Failed to create fuel log');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><h2 className="text-[16px] font-medium">Fuel purchase logs</h2><button className="ops-button" onClick={() => setSearchParams({ new: 'fuel' })}>Log fuel</button></div>
      <div className="flex max-w-xs flex-col gap-1"><label className="text-[11px] text-[var(--color-muted)]">View logs for vehicle</label><select className="ops-input" value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}><option value="">All vehicles</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>)}</select></div>
      {showingForm && <div>{formError && <div className="mb-2 rounded-md bg-[var(--color-danger-subtle)] px-3 py-2 text-[13px] text-[var(--color-danger)]">{formError}</div>}<FuelLogForm onCancel={closeForm} onSubmit={handleSubmit} saving={saving} /></div>}
      {loading && <div className="ops-card animate-pulse p-8 text-center text-[13px] text-[var(--color-muted)]">Loading fuel logs...</div>}
      {error && <div className="text-[13px] text-[var(--color-danger)]">{error}</div>}
      {!loading && !error && <DataTable columns={columns} data={logs} />}
    </div>
  );
}
