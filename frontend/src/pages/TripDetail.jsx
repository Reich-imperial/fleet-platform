import { useParams } from 'react-router-dom';
import Badge from '../components/ui/Badge';

const checkpoints = ['Loaded at depot', 'Security seal verified', 'Departed terminal', 'In transit'];

export default function TripDetail() {
  const { id } = useParams();

  return (
    <div className="grid grid-cols-[1fr_320px] gap-4">
      <section className="ops-card p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-medium">{id}</h2>
            <p className="mt-1 text-[13px] text-[var(--color-muted)]">Warri Depot to Abuja North Terminal</p>
          </div>
          <Badge status="in_transit" />
        </div>
        <div className="mt-5 grid grid-cols-4 gap-3 border-t border-[var(--color-line)] pt-4 text-[13px]">
          <div><div className="text-[11px] text-[var(--color-muted)]">Vehicle</div>TKR-231-RV</div>
          <div><div className="text-[11px] text-[var(--color-muted)]">Driver</div>K. Okafor</div>
          <div><div className="text-[11px] text-[var(--color-muted)]">Cargo</div>Crude oil</div>
          <div><div className="text-[11px] text-[var(--color-muted)]">Volume</div>38,000 L</div>
        </div>
      </section>

      <aside className="ops-card overflow-hidden">
        <div className="border-b border-[var(--color-line)] px-3 py-2 text-[16px] font-medium">Trip events</div>
        <div className="p-3">
          {checkpoints.map((item) => (
            <div key={item} className="border-l border-[var(--color-line)] pb-4 pl-3 text-[13px] last:pb-0">
              <div className="text-[var(--color-ink)]">{item}</div>
              <div className="text-[11px] text-[var(--color-muted)]">Operational checkpoint</div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
