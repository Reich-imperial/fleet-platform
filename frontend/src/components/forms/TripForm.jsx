export default function TripForm({ onSubmit, onCancel, initialData = {} }) {
  const submit = (event) => {
    event.preventDefault();
    onSubmit?.(Object.fromEntries(new FormData(event.currentTarget)));
  };

  return (
    <form className="ops-card grid gap-3 p-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <input className="ops-input" name="origin" placeholder="Origin" defaultValue={initialData.origin} />
        <input className="ops-input" name="destination" placeholder="Destination" defaultValue={initialData.destination} />
        <input className="ops-input" name="vehicleId" placeholder="Vehicle ID" defaultValue={initialData.vehicleId} />
        <input className="ops-input" name="driverId" placeholder="Driver ID" defaultValue={initialData.driverId} />
        <select className="ops-input" name="cargoType" defaultValue={initialData.cargoType ?? 'crude_oil'}>
          <option value="crude_oil">Crude oil</option>
          <option value="refined_fuel">Refined fuel</option>
          <option value="lpg">LPG</option>
          <option value="chemicals">Chemicals</option>
        </select>
        <input className="ops-input" name="volume" placeholder="Cargo volume litres" defaultValue={initialData.volume} />
      </div>
      <textarea className="ops-input h-20 py-2" name="notes" placeholder="Operational notes" defaultValue={initialData.notes} />
      <div className="flex justify-end gap-2">
        <button className="ops-button-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="ops-button" type="submit">Save trip</button>
      </div>
    </form>
  );
}
