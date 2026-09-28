'use client';

import { useEffect } from 'react';
import { useAuthStore, type AuthState, type UserSessionData } from '@/stores/useAuthStore';

let hasStartedInit = false;

export function useAuth(): AuthState {
  const store = useAuthStore();

  useEffect(() => {
    if (!hasStartedInit && typeof window !== 'undefined') {
      hasStartedInit = true;
      store.initAuth();
    }
  }, [store]);

  return store;
}

export type { AuthState, UserSessionData };
