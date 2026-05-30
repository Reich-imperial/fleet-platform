import api from './api';

export const getVehicles = async () => {
  const res = await api.get('/vehicles');
  return res.data;
};

export const getVehicle = async (id) => {
  const res = await api.get(`/vehicles/${id}`);
  return res.data;
};

export const createVehicle = async (data) => {
  const res = await api.post('/vehicles', data);
  return res.data;
};

export const updateVehicle = async (id, data) => {
  const res = await api.patch(`/vehicles/${id}`, data);
  return res.data;
};

export const deleteVehicle = async (id) => {
  const res = await api.delete(`/vehicles/${id}`);
  return res.data;
};
