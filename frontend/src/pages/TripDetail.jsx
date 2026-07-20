import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import { getTrip } from '../services/tripService';

const formatDateTime = (value) => value ? new Date(value).toLocaleString() : '—';
const formatCargo = (value) => value ? value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : '—';

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getTrip(id).then(setTrip).catch(() => setError('Failed to load trip details'));
  }, [id]);

  if (error) return <div className="text-[13px] text-[var(--color-danger)]">{error}</div>;
  if (!trip) return <div className="ops-card animate-pulse p-8 text-center text-[13px] text-[var(--color-muted)]">Loading trip details...</div>;

  const lifecycle = [
    { label: 'Scheduled', timestamp: trip.scheduledDeparture, detail: 'Scheduled departure' },
    trip.actualDeparture && { label: 'Departed', timestamp: trip.actualDeparture, detail: 'Actual departure' },
    trip.actualArrival && { label: 'Delivered', timestamp: trip.actualArrival, detail: 'Actual arrival' },
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
      <section className="ops-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-medium">{trip.id.slice(0, 8).toUpperCase()}</h2>
            <p className="mt-1 text-[13px] text-[var(--color-muted)]">{trip.origin} to {trip.destination}</p>
          </div>
          <Badge status={trip.status} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--color-line)] pt-4 text-[13px] md:grid-cols-4">
          <div><div className="text-[11px] text-[var(--color-muted)]">Vehicle</div>{trip.vehicle}</div>
          <div><div className="text-[11px] text-[var(--color-muted)]">Driver</div>{trip.driver}</div>
          <div><div className="text-[11px] text-[var(--color-muted)]">Cargo</div>{formatCargo(trip.cargoType)}</div>
          <div><div className="text-[11px] text-[var(--color-muted)]">Volume</div>{Number(trip.cargoVolumeLitres).toLocaleString()} L</div>
          <div><div className="text-[11px] text-[var(--color-muted)]">Scheduled departure</div>{formatDateTime(trip.scheduledDeparture)}</div>
          <div><div className="text-[11px] text-[var(--color-muted)]">Estimated arrival</div>{formatDateTime(trip.estimatedArrival)}</div>
          <div><div className="text-[11px] text-[var(--color-muted)]">Actual departure</div>{formatDateTime(trip.actualDeparture)}</div>
          <div><div className="text-[11px] text-[var(--color-muted)]">Actual arrival</div>{formatDateTime(trip.actualArrival)}</div>
        </div>
      </section>

      <aside className="ops-card overflow-hidden">
        <div className="border-b border-[var(--color-line)] px-3 py-2 text-[16px] font-medium">Trip lifecycle</div>
        <div className="p-3">
          {lifecycle.map((item) => (
            <div key={item.label} className="border-l border-[var(--color-line)] pb-4 pl-3 text-[13px] last:pb-0">
              <div className="text-[var(--color-ink)]">{item.label}</div>
              <div className="text-[11px] text-[var(--color-muted)]">{item.detail}: {formatDateTime(item.timestamp)}</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
