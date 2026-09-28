import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import {
  apiRegister,
  apiLoginUser,
  apiLoginAdmin,
  apiGetMe,
  type AuthResponse,
} from '@/lib/api';

export interface UserSessionData {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  role?: 'user' | 'admin';
}

export interface AuthState {
  user: UserSessionData | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  initAuth: () => Promise<void>;
  loginUser: (email: string, password: string) => Promise<AuthResponse>;
  loginAdmin: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, displayName?: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}

let listenerAttached = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,

  initAuth: async () => {
    // 1. Immediately read from localStorage if running in browser
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('photobooth_auth_token');
      const savedUserStr = localStorage.getItem('photobooth_user');

      if (savedToken && savedUserStr) {
        try {
          const parsedUser: UserSessionData = JSON.parse(savedUserStr);
          if (parsedUser && parsedUser.id) {
            const isAdminRole = parsedUser.role === 'admin';
            set({
              user: parsedUser,
              token: savedToken,
              isLoading: false,
              isAuthenticated: true,
              isAdmin: isAdminRole,
            });

            // Refresh profile from backend /auth/me in background
            apiGetMe(savedToken)
              .then((profile) => {
                if (profile && profile.id) {
                  const verifiedRole = profile.role || parsedUser.role || 'user';
                  const verifiedUser: UserSessionData = {
                    ...parsedUser,
                    display_name: profile.display_name || parsedUser.display_name,
                    avatar_url: profile.avatar_url || parsedUser.avatar_url,
                    role: verifiedRole,
                  };
                  set({
                    user: verifiedUser,
                    isAdmin: verifiedRole === 'admin',
                  });
                  localStorage.setItem('photobooth_user', JSON.stringify(verifiedUser));
                }
              })
              .catch(() => {
                // If backend check fails (e.g. offline), keep existing parsed session
              });
          }
        } catch {
          localStorage.removeItem('photobooth_user');
        }
      }
    }

    // 2. Set up Supabase auth listener once
    if (!listenerAttached && typeof window !== 'undefined') {
      listenerAttached = true;
      const supabase = createClient();

      supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (currentSession) {
          const u = currentSession.user;
          const current = get();

          // Determine role carefully: never downgrade an admin to user
          let resolvedRole: 'user' | 'admin' = 'user';
          if (current.user?.id === u.id && current.user.role === 'admin') {
            resolvedRole = 'admin';
          } else {
            const stored = localStorage.getItem('photobooth_user');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                if (parsed.id === u.id && parsed.role === 'admin') {
                  resolvedRole = 'admin';
                }
              } catch {}
            }
          }

          const userObj: UserSessionData = {
            id: u.id,
            email: u.email || '',
            display_name: u.user_metadata?.display_name || current.user?.display_name || '',
            role: resolvedRole,
          };

          set({
            user: userObj,
            token: currentSession.access_token,
            isLoading: false,
            isAuthenticated: true,
            isAdmin: resolvedRole === 'admin',
          });

          localStorage.setItem('photobooth_auth_token', currentSession.access_token);
          localStorage.setItem('photobooth_user', JSON.stringify(userObj));

          // Verify role from backend /auth/me
          try {
            const profile = await apiGetMe(currentSession.access_token);
            if (profile && profile.id) {
              const verifiedRole = profile.role || resolvedRole;
              const verifiedUser: UserSessionData = {
                ...userObj,
                display_name: profile.display_name || userObj.display_name,
                avatar_url: profile.avatar_url || userObj.avatar_url,
                role: verifiedRole,
              };
              set({
                user: verifiedUser,
                isAdmin: verifiedRole === 'admin',
              });
              localStorage.setItem('photobooth_user', JSON.stringify(verifiedUser));
            }
          } catch {}
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('photobooth_auth_token');
          localStorage.removeItem('photobooth_user');
          set({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
          });
        }
      });

      // If localStorage had no active session, inspect Supabase getSession
      const { data } = await supabase.auth.getSession();
      if (!get().isAuthenticated && data?.session) {
        const u = data.session.user;
        let role: 'user' | 'admin' = (u.app_metadata?.role as 'user' | 'admin') || 'user';

        try {
          const profile = await apiGetMe(data.session.access_token);
          if (profile?.role) {
            role = profile.role;
          }
        } catch {}

        const userObj: UserSessionData = {
          id: u.id,
          email: u.email || '',
          display_name: u.user_metadata?.display_name || '',
          role,
        };

        set({
          user: userObj,
          token: data.session.access_token,
          isLoading: false,
          isAuthenticated: true,
          isAdmin: role === 'admin',
        });
        localStorage.setItem('photobooth_auth_token', data.session.access_token);
        localStorage.setItem('photobooth_user', JSON.stringify(userObj));
      } else if (!get().isAuthenticated) {
        set({ isLoading: false });
      }
    } else {
      if (!get().isAuthenticated) {
        set({ isLoading: false });
      }
    }
  },

  loginUser: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await apiLoginUser({ email, password });
      const userData: UserSessionData = {
        id: res.user.id,
        email: res.user.email,
        display_name: res.user.display_name,
        role: res.user.role,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('photobooth_auth_token', res.access_token);
        localStorage.setItem('photobooth_user', JSON.stringify(userData));
      }

      set({
        user: userData,
        token: res.access_token,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: userData.role === 'admin',
      });

      try {
        if (res.access_token && res.refresh_token) {
          const supabase = createClient();
          await supabase.auth.setSession({
            access_token: res.access_token,
            refresh_token: res.refresh_token,
          });
        }
      } catch (e) {
        console.warn('Supabase setSession sync warning:', e);
      }

      return res;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  loginAdmin: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const res = await apiLoginAdmin({ email, password });
      const userData: UserSessionData = {
        id: res.user.id,
        email: res.user.email,
        display_name: res.user.display_name,
        role: 'admin',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('photobooth_auth_token', res.access_token);
        localStorage.setItem('photobooth_user', JSON.stringify(userData));
      }

      set({
        user: userData,
        token: res.access_token,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: true,
      });

      try {
        if (res.access_token && res.refresh_token) {
          const supabase = createClient();
          await supabase.auth.setSession({
            access_token: res.access_token,
            refresh_token: res.refresh_token,
          });
        }
      } catch (e) {
        console.warn('Supabase setSession sync warning:', e);
      }

      return res;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email: string, password: string, displayName?: string) => {
    set({ isLoading: true });
    try {
      const res = await apiRegister({ email, password, display_name: displayName });
      if (res.access_token) {
        const userData: UserSessionData = {
          id: res.user.id,
          email: res.user.email,
          display_name: res.user.display_name,
          role: res.user.role || 'user',
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem('photobooth_auth_token', res.access_token);
          localStorage.setItem('photobooth_user', JSON.stringify(userData));
        }

        set({
          user: userData,
          token: res.access_token,
          isLoading: false,
          isAuthenticated: true,
          isAdmin: userData.role === 'admin',
        });

        try {
          if (res.access_token && res.refresh_token) {
            const supabase = createClient();
            await supabase.auth.setSession({
              access_token: res.access_token,
              refresh_token: res.refresh_token,
            });
          }
        } catch (e) {
          console.warn('Supabase setSession sync warning:', e);
        }
      } else {
        set({ isLoading: false });
      }
      return res;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  signOut: async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('photobooth_auth_token');
        localStorage.removeItem('photobooth_user');
      }
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    set({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
    });
  },
}));
