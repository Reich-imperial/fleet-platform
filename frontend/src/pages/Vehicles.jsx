import { useSearchParams } from 'react-router-dom';
import VehicleForm from '../components/forms/VehicleForm';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';

const vehicles = [
  { id: '1', registration: 'TKR-482-LA', make: 'Volvo', model: 'FMX Tanker', capacity: '45,000 L', status: 'available' },
  { id: '2', registration: 'TKR-231-RV', make: 'MAN', model: 'TGS Tanker', capacity: '38,000 L', status: 'in_transit' },
  { id: '3', registration: 'TRL-904-KD', make: 'Schmitz', model: 'Fuel Trailer', capacity: '50,000 L', status: 'maintenance' },
];

const columns = [
  { key: 'registration', header: 'Registration', sortable: true },
  { key: 'make', header: 'Make', sortable: true },
  { key: 'model', header: 'Model', sortable: true },
  { key: 'capacity', header: 'Capacity', sortable: true },
  { key: 'status', header: 'Status', render: (value) => <Badge status={value} />, sortable: true },
];

export default function Vehicles() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'vehicle';
  const closeForm = () => setSearchParams({});

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium">Fleet registry</h2>
        <button className="ops-button" onClick={() => setSearchParams({ new: 'vehicle' })}>Add vehicle</button>
      </div>
      {showingForm ? (
        <VehicleForm
          onCancel={closeForm}
          onSubmit={(data) => {
            console.log('Create vehicle placeholder submit', data);
            closeForm();
          }}
        />
      ) : null}
      <DataTable columns={columns} data={vehicles} />
    </div>
  );
}
