import { useEffect, useState } from 'react';
import api from '../../services/api';

const now = new Date();
const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

export default function MaintenanceLogForm({ onSubmit, onCancel, saving }) {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    api.get('/vehicles').then((response) => setVehicles(response.data || [])).catch(() => {});
  }, []);

  const submit = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    onSubmit?.({ ...data, nextServiceDate: data.nextServiceDate || null });
  };

  return (
    <form className="ops-card grid gap-3 p-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[var(--color-muted)]">Vehicle</label>
          <select className="ops-input" name="vehicleId" required defaultValue="">
            <option value="" disabled>Select vehicle</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>)}
          </select>
        </div>
        <select className="ops-input" name="type" defaultValue="routine">
          <option value="routine">Routine</option>
          <option value="repair">Repair</option>
          <option value="inspection">Inspection</option>
        </select>
        <input className="ops-input" name="cost" type="number" min="0" step="0.01" required placeholder="Cost" />
        <input className="ops-input" name="performedBy" required placeholder="Performed by" />
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[var(--color-muted)]">Performed at</label>
          <input className="ops-input" name="performedAt" type="datetime-local" required defaultValue={localDateTime} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[var(--color-muted)]">Next service date (optional)</label>
          <input className="ops-input" name="nextServiceDate" type="date" />
        </div>
      </div>
      <textarea className="ops-input h-20 py-2" name="description" required placeholder="Service description" />
      <div className="flex justify-end gap-2">
        <button className="ops-button-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="ops-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save service log'}</button>
      </div>
    </form>
  );
}
