import { useEffect, useState } from 'react';
import api from '../../services/api';

const today = new Date().toISOString().slice(0, 10);

export default function FuelLogForm({ onSubmit, onCancel, saving }) {
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [vehicleId, setVehicleId] = useState('');

  useEffect(() => {
    api.get('/vehicles').then((response) => setVehicles(response.data || [])).catch(() => {});
    api.get('/trips').then((response) => setTrips(response.data || [])).catch(() => {});
  }, []);

  const submit = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    onSubmit?.({ ...data, tripId: data.tripId || null });
  };

  const matchingTrips = trips.filter((trip) => trip.vehicleId === vehicleId);

  return (
    <form className="ops-card grid gap-3 p-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[var(--color-muted)]">Vehicle</label>
          <select className="ops-input" name="vehicleId" value={vehicleId} required onChange={(event) => setVehicleId(event.target.value)}>
            <option value="" disabled>Select vehicle</option>
            {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.registrationNumber}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[var(--color-muted)]">Trip (optional)</label>
          <select className="ops-input" name="tripId" defaultValue="" disabled={!vehicleId}>
            <option value="">No linked trip</option>
            {matchingTrips.map((trip) => <option key={trip.id} value={trip.id}>{trip.route}</option>)}
          </select>
        </div>
        <input className="ops-input" name="fuelledAt" type="date" required defaultValue={today} />
        <input className="ops-input" name="odometerReading" type="number" min="0" required placeholder="Odometer reading" />
        <input className="ops-input" name="litresPurchased" type="number" min="0.01" step="0.01" required placeholder="Litres purchased" />
        <input className="ops-input" name="costPerLitre" type="number" min="0.01" step="0.01" required placeholder="Cost per litre" />
        <input className="ops-input col-span-2" name="location" required placeholder="Location" />
      </div>
      <div className="flex justify-end gap-2">
        <button className="ops-button-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="ops-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save fuel log'}</button>
      </div>
    </form>
  );
}
