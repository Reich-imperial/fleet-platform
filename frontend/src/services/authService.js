export const login = async (credentials) => {
  console.log('authService.login placeholder', credentials);

  return {
    user: { id: 'ops-001', name: 'Depot Manager', role: 'admin', email: credentials.email },
    accessToken: 'placeholder-token',
  };
};

export const logout = async () => {
  console.log('authService.logout placeholder');
  return { success: true };
};

export const refresh = async () => {
  console.log('authService.refresh placeholder');
  return { accessToken: 'placeholder-token' };
};
