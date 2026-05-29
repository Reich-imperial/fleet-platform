export default function VehicleForm({ onSubmit, onCancel, initialData = {} }) {
  const submit = (event) => {
    event.preventDefault();
    onSubmit?.(Object.fromEntries(new FormData(event.currentTarget)));
  };

  return (
    <form className="ops-card grid gap-3 p-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <input className="ops-input" name="registrationNumber" placeholder="Registration number" defaultValue={initialData.registrationNumber} />
        <input className="ops-input" name="make" placeholder="Make" defaultValue={initialData.make} />
        <input className="ops-input" name="model" placeholder="Model" defaultValue={initialData.model} />
        <input className="ops-input" name="year" placeholder="Year" defaultValue={initialData.year} />
        <select className="ops-input" name="type" defaultValue={initialData.type ?? 'tanker'}>
          <option value="tanker">Tanker</option>
          <option value="truck">Truck</option>
          <option value="trailer">Trailer</option>
        </select>
        <input className="ops-input" name="capacityLitres" placeholder="Capacity litres" defaultValue={initialData.capacityLitres} />
      </div>
      <div className="flex justify-end gap-2">
        <button className="ops-button-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="ops-button" type="submit">Save vehicle</button>
      </div>
    </form>
  );
}
