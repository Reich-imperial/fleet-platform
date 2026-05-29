import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

const config = {
  critical: { icon: AlertCircle, color: 'text-danger dark:text-[#E48E8E]', bg: 'bg-danger-light dark:bg-danger/20' },
  warning: { icon: AlertTriangle, color: 'text-warning dark:text-[#E3B36C]', bg: 'bg-warning-light dark:bg-warning/20' },
  info: { icon: Info, color: 'text-primary dark:text-[#8FC8F7]', bg: 'bg-primary-light dark:bg-primary/20' },
};

export default function AlertItem({ severity = 'info', title, meta }) {
  const item = config[severity] ?? config.info;
  const Icon = item.icon;

  return (
    <div className="flex min-h-10 items-center gap-3 border-b border-[var(--color-line)] px-3 py-2 last:border-b-0">
      <span className={`flex h-6 w-6 items-center justify-center rounded-badge ${item.bg} ${item.color}`}>
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] text-[var(--color-ink)]">{title}</div>
        {meta ? <div className="truncate text-[11px] text-[var(--color-muted)]">{meta}</div> : null}
      </div>
    </div>
  );
}
