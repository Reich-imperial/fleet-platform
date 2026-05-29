import { useSearchParams } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import DataTable from '../components/ui/DataTable';

const logs = [
  { id: 'MT-1401', vehicle: 'TKR-231-RV', type: 'Inspection', provider: 'Depot workshop', due: '31 May 2026', status: 'maintenance' },
  { id: 'MT-1402', vehicle: 'TKR-482-LA', type: 'Routine', provider: 'Fleet service bay', due: '05 Jun 2026', status: 'available' },
  { id: 'MT-1403', vehicle: 'TRL-904-KD', type: 'Repair', provider: 'Valve specialist', due: '29 May 2026', status: 'maintenance' },
];

const columns = [
  { key: 'id', header: 'Log ID', sortable: true },
  { key: 'vehicle', header: 'Vehicle', sortable: true },
  { key: 'type', header: 'Type', sortable: true },
  { key: 'provider', header: 'Performed by', sortable: true },
  { key: 'due', header: 'Next service', sortable: true },
  { key: 'status', header: 'Status', render: (value) => <Badge status={value} />, sortable: true },
];

export default function Maintenance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showingForm = searchParams.get('new') === 'maintenance';
  const closeForm = () => setSearchParams({});

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-medium">Maintenance register</h2>
        <button className="ops-button" onClick={() => setSearchParams({ new: 'maintenance' })}>Add service log</button>
      </div>
      {showingForm ? (
        <form
          className="ops-card grid gap-3 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            console.log('Create maintenance log placeholder submit', Object.fromEntries(new FormData(event.currentTarget)));
            closeForm();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <input className="ops-input" name="vehicleId" placeholder="Vehicle ID" />
            <select className="ops-input" name="type" defaultValue="routine">
              <option value="routine">Routine</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
            </select>
            <input className="ops-input" name="cost" placeholder="Cost" />
            <input className="ops-input" name="performedBy" placeholder="Performed by" />
            <input className="ops-input" name="performedAt" placeholder="Performed at" />
            <input className="ops-input" name="nextServiceDate" placeholder="Next service date" />
          </div>
          <textarea className="ops-input h-20 py-2" name="description" placeholder="Service description" />
          <div className="flex justify-end gap-2">
            <button className="ops-button-secondary" type="button" onClick={closeForm}>Cancel</button>
            <button className="ops-button" type="submit">Save service log</button>
          </div>
        </form>
      ) : null}
      <DataTable columns={columns} data={logs} />
    </div>
  );
}
