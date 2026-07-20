import api from './api';

export const getMaintenanceLogs = async (vehicleId) => {
  const response = await api.get('/maintenance', { params: vehicleId ? { vehicleId } : undefined });
  return response.data;
};

export const createMaintenanceLog = async (data) => {
  const response = await api.post('/maintenance', data);
  return response.data;
};
