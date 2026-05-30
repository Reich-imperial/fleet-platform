export default function DriverForm({ onSubmit, onCancel, saving, initialData = {} }) {
  const submit = (event) => {
    event.preventDefault();
    onSubmit?.(Object.fromEntries(new FormData(event.currentTarget)));
  };

  return (
    <form className="ops-card grid gap-3 p-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <input className="ops-input" name="firstName" placeholder="First name" required defaultValue={initialData.firstName} />
        <input className="ops-input" name="lastName" placeholder="Last name" required defaultValue={initialData.lastName} />
        <input className="ops-input" name="licenseNumber" placeholder="License number" required defaultValue={initialData.licenseNumber} />

        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-[var(--color-muted)]">License expiry</label>
          <input className="ops-input" name="licenseExpiry" type="date" required defaultValue={initialData.licenseExpiry} />
        </div>

        <input className="ops-input" name="phone" placeholder="Phone e.g. +2348012345678" defaultValue={initialData.phone} />

        <select className="ops-input" name="status" defaultValue={initialData.status ?? 'available'}>
          <option value="available">Available</option>
          <option value="on_trip">On trip</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button className="ops-button-secondary" type="button" onClick={onCancel}>Cancel</button>
        <button className="ops-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save driver'}</button>
      </div>
    </form>
  );
}
