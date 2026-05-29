import { login as loginService, logout as logoutService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, token, setAuth, clearAuth } = useAuthStore();

  const login = async (credentials) => {
    const data = await loginService(credentials);
    setAuth(data.user, data.accessToken);
    return data;
  };

  const logout = async () => {
    await logoutService();
    clearAuth();
  };

  return {
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };
};
