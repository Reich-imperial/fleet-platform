import { Bell, Moon, Plus, Search, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const titles = {
  '/': { title: 'Operations Dashboard', crumb: 'Operations / Dashboard' },
  '/trips': { title: 'Trips', crumb: 'Operations / Trips' },
  '/vehicles': { title: 'Vehicles', crumb: 'Operations / Vehicles' },
  '/drivers': { title: 'Drivers', crumb: 'Operations / Drivers' },
  '/fuel': { title: 'Fuel Logs', crumb: 'Tracking / Fuel' },
  '/maintenance': { title: 'Maintenance', crumb: 'Tracking / Maintenance' },
};

export default function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const meta = titles[pathname] ?? {
    title: pathname.startsWith('/trips/') ? 'Trip Detail' : 'Operations',
    crumb: pathname.startsWith('/trips/') ? 'Operations / Trips / Detail' : 'Operations',
  };

  const createRecord = () => {
    if (pathname.startsWith('/vehicles')) return navigate('/vehicles?new=vehicle');
    if (pathname.startsWith('/drivers')) return navigate('/drivers?new=driver');
    if (pathname.startsWith('/fuel')) return navigate('/fuel?new=fuel');
    if (pathname.startsWith('/maintenance')) return navigate('/maintenance?new=maintenance');
    return navigate('/trips?new=trip');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-6">
      <div>
        <div className="text-[11px] text-[var(--color-muted)]">{meta.crumb}</div>
        <h1 className="text-[16px] font-medium text-[var(--color-ink)]">{meta.title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="ops-button-secondary" aria-label="Search">
          <Search size={15} />
        </button>
        <button className="ops-button-secondary" aria-label="Notifications">
          <Bell size={15} />
        </button>
        <button
          className="ops-button-secondary"
          aria-label="Toggle dark mode"
          onClick={() => setDarkMode((value) => !value)}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button className="ops-button whitespace-nowrap" onClick={createRecord}>
          <Plus size={15} />
          New Record
        </button>
      </div>
    </header>
  );
}
