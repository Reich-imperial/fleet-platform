import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No records', message, action }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-card border border-[var(--color-line)] bg-[var(--color-surface)] px-6 py-10 text-center">
      <span className="ops-icon-tile mb-3 h-10 w-10">
        <Icon size={20} />
      </span>
      <div className="text-[14px] font-medium text-[var(--color-ink)]">{title}</div>
      {message ? <div className="mt-1 max-w-sm text-[13px] text-[var(--color-muted)]">{message}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
