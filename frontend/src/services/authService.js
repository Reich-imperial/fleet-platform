import api from './api';

// api interceptor already unwraps response.data
// so api.post('/auth/login') returns { success, data: { accessToken, user } }
export const login = async (credentials) => {
  const res = await api.post('/auth/login', credentials);
  // res is already response.data because of the interceptor
  // shape: { success: true, data: { accessToken, user } }
  return res.data ?? res;
};

export const logout = async () => {
  await api.post('/auth/logout').catch(() => {});
};

export const refresh = async () => {
  const res = await api.post('/auth/refresh');
  return res.data ?? res;
};
