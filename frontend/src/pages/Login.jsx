import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    const form = new FormData(event.currentTarget);
    const email = form.get('email');
    const password = form.get('password');

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError('Unable to authenticate with those credentials.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-page)] px-4">
      <form className="w-full max-w-[360px] rounded-card border border-[var(--color-line)] bg-[var(--color-surface)] p-6" onSubmit={submit}>
        <div className="mb-6 text-center">
          <div className="text-[16px] font-medium text-[var(--color-ink)]">FleetOps Control</div>
          <div className="mt-1 text-[12px] text-[var(--color-muted)]">Petroleum logistics operations</div>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-[12px] text-[var(--color-muted)]">Email</span>
            <input className="ops-input w-full" name="email" type="email" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] text-[var(--color-muted)]">Password</span>
            <input className="ops-input w-full" name="password" type="password" required />
          </label>
        </div>
        {error ? <div className="mt-3 rounded-input bg-danger-light px-3 py-2 text-[12px] text-danger">{error}</div> : null}
        <button className="ops-button mt-4 w-full" type="submit">Sign in</button>
      </form>
    </div>
  );
}
