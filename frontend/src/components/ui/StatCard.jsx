import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function StatCard({ label, value, delta, deltaType = 'neutral', icon: Icon }) {
  const isDown = deltaType === 'down';
  const isUp = deltaType === 'up';
  const DeltaIcon = isDown ? ArrowDownRight : ArrowUpRight;

  return (
    <section className="ops-card relative overflow-hidden px-4 py-3">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
      <div className="flex items-center gap-2 text-[11px] text-[var(--color-muted)]">
        {Icon ? (
          <span className="ops-icon-tile h-7 w-7">
            <Icon size={13} />
          </span>
        ) : null}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-[22px] font-medium leading-tight text-[var(--color-ink)]">{value}</div>
      {delta ? (
        <div
          className={[
            'mt-2 flex items-center gap-1 text-[11px]',
            isUp ? 'text-success' : '',
            isDown ? 'text-danger' : '',
            !isUp && !isDown ? 'text-[var(--color-muted)]' : '',
          ].join(' ')}
        >
          {isUp || isDown ? <DeltaIcon size={13} /> : null}
          {delta}
        </div>
      ) : null}
    </section>
  );
}
