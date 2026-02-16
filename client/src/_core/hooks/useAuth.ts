export function useAuth() {
  const fakeUser = {
    id: "1",
    name: "Usuario",
    role: "Administrador",
  };

  return {
    user: fakeUser,
    loading: false,
    error: null,
    isAuthenticated: true,
    refresh: async () => {},
    logout: async () => {},
  };
}
