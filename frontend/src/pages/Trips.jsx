import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import TripForm from '../components/forms/TripForm';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';

const trips = [
  { id: 'TRP-1048', vehicle: 'TKR-231-RV', driver: 'K. Okafor', route: 'Warri -> Abuja', status: 'in_transit', departure: '29 May 2026 08:00' },
  { id: 'TRP-1049', vehicle: 'TKR-482-LA', driver: 'M. Bello', route: 'Apapa -> Ibadan', status: 'scheduled', departure: '29 May 2026 14:30' },
  { id: 'TRP-1050', vehicle: 'TKR-119-PH', driver: 'A. Danjuma', route: 'Port Harcourt -> Enugu', status: 'delivered', departure: '28 May 2026 06:15' },
];

const columns = [
  { key: 'id', header: 'Trip ID', sortable: true },
  { key: 'vehicle', header: 'Vehicle', sortable: true },
  { key: 'driver', header: 'Driver', sortable: true },
  { key: 'route', header: 'Route', sortable: true },
  { key: 'departure', header: 'Departure', sortable: true },
  { key: 'status', header: 'Status', render: (value) => <Badge status={value} />, sortable: true },
];

export default function Trips() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'trip';

  const closeForm = () => setSearchParams({});

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium">Trip board</h2>
        <button className="ops-button" onClick={() => setSearchParams({ new: 'trip' })}>Create trip</button>
      </div>
      {showingForm ? (
        <TripForm
          onCancel={closeForm}
          onSubmit={(data) => {
            console.log('Create trip placeholder submit', data);
            closeForm();
          }}
        />
      ) : null}
      <DataTable columns={columns} data={trips} onRowClick={(row) => navigate(`/trips/${row.id}`)} />
    </div>
  );
}
