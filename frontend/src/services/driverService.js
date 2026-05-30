import api from './api';

export const getDrivers = async () => {
  const res = await api.get('/drivers');
  return res.data;
};

export const getDriver = async (id) => {
  const res = await api.get(`/drivers/${id}`);
  return res.data;
};

export const createDriver = async (data) => {
  const res = await api.post('/drivers', data);
  return res.data;
};

export const updateDriver = async (id, data) => {
  const res = await api.patch(`/drivers/${id}`, data);
  return res.data;
};
