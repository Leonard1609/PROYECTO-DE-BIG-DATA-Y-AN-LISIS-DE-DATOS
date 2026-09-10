const SESSION_KEY = 'nexus_session';

export interface UserSession {
  email: string;
  usuario?: any;
  authenticatedAt: string;
}

export const authStorage = {
  get: (): UserSession | null => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      console.error("Error al leer sesión activa", e);
      authStorage.clear();
      return null;
    }
  },

  set: (email: string, usuario?: any) => {
    const sessionData: UserSession = {
      email,
      usuario,
      authenticatedAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  },

  clear: () => {
    localStorage.removeItem(SESSION_KEY);
  }
};