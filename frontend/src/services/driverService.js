import api from './api';

export const getDrivers   = async ()       => { const r = await api.get('/drivers');         return r.data; };
export const getDriver    = async (id)     => { const r = await api.get(`/drivers/${id}`);   return r.data; };
export const createDriver = async (data)   => { const r = await api.post('/drivers', data);  return r.data; };
export const updateDriver = async (id, d)  => { const r = await api.patch(`/drivers/${id}`, d); return r.data; };
export const deleteDriver = async (id)     => { const r = await api.delete(`/drivers/${id}`); return r.data; };
