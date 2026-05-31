import api from './api';

export const getTrips     = async ()         => { const r = await api.get('/trips');                    return r.data; };
export const getTrip      = async (id)       => { const r = await api.get(`/trips/${id}`);             return r.data; };
export const createTrip   = async (data)     => { const r = await api.post('/trips', data);            return r.data; };
export const dispatchTrip = async (id)       => { const r = await api.post(`/trips/${id}/dispatch`);  return r.data; };
export const completeTrip = async (id)       => { const r = await api.post(`/trips/${id}/complete`);  return r.data; };
export const cancelTrip   = async (id, reason) => { const r = await api.post(`/trips/${id}/cancel`, { reason }); return r.data; };
