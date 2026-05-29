export default function DriverForm({ onSubmit, onCancel, initialData = {} }) {
  const submit = (event) => {
    event.preventDefault();
    onSubmit?.(Object.fromEntries(new FormData(event.currentTarget)));
  };

  return (
    <form className="ops-card grid gap-3 p-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <input className="ops-input" name="firstName" placeholder="First name" defaultValue={initialData.firstName} />
        <input className="ops-input" name="lastName" placeholder="Last name" defaultValue={initialData.lastName} />
        <input className="ops-input" name="licenseNumber" placeholder="License number" defaultValue={initialData.licenseNumber} />
        <input className="ops-input" name="licenseExpiry" placeholder="License expiry" defaultValue={initialData.licenseExpiry} />
        <input className="ops-input" name="phone" placeholder="Phone" defaultValue={initialData.phone} />
        <select className="ops-input" name="status" defaultValue={initialData.status ?? 'available'}>
          <option value="available">Available</option>
          <option value="on_trip">On trip</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button className="ops-button-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="ops-button" type="submit">Save driver</button>
      </div>
    </form>
  );
}
