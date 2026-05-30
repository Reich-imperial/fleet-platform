import api from './api';

export const getTrips = async () => {
  const res = await api.get('/trips');
  return res.data;
};

export const getTrip = async (id) => {
  const res = await api.get(`/trips/${id}`);
  return res.data;
};

export const createTrip = async (data) => {
  const res = await api.post('/trips', data);
  return res.data;
};

export const dispatchTrip = async (id) => {
  const res = await api.post(`/trips/${id}/dispatch`);
  return res.data;
};

export const completeTrip = async (id) => {
  const res = await api.post(`/trips/${id}/complete`);
  return res.data;
};

export const cancelTrip = async (id, reason) => {
  const res = await api.post(`/trips/${id}/cancel`, { reason });
  return res.data;
};
