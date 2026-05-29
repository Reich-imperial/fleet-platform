import { useSearchParams } from 'react-router-dom';
import DataTable from '../components/ui/DataTable';

const logs = [
  { id: 'FL-2201', vehicle: 'TKR-482-LA', litres: '1,200', rate: 'NGN 820', total: 'NGN 984,000', location: 'Apapa depot' },
  { id: 'FL-2202', vehicle: 'TKR-231-RV', litres: '950', rate: 'NGN 818', total: 'NGN 777,100', location: 'Lokoja stop' },
  { id: 'FL-2203', vehicle: 'TRL-904-KD', litres: '1,500', rate: 'NGN 821', total: 'NGN 1,231,500', location: 'Kaduna yard' },
];

const columns = [
  { key: 'id', header: 'Log ID', sortable: true },
  { key: 'vehicle', header: 'Vehicle', sortable: true },
  { key: 'litres', header: 'Litres', sortable: true },
  { key: 'rate', header: 'Cost / L', sortable: true },
  { key: 'total', header: 'Total', sortable: true },
  { key: 'location', header: 'Location', sortable: true },
];

export default function FuelLogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'fuel';
  const closeForm = () => setSearchParams({});

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium">Fuel purchase logs</h2>
        <button className="ops-button" onClick={() => setSearchParams({ new: 'fuel' })}>Log fuel</button>
      </div>
      {showingForm ? (
        <form
          className="ops-card grid gap-3 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            console.log('Create fuel log placeholder submit', Object.fromEntries(new FormData(event.currentTarget)));
            closeForm();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <input className="ops-input" name="vehicleId" placeholder="Vehicle ID" />
            <input className="ops-input" name="tripId" placeholder="Trip ID optional" />
            <input className="ops-input" name="litresPurchased" placeholder="Litres purchased" />
            <input className="ops-input" name="costPerLitre" placeholder="Cost per litre" />
            <input className="ops-input" name="odometerReading" placeholder="Odometer reading" />
            <input className="ops-input" name="location" placeholder="Location" />
          </div>
          <div className="flex justify-end gap-2">
            <button className="ops-button-secondary" type="button" onClick={closeForm}>Cancel</button>
            <button className="ops-button" type="submit">Save fuel log</button>
          </div>
        </form>
      ) : null}
      <DataTable columns={columns} data={logs} />
    </div>
  );
}
