import { AlertTriangle, Fuel, Gauge, Navigation, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import AlertItem from '../components/ui/AlertItem';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import StatCard from '../components/ui/StatCard';
import api from '../services/api';

const tripColumns = [
  { key: 'id',     header: 'Trip ID',  sortable: true },
  { key: 'route',  header: 'Route',    sortable: true },
  { key: 'driver', header: 'Driver',   sortable: true },
  {
    key: 'status', header: 'Status', sortable: true,
    render: (value) => <Badge status={value} />,
  },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trips,   setTrips]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/trips'),
    ])
      .then(([summaryRes, tripsRes]) => {
        setSummary(summaryRes.data);
        // Show only active trips on dashboard
        setTrips(
          (tripsRes.data || [])
            .filter((t) => ['scheduled', 'in_transit'].includes(t.status))
            .slice(0, 5)
            .map((t) => ({
              id:     t.id.slice(0, 8).toUpperCase(),
              route:  t.route,
              driver: t.driver,
              status: t.status,
            }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ops-card h-24 animate-pulse bg-[var(--color-surface-2)]" />
          ))}
        </div>
      </div>
    );
  }

  const fleet       = summary?.fleet        ?? { total: 0, available: 0, in_transit: 0, maintenance: 0 };
  const activeTrips = summary?.activeTrips  ?? 0;
  const fuel        = summary?.fuelThisMonth ?? { litres: 0, cost: 0 };
  const alerts      = summary?.maintenanceAlerts ?? [];

  const fuelLabel = fuel.litres >= 1000
    ? `${(fuel.litres / 1000).toFixed(1)}k L`
    : `${fuel.litres} L`;

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total fleet"
          value={fleet.total}
          delta={`${fleet.available} available`}
          deltaType="neutral"
          icon={Truck}
        />
        <StatCard
          label="Active trips"
          value={activeTrips}
          delta={`${fleet.in_transit} in transit`}
          deltaType="neutral"
          icon={Navigation}
        />
        <StatCard
          label="Fuel this month"
          value={fuelLabel}
          delta={fuel.cost > 0 ? `₦${fuel.cost.toLocaleString()}` : 'No logs yet'}
          deltaType="neutral"
          icon={Fuel}
        />
        <StatCard
          label="Open alerts"
          value={alerts.length}
          delta={alerts.length > 0 ? `${alerts.length} need attention` : 'All clear'}
          deltaType={alerts.length > 0 ? 'down' : 'neutral'}
          icon={AlertTriangle}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Active trips table */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[16px] font-medium">Active trips</h2>
          </div>
          {trips.length === 0 ? (
            <div className="ops-card p-6 text-center text-[13px] text-[var(--color-muted)]">
              No active trips
            </div>
          ) : (
            <DataTable columns={tripColumns} data={trips} />
          )}
        </section>

        {/* Maintenance alerts */}
        <section className="ops-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--color-line)] px-3 py-2">
            <span className="ops-icon-tile">
              <AlertTriangle size={15} />
            </span>
            <h2 className="text-[16px] font-medium">Maintenance alerts</h2>
          </div>
          {alerts.length === 0 ? (
            <div className="p-4 text-[13px] text-[var(--color-muted)]">
              No alerts — all vehicles up to date
            </div>
          ) : (
            alerts.map((alert) => (
              <AlertItem
                key={alert.id}
                severity="warning"
                title={alert.registration_number}
                meta={`Service due: ${new Date(alert.next_service_date).toLocaleDateString()}`}
              />
            ))
          )}
        </section>
      </div>

      {/* Fleet overview */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[16px] font-medium">Fleet status</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Available',      value: fleet.available,      color: 'var(--color-success)' },
            { label: 'In transit',     value: fleet.in_transit,     color: 'var(--color-info)'    },
            { label: 'Maintenance',    value: fleet.maintenance,    color: 'var(--color-warning)'  },
            { label: 'Decommissioned', value: fleet.decommissioned, color: 'var(--color-muted)'   },
          ].map(({ label, value, color }) => (
            <div key={label} className="ops-card p-4">
              <div className="text-[11px] text-[var(--color-muted)]">{label}</div>
              <div className="mt-1 text-[22px] font-medium" style={{ color }}>{value ?? 0}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
