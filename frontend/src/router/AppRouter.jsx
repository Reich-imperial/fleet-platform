import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { useAuthStore } from '../store/authStore';
import Dashboard from '../pages/Dashboard';
import Alerts from '../pages/Alerts';
import Drivers from '../pages/Drivers';
import FuelLogs from '../pages/FuelLogs';
import Login from '../pages/Login';
import Maintenance from '../pages/Maintenance';
import TripDetail from '../pages/TripDetail';
import Trips from '../pages/Trips';
import Vehicles from '../pages/Vehicles';

function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="trips" element={<Trips />} />
          <Route path="trips/:id" element={<TripDetail />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route
            path="drivers"
            element={
              <AdminRoute>
                <Drivers />
              </AdminRoute>
            }
          />
          <Route path="fuel" element={<FuelLogs />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="reports/alerts" element={<Alerts />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
