import { NavLink } from 'react-router-dom';
import {
  AlertTriangle,
  ClipboardList,
  Fuel,
  Gauge,
  LayoutDashboard,
  Navigation,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const groups = [
  {
    title: 'Operations',
    items: [
      { label: 'Dashboard', to: '/', icon: LayoutDashboard },
      { label: 'Trips', to: '/trips', icon: Navigation, badge: 12, driver: true },
      { label: 'Vehicles', to: '/vehicles', icon: Truck },
      { label: 'Drivers', to: '/drivers', icon: Users, adminOnly: true },
    ],
  },
  {
    title: 'Tracking',
    items: [
      { label: 'Fuel Logs', to: '/fuel', icon: Fuel },
      { label: 'Maintenance', to: '/maintenance', icon: Wrench, badge: 4 },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Utilization', to: '/reports/utilization', icon: Gauge, adminOnly: true },
      { label: 'Alerts', to: '/reports/alerts', icon: AlertTriangle, badge: 7 },
      { label: 'Audit', to: '/reports/audit', icon: ClipboardList, adminOnly: true },
    ],
  },
];

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? 'operator';

  const visibleItems = (items) =>
    items.filter((item) => {
      if (role === 'driver') return item.driver || item.to === '/';
      if (item.adminOnly) return role === 'admin';
      return true;
    });

  return (
    <aside className="h-screen w-[200px] shrink-0 border-r border-[var(--color-line)] bg-[var(--color-surface)] text-[13px]">
      <div className="border-b border-[var(--color-line)] px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-input border border-primary/40 bg-primary text-white">
            <ShieldCheck size={16} />
          </span>
          <div>
            <div className="font-medium tracking-[0] text-[var(--color-ink)]">FleetOps</div>
            <div className="mt-0.5 text-[11px] text-[var(--color-muted)]">Petroleum Logistics</div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-input border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-2 py-1.5 text-[11px] text-[var(--color-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Live ops console
        </div>
      </div>

      <nav className="px-2 py-3">
        {groups.map((group) => {
          const items = visibleItems(group.items);
          if (!items.length) return null;

          return (
            <div key={group.title} className="mb-4">
              <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-[0] text-[var(--color-muted)]">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        [
                          'flex h-9 items-center gap-2 border-l-2 px-2.5 text-[var(--color-muted)]',
                          isActive
                            ? 'border-primary bg-primary/10 text-[var(--color-ink)]'
                            : 'border-transparent',
                        ].join(' ')
                      }
                    >
                      <Icon size={15} strokeWidth={1.8} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-badge bg-[var(--color-surface-strong)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted)]">
                          {item.badge}
                        </span>
                      ) : null}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
