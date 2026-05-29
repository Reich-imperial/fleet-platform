import { AlertTriangle, Fuel, Gauge, Navigation, Truck } from 'lucide-react';
import AlertItem from '../components/ui/AlertItem';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import StatCard from '../components/ui/StatCard';

const trips = [
  { id: 'TRP-1048', route: 'Warri Depot -> Abuja', driver: 'K. Okafor', status: 'in_transit' },
  { id: 'TRP-1049', route: 'Apapa Terminal -> Ibadan', driver: 'M. Bello', status: 'scheduled' },
  { id: 'TRP-1050', route: 'Port Harcourt -> Enugu', driver: 'A. Danjuma', status: 'delivered' },
  { id: 'TRP-1051', route: 'Kaduna Refinery -> Kano', driver: 'S. Musa', status: 'in_transit' },
];

const vehicles = [
  { id: '1', reg: 'TKR-482-LA', model: 'Volvo FMX Tanker', capacity: '45,000 L', status: 'available' },
  { id: '2', reg: 'TKR-231-RV', model: 'MAN TGS Tanker', capacity: '38,000 L', status: 'in_transit' },
  { id: '3', reg: 'TRL-904-KD', model: 'Fuel Trailer', capacity: '50,000 L', status: 'maintenance' },
];

const tripColumns = [
  { key: 'id', header: 'Trip ID', sortable: true },
  { key: 'route', header: 'Route', sortable: true },
  { key: 'driver', header: 'Driver', sortable: true },
  { key: 'status', header: 'Status', render: (value) => <Badge status={value} />, sortable: true },
];

export default function Dashboard() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total fleet" value="128" delta="+6 this quarter" deltaType="up" icon={Truck} />
        <StatCard label="Active trips" value="34" delta="12 in transit" deltaType="neutral" icon={Navigation} />
        <StatCard label="Fuel this month" value="284k L" delta="-3.8% variance" deltaType="down" icon={Fuel} />
        <StatCard label="Open alerts" value="7" delta="3 critical" deltaType="down" icon={AlertTriangle} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[16px] font-medium">Active trips</h2>
            <button className="ops-button-secondary">Dispatch board</button>
          </div>
          <DataTable columns={tripColumns} data={trips} />
        </section>

        <section className="ops-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-3 py-2">
            <span className="ops-icon-tile">
              <AlertTriangle size={15} />
            </span>
            <h2 className="text-[16px] font-medium">Maintenance alerts</h2>
          </div>
          <AlertItem severity="critical" title="TKR-231-RV brake inspection overdue" meta="Due 2 days ago" />
          <AlertItem severity="warning" title="TRL-904-KD pressure valve service" meta="Next service in 48 hours" />
          <AlertItem severity="info" title="TKR-482-LA calibration window" meta="Scheduled this week" />
        </section>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[16px] font-medium">Fleet overview</h2>
          <button className="ops-button-secondary">View fleet</button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {vehicles.map((vehicle) => (
            <article key={vehicle.id} className="ops-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13px] font-medium">{vehicle.reg}</div>
                  <div className="mt-1 text-[12px] text-[var(--color-muted)]">{vehicle.model}</div>
                </div>
                <Badge status={vehicle.status} />
              </div>
              <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-line)] pt-3 text-[12px] text-[var(--color-muted)]">
                <Gauge size={14} />
                Capacity <span className="text-[var(--color-ink)]">{vehicle.capacity}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
