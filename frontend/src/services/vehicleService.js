import api from './api';

// api interceptor returns response.data directly
// backend shape: { success: true, data: [...] }
// so api.get('/vehicles') returns { success, data }
// we return .data to get the array

export const getVehicles  = async ()       => { const r = await api.get('/vehicles');        return r.data; };
export const getVehicle   = async (id)     => { const r = await api.get(`/vehicles/${id}`);  return r.data; };
export const createVehicle = async (data)  => { const r = await api.post('/vehicles', data); return r.data; };
export const updateVehicle = async (id, d) => { const r = await api.patch(`/vehicles/${id}`, d); return r.data; };
export const deleteVehicle = async (id)    => { const r = await api.delete(`/vehicles/${id}`); return r.data; };
