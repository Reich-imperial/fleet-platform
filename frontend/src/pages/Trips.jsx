import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TripForm from '../components/forms/TripForm';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';
import { createTrip, getTrips, dispatchTrip, completeTrip } from '../services/tripService';

export default function Trips() {
  const navigate = useNavigate();
  const [trips,    setTrips]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [formError, setFormError] = useState(null);
  // Track which trip row currently has an action in flight, and any
  // per-row error, keyed by trip id — so clicking Dispatch on one row
  // doesn't disable/error every other row's button.
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'trip';

  const load = () => {
    setLoading(true);
    getTrips()
      .then((data) =>
        setTrips(
          (data || []).map((t) => ({
            ...t,
            shortId:   t.id.slice(0, 8).toUpperCase(),
            departure: t.scheduledDeparture
              ? new Date(t.scheduledDeparture).toLocaleString()
              : '—',
          }))
        )
      )
      .catch(() => setError('Failed to load trips'))
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
      await createTrip({
        vehicleId:          data.vehicleId,
        driverId:           data.driverId,
        origin:             data.origin,
        destination:        data.destination,
        cargoType:          data.cargoType,
        cargoVolumeLitres:  Number(data.volume || data.cargoVolumeLitres || 0),
        scheduledDeparture: data.scheduledDeparture || new Date().toISOString(),
        notes:              data.notes || '',
      });
      closeForm();
      load();
    } catch (err) {
      setFormError(err?.error?.message || 'Failed to create trip');
    } finally {
      setSaving(false);
    }
  };

  // Shared handler for both actions — action is either dispatchTrip or
  // completeTrip, both take just the trip id (matches tripService.js).
  const handleAction = async (e, action, tripId) => {
    e.stopPropagation(); // don't trigger the row's onRowClick navigation
    setActionLoadingId(tripId);
    setActionError(null);
    try {
      await action(tripId);
      load(); // refresh the list so the new status/badge shows immediately
    } catch (err) {
      setActionError(err?.error?.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = [
    { key: 'shortId',    header: 'Trip ID',   sortable: true },
    { key: 'vehicle',    header: 'Vehicle',   sortable: true },
    { key: 'driver',     header: 'Driver',    sortable: true },
    { key: 'route',      header: 'Route',     sortable: true },
    { key: 'departure',  header: 'Departure', sortable: true },
    {
      key: 'status', header: 'Status', sortable: true,
      render: (v) => <Badge status={v} />,
    },
    {
      key: 'actions', header: 'Actions', sortable: false,
      render: (_, row) => {
        const isLoading = actionLoadingId === row.id;
        if (row.status === 'scheduled') {
          return (
            <button
              className="ops-button-dispatch"
              disabled={isLoading}
              onClick={(e) => handleAction(e, dispatchTrip, row.id)}
            >
              {isLoading ? 'Dispatching...' : 'Dispatch'}
            </button>
          );
        }
        if (row.status === 'in_transit') {
          return (
            <button
              className="ops-button-complete"
              disabled={isLoading}
              onClick={(e) => handleAction(e, completeTrip, row.id)}
            >
              {isLoading ? 'Completing...' : 'Complete'}
            </button>
          );
        }
        return <span className="text-[13px] text-[var(--color-muted)]">—</span>;
      },
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium">Trip board</h2>
        <button
          className="ops-button"
          onClick={() => setSearchParams({ new: 'trip' })}
        >
          Create trip
        </button>
      </div>
      {showingForm && (
        <div>
          {formError && (
            <div className="mb-2 rounded-md bg-[var(--color-danger-subtle)] px-3 py-2 text-[13px] text-[var(--color-danger)]">
              {formError}
            </div>
          )}
          <TripForm
            onCancel={closeForm}
            onSubmit={handleSubmit}
            saving={saving}
          />
        </div>
      )}
      {actionError && (
        <div className="rounded-md bg-[var(--color-danger-subtle)] px-3 py-2 text-[13px] text-[var(--color-danger)]">
          {actionError}
        </div>
      )}
      {loading && (
        <div className="ops-card animate-pulse p-8 text-center text-[13px] text-[var(--color-muted)]">
          Loading trips...
        </div>
      )}
      {error && (
        <div className="text-[13px] text-[var(--color-danger)]">{error}</div>
      )}
      {!loading && !error && (
        <DataTable
          columns={columns}
          data={trips}
          onRowClick={(row) => navigate(`/trips/${row.id}`)}
        />
      )}
    </div>
  );
}
