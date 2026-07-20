import { useEffect, useState } from 'react';
import AlertItem from '../components/ui/AlertItem';
import api from '../services/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/dashboard/alerts')
      .then((response) => setAlerts(response.data || []))
      .catch(() => setError('Failed to load maintenance alerts'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ops-card animate-pulse p-8 text-center text-[13px] text-[var(--color-muted)]">Loading alerts...</div>;
  if (error) return <div className="text-[13px] text-[var(--color-danger)]">{error}</div>;

  return (
    <section className="ops-card overflow-hidden">
      <div className="border-b border-[var(--color-line)] px-4 py-3">
        <h2 className="text-[16px] font-medium">Maintenance alerts</h2>
        <p className="mt-1 text-[13px] text-[var(--color-muted)]">Vehicles with overdue or upcoming service in the next seven days.</p>
      </div>
      {alerts.length === 0 ? (
        <div className="p-4 text-[13px] text-[var(--color-muted)]">No maintenance alerts — all vehicles are up to date.</div>
      ) : alerts.map((alert) => (
        <AlertItem
          key={alert.id}
          severity="warning"
          title={alert.registration_number}
          meta={`Service due: ${new Date(alert.next_service_date).toLocaleDateString()}`}
        />
      ))}
    </section>
  );
}
