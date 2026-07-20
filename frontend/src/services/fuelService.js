import api from './api';

export const getFuelLogs = async (vehicleId) => {
  const response = await api.get('/fuel', { params: vehicleId ? { vehicleId } : undefined });
  return response.data;
};

export const createFuelLog = async (data) => {
  const response = await api.post('/fuel', data);
  return response.data;
};
