import { useEffect, useState } from 'react';
import api from '@/services/api';

export default function TripForm({ onSubmit, onCancel, saving, initialData = {} }) {
  const [vehicles, setVehicles] = useState([]);
  const [drivers,  setDrivers]  = useState([]);

  useEffect(() => {
    api.get('/vehicles')
      .then((r) => setVehicles((r.data || []).filter((v) => v.status === 'available')))
      .catch(() => {});
    api.get('/drivers')
      .then((r) => setDrivers((r.data || []).filter((d) => d.status === 'available')))
      .catch(() => {});
  }, []);

  const submit = (e) => {
    e.preventDefault();
    onSubmit?.(Object.fromEntries(new FormData(e.currentTarget)));
  };

  return (
    <form className="ops-card grid gap-3 p-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <input className="ops-input" name="origin"      placeholder="Origin depot"  required defaultValue={initialData.origin} />
        <input className="ops-input" name="destination" placeholder="Destination"   required defaultValue={initialData.destination} />

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[var(--color-muted)]">Vehicle (available)</label>
          <select className="ops-input" name="vehicleId" required defaultValue={initialData.vehicleId ?? ''}>
            <option value="" disabled>Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.registrationNumber} — {v.make} {v.model}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[var(--color-muted)]">Driver (available)</label>
          <select className="ops-input" name="driverId" required defaultValue={initialData.driverId ?? ''}>
            <option value="" disabled>Select driver</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.name} — {d.licenseNumber}</option>
            ))}
          </select>
        </div>

        <select className="ops-input" name="cargoType" defaultValue={initialData.cargoType ?? 'refined_fuel'}>
          <option value="refined_fuel">Refined fuel</option>
          <option value="crude_oil">Crude oil</option>
          <option value="lpg">LPG</option>
          <option value="chemicals">Chemicals</option>
        </select>

        <input className="ops-input" name="volume" placeholder="Volume (litres)" type="number" required defaultValue={initialData.volume} />

        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-[11px] text-[var(--color-muted)]">Scheduled departure</label>
          <input className="ops-input" name="scheduledDeparture" type="datetime-local" required defaultValue={initialData.scheduledDeparture} />
        </div>
      </div>

      <textarea className="ops-input h-20 py-2" name="notes" placeholder="Operational notes" defaultValue={initialData.notes} />

      <div className="flex justify-end gap-2">
        <button className="ops-button-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="ops-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save trip'}</button>
      </div>
    </form>
  );
}
