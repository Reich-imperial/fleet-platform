import api from './api';

// interceptor returns response.data = { success, data: { accessToken, user } }
// so res.data gives us { accessToken, user }
export const login  = async (creds) => { const r = await api.post('/auth/login', creds); return r.data; };
export const logout = async ()       => { await api.post('/auth/logout').catch(() => {}); };
export const refresh = async ()      => { const r = await api.post('/auth/refresh');      return r.data; };
