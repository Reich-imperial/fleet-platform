const styles = {
  in_transit: 'bg-primary-light text-primary-dark dark:bg-primary/20 dark:text-[#8FC8F7]',
  scheduled: 'bg-warning-light text-warning dark:bg-warning/20 dark:text-[#E3B36C]',
  delivered: 'bg-success-light text-success dark:bg-success/25 dark:text-[#9ACB74]',
  cancelled: 'bg-danger-light text-danger dark:bg-danger/20 dark:text-[#E48E8E]',
  available: 'bg-success-light text-success dark:bg-success/25 dark:text-[#9ACB74]',
  maintenance: 'bg-warning-light text-warning dark:bg-warning/20 dark:text-[#E3B36C]',
  decommissioned: 'bg-[var(--color-surface-strong)] text-[var(--color-muted)] dark:bg-white/10 dark:text-[#AAB3B0]',
  on_trip: 'bg-primary-light text-primary-dark dark:bg-primary/20 dark:text-[#8FC8F7]',
  inactive: 'bg-[var(--color-surface-strong)] text-[var(--color-muted)] dark:bg-white/10 dark:text-[#AAB3B0]',
};

const labels = {
  in_transit: 'In transit',
  scheduled: 'Scheduled',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  available: 'Available',
  maintenance: 'Maintenance',
  decommissioned: 'Decommissioned',
  on_trip: 'On trip',
  inactive: 'Inactive',
};

export default function Badge({ status }) {
  return (
    <span
      className={[
        'inline-flex rounded-badge border border-current/10 px-2 py-0.5 text-[10px] font-medium leading-4',
        styles[status] ?? 'bg-[var(--color-surface-strong)] text-[var(--color-muted)]',
      ].join(' ')}
    >
      {labels[status] ?? status}
    </span>
  );
}
