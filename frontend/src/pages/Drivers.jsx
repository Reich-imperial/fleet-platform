import { useSearchParams } from 'react-router-dom';
import DriverForm from '../components/forms/DriverForm';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';

const drivers = [
  { id: '1', name: 'Kelechi Okafor', license: 'DRV-88421', phone: '+234 800 111 2901', status: 'on_trip' },
  { id: '2', name: 'Musa Bello', license: 'DRV-11845', phone: '+234 800 991 2410', status: 'available' },
  { id: '3', name: 'Aisha Danjuma', license: 'DRV-55420', phone: '+234 800 714 9033', status: 'inactive' },
];

const columns = [
  { key: 'name', header: 'Driver', sortable: true },
  { key: 'license', header: 'License', sortable: true },
  { key: 'phone', header: 'Phone' },
  { key: 'status', header: 'Status', render: (value) => <Badge status={value} />, sortable: true },
];

export default function Drivers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'driver';
  const closeForm = () => setSearchParams({});

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium">Driver roster</h2>
        <button className="ops-button" onClick={() => setSearchParams({ new: 'driver' })}>Add driver</button>
      </div>
      {showingForm ? (
        <DriverForm
          onCancel={closeForm}
          onSubmit={(data) => {
            console.log('Create driver placeholder submit', data);
            closeForm();
          }}
        />
      ) : null}
      <DataTable columns={columns} data={drivers} />
    </div>
  );
}
